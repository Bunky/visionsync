import torch
import sys
import redis
import numpy as np
import cv2 as cv
import matplotlib.pyplot as plt
from scipy.signal import find_peaks, peak_widths
# import tensorflow_hub as hub
import json
import time

import tensorflow as tf
from matplotlib import pyplot as plt
from matplotlib.collections import LineCollection
import matplotlib.patches as patches

import utilties as utils
import stages

# resolution = (1920, 1080)
resolution = (640, 360)
poses = False

def main():
  matchId = sys.argv[1]
  
  # Load models
  model = torch.hub.load('ultralytics/yolov5', 'custom', path='processor/python/model/best.pt')
  # module = hub.load("https://tfhub.dev/google/movenet/singlepose/lightning/4")

  # Connect to redis
  r = redis.Redis(host='localhost', port=6379, db=0)

  # Setup camera  
  threaded_camera = utils.ThreadedCamera(f"http://d1pu8bxuwsqdvz.cloudfront.net/{matchId}.mp4")

  # module = None
  # if poses == True:
  #   module = hub.load("https://tfhub.dev/google/movenet/singlepose/lightning/4")
  # input_size = 192
  
  # Stores last detected homography matrix
  last_matrix = False

  detections_limit_time = int(round(time.time() * 1000))
  positions_limit_time = int(round(time.time() * 1000))
  while True:
    try:
      # Get latest settings
      settings = r.json().get(f"{matchId}:jsondata")

      # Get latest frame     
      frame = threaded_camera.get_frame()
      
      message = []
      message.append({
        "type": "live",
        "data": utils.get_base64_from_frame(frame)
      })
      
      # Player detection with YOLOv5 custom model
      detections, detections_frame = stages.detect_players(settings, frame, model)

      # Auto colour Processing
      # h, s, v = get_histogram(frame)

      # Computer vision for line detection and homography
      crowd_mask, crowd_mask_frame = stages.generate_crowd_mask(settings, frame)
      player_mask, player_mask_frame = stages.generate_player_mask(settings, frame)
      canny, canny_frame = stages.generate_canny(settings, frame, crowd_mask, player_mask)
      lines, lines_frame = stages.generate_lines(settings, frame, canny)
      # circles, circles_frame = stages.generate_circles(settings, frame, canny)
      intersections, intersections_frame = stages.generate_intersections(settings, frame, lines)
      biv_detections, homography_frame, matrix = stages.apply_homography(settings, frame, intersections, detections, last_matrix)
      
      last_matrix = matrix
          
      if settings["preview"]["enabled"]:
        if settings["preview"]["stage"] == "detections":
          message.append({
            "type": "preview",
            "data": utils.get_base64_from_frame(detections_frame)
          })
        elif settings["preview"]["stage"] == "crowdMask":
          message.append({
            "type": "preview",
            "data": utils.get_base64_from_frame(crowd_mask_frame)
          })
        elif settings["preview"]["stage"] == "playerMask":
          message.append({
            "type": "preview",
            "data": utils.get_base64_from_frame(player_mask_frame)
          })
        elif settings["preview"]["stage"] == "canny":
          message.append({
            "type": "preview",
            "data": utils.get_base64_from_frame(canny_frame)
          })
        elif settings["preview"]["stage"] == "lines":
          message.append({
            "type": "preview",
            "data": utils.get_base64_from_frame(lines_frame)
          })
        # elif settings["preview"]["stage"] == "circles":
        #   message.append({
        #     "type": "preview",
        #     "data": utils.get_base64_from_frame(circles_frame)
        #   })
        elif settings["preview"]["stage"] == "intersections":
          message.append({
            "type": "preview",
            "data": utils.get_base64_from_frame(intersections_frame)
          })
        elif settings["preview"]["stage"] == "homography":
          message.append({
            "type": "preview",
            "data": utils.get_base64_from_frame(homography_frame)
          })
          
      current_ms = int(round(time.time() * 1000))
      # message.append({
      #   "type": "info",
      #   "data": current_ms # f"FPS: {str(1.0 / (time.time() - start_time))}"
      # })

      if detections_limit_time + 1000 < current_ms:
        detections_message = []
        for detection in detections:
          detections_message.append(detection.to_json())

        message.append({
          "type": "detections",
          "data": detections_message
        })
        detections_limit_time = current_ms

      if positions_limit_time + 200 < current_ms:
        message.append({
          "type": "positions",
          "data": json.dumps(biv_detections)
        })
        positions_limit_time = current_ms

      sys.stdout.write(json.dumps(message))
      sys.stdout.flush()

    except AttributeError:
      pass

# Dictionary that maps from joint names to keypoint indices.
KEYPOINT_DICT = {
  'nose': 0,
  'left_eye': 1,
  'right_eye': 2,
  'left_ear': 3,
  'right_ear': 4,
  'left_shoulder': 5,
  'right_shoulder': 6,
  'left_elbow': 7,
  'right_elbow': 8,
  'left_wrist': 9,
  'right_wrist': 10,
  'left_hip': 11,
  'right_hip': 12,
  'left_knee': 13,
  'right_knee': 14,
  'left_ankle': 15,
  'right_ankle': 16
}
# Maps bones to a matplotlib color name.
KEYPOINT_EDGE_INDS_TO_COLOR = {
  (0, 1): 'm',
  (0, 2): 'c',
  (1, 3): 'm',
  (2, 4): 'c',
  (0, 5): 'm',
  (0, 6): 'c',
  (5, 7): 'm',
  (7, 9): 'm',
  (6, 8): 'c',
  (8, 10): 'c',
  (5, 6): 'y',
  (5, 11): 'm',
  (6, 12): 'c',
  (11, 12): 'y',
  (11, 13): 'm',
  (13, 15): 'm',
  (12, 14): 'c',
  (14, 16): 'c'
}

def _keypoints_and_edges_for_display(keypoints_with_scores, height, width, keypoint_threshold=0.11):
  keypoints_all = []
  keypoint_edges_all = []
  edge_colors = []
  num_instances, _, _, _ = keypoints_with_scores.shape
  for idx in range(num_instances):
    kpts_x = keypoints_with_scores[0, idx, :, 1]
    kpts_y = keypoints_with_scores[0, idx, :, 0]
    kpts_scores = keypoints_with_scores[0, idx, :, 2]
    kpts_absolute_xy = np.stack(
        [width * np.array(kpts_x), height * np.array(kpts_y)], axis=-1)
    kpts_above_thresh_absolute = kpts_absolute_xy[
        kpts_scores > keypoint_threshold, :]
    keypoints_all.append(kpts_above_thresh_absolute)

    for edge_pair, color in KEYPOINT_EDGE_INDS_TO_COLOR.items():
      if (kpts_scores[edge_pair[0]] > keypoint_threshold and
          kpts_scores[edge_pair[1]] > keypoint_threshold):
        x_start = kpts_absolute_xy[edge_pair[0], 0]
        y_start = kpts_absolute_xy[edge_pair[0], 1]
        x_end = kpts_absolute_xy[edge_pair[1], 0]
        y_end = kpts_absolute_xy[edge_pair[1], 1]
        line_seg = np.array([[x_start, y_start], [x_end, y_end]])
        keypoint_edges_all.append(line_seg)
        edge_colors.append(color)
  if keypoints_all:
    keypoints_xy = np.concatenate(keypoints_all, axis=0)
  else:
    keypoints_xy = np.zeros((0, 17, 2))

  if keypoint_edges_all:
    edges_xy = np.stack(keypoint_edges_all, axis=0)
  else:
    edges_xy = np.zeros((0, 2, 2))
  return keypoints_xy, edges_xy, edge_colors

def draw_pose_on_image(image, keypoints_with_scores, crop_region=None, close_figure=False, output_image_height=None):
  height, width, channel = image.shape
  aspect_ratio = float(width) / height
  fig, ax = plt.subplots(figsize=(12 * aspect_ratio, 12))
  # To remove the huge white borders
  fig.tight_layout(pad=0)
  ax.margins(0)
  ax.set_yticklabels([])
  ax.set_xticklabels([])
  plt.axis('off')

  im = ax.imshow(image)
  line_segments = LineCollection([], linewidths=(4), linestyle='solid')
  ax.add_collection(line_segments)
  # Turn off tick labels
  scat = ax.scatter([], [], s=60, color='#FF1493', zorder=3)

  (keypoint_locs, keypoint_edges,
   edge_colors) = _keypoints_and_edges_for_display(
       keypoints_with_scores, height, width)

  line_segments.set_segments(keypoint_edges)
  line_segments.set_color(edge_colors)
  if keypoint_edges.shape[0]:
    line_segments.set_segments(keypoint_edges)
    line_segments.set_color(edge_colors)
  if keypoint_locs.shape[0]:
    scat.set_offsets(keypoint_locs)

  if crop_region is not None:
    xmin = max(crop_region['x_min'] * width, 0.0)
    ymin = max(crop_region['y_min'] * height, 0.0)
    rec_width = min(crop_region['x_max'], 0.99) * width - xmin
    rec_height = min(crop_region['y_max'], 0.99) * height - ymin
    rect = patches.Rectangle(
        (xmin,ymin),rec_width,rec_height,
        linewidth=1,edgecolor='b',facecolor='none')
    ax.add_patch(rect)

  fig.canvas.draw()
  image_from_plot = np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
  image_from_plot = image_from_plot.reshape(
      fig.canvas.get_width_height()[::-1] + (3,))
  plt.close(fig)
  if output_image_height is not None:
    output_image_width = int(output_image_height / height * width)
    image_from_plot = cv.resize(
        image_from_plot, dsize=(output_image_width, output_image_height),
         interpolation=cv.INTER_CUBIC)
  return image_from_plot

def movenet(image, module):
  model = module.signatures['serving_default']

  image = tf.cast(image, dtype=tf.int32)
  outputs = model(image)
  keypoints_with_scores = outputs['output_0'].numpy()

  return keypoints_with_scores

# def apply_homography(frame, matrix, transformed_detections, src_pts):    
#   # Temporary birds-eye-view output
#   biv_frame = cv.imread('templines.png')
#   biv_frame = cv.resize(biv_frame, resolution)
#   for detection in transformed_detections:
#     if detection["class"] == 0:
#       cv.circle(biv_frame, (int(detection["x"]), int(detection["y"])), 3, detection['colour'], 4, cv.LINE_AA)
#     elif detection["class"] == 1:
#       cv.circle(biv_frame, (int(detection["x"]), int(detection["y"])), 3, detection['colour'], 4, cv.LINE_AA)
#     elif detection["class"] == 2:
#       cv.circle(biv_frame, (int(detection["x"]), int(detection["y"])), 3, detection['colour'], 4, cv.LINE_AA)

def get_range(hist, colour):
  # Get peaks -  add sliders to params to see how they affect results :)
  x = []
  for pnt in hist:
    x.append(pnt[0])
  x = np.array(x)
  
  prominence = cv.getTrackbarPos("prominence", "FindPeaks")
  width = cv.getTrackbarPos("width", "FindPeaks")
  distance = cv.getTrackbarPos("distance", "FindPeaks")
  height = cv.getTrackbarPos("height", "FindPeaks")
  threshold = cv.getTrackbarPos("threshold", "FindPeaks")
  rel_height = cv.getTrackbarPos("rel_height", "FindPeaks")
  
  # Find peaks
  peaks, properties = find_peaks(x, height, threshold, distance, prominence, width)
  
  # Find peak widths
  results_full = peak_widths(x, peaks, rel_height / 100)
  min_val = results_full[2] # left point of peak
  max_val = results_full[3] # right point of peak
  
  # print(results_full)
  
  # plt.plot(peaks, x[peaks], "x")
  # plt.vlines(x=peaks, ymin=x[peaks] - properties["prominences"], ymax=x[peaks], color="C1")
  # plt.hlines(y=properties["width_heights"], xmin=properties["left_ips"], xmax=properties["right_ips"], color="C1")
  # plt.hlines(y=properties["width_heights"], xmin=properties["left_bases"], xmax=properties["right_bases"], color="C1")

  plt.vlines(x=min_val, ymin=0, ymax=x[peaks], color=colour)
  plt.vlines(x=max_val, ymin=0, ymax=x[peaks], color=colour)
  plt.axvspan(min_val, max_val, color=colour, alpha=0.5, lw=0)

  # plt.hlines(*results_full[1:], color="C3")
  
  return [min_val, max_val]

tmp = False
def get_histogram(frame): 
  # [256] is frequency bin, the lower these are, faster it runs, realistically i dont need to be checking each 256, so for speed only check x
  hist_h = cv.calcHist([frame[:,:,0]], [0], None, [256], [0, 256]) 
  hist_s = cv.calcHist([frame[:,:,1]], [0], None, [256], [0, 256])
  hist_v = cv.calcHist([frame[:,:,2]], [0], None, [256], [0, 256])
 
  global tmp
  if tmp:
    tmp = False   
    # plt.ion()
    # plt.legend()
    # plt.show()
  else:
    # plt.clf()

    # Get range of peaks for green
    h_range = get_range(hist_h, 'c')
    s_range = get_range(hist_s, 'm')
    v_range = get_range(hist_v, 'y')
    
    # Plot graphs     
    # plt.plot(hist_h, color='c', label="h")
    # plt.plot(hist_s, color='m', label="s")
    # plt.plot(hist_v, color='y', label="v")
    # plt.draw()
    # plt.pause(0.001)
    
    # Set trackbar positions (for now instead of parsing to masks)
    cv.setTrackbarPos("Hue Min", "CrowdMask Controls", int(h_range[0]))
    cv.setTrackbarPos("Hue Max", "CrowdMask Controls", int(h_range[1]))
    # cv.setTrackbarPos("Sat Min", "CrowdMask Controls", int(s_range[0]))
    # cv.setTrackbarPos("Sat Max", "CrowdMask Controls", int(s_range[1]))
    # cv.setTrackbarPos("Val Min", "CrowdMask Controls", int(v_range[0]))
    # cv.setTrackbarPos("Val Max", "CrowdMask Controls", int(v_range[1]))
    
    return h_range, s_range, v_range
  
    return False
    
main()