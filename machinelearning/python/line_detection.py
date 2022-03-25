import numpy as np
import cv2 as cv
import math
import matplotlib.pyplot as plt
from scipy.signal import find_peaks, peak_widths
import itertools
from torch import threshold_
import time
import torch
from bounding_box import bounding_box as bb

import tensorflow as tf
import tensorflow_hub as hub
from matplotlib import pyplot as plt
from matplotlib.collections import LineCollection
import matplotlib.patches as patches

# resolution = (1920, 1080)
resolution = (640, 480)
poses = False

def main():
  create_windows()
  video = get_source()
  
  # Load models
  model = torch.hub.load('ultralytics/yolov5', 'custom', path='../../../../Data/training/yolov5/runs/train/exp13/weights/best.pt')
  module = None
  if poses == True:
    module = hub.load("https://tfhub.dev/google/movenet/singlepose/lightning/4")
  input_size = 192
  
  last_matrix = False

  while True:
    start_time = time.time()
    ret, frame = video.read()
   
    # Processing
    # if cv.waitKey(1) == ord("w"):
    # h, s, v = get_histogram(frame)

    crowd_mask = generate_crowd_mask(frame)
    player_mask = generate_player_mask(frame)
    
    grey_frame = turn_grey(frame)
    blur_frame = blur(grey_frame)
    
    # masked_frame = add_masks(blur_frame, crowd_mask, player_mask)
    # thresh_frame = threshold(masked_frame)
    # tophat = generate_tophat(blur_frame, crowd_mask, player_mask)
    
    canny_edged = generate_canny(blur_frame)
    masked_canny = add_masks(canny_edged, crowd_mask, player_mask)
    
    # eroded = erode(masked_canny)
    # dilated = dilate(masked_canny)
    closed = closing(masked_canny)
    opened = opening(closed)
    dilated = dilate(opened)
    eroded = erode(dilated)
    
    lines = hough(eroded)
    
    # Player detection
    frame, detections = detect_players(frame, model, module, input_size)
    
    if lines is not None:
      # Filter/prune lines (combines lines that are duplicates etc)
      lines = prune_lines(lines)      
      
      frame_with_lines, v_lines, h_lines = generate_lines(frame, lines)
      frame_with_intersections, intersections = generate_intersections(frame_with_lines, v_lines, h_lines)
     
      matrix, src_pts = get_homography(intersections)
      if len(src_pts) > 0:
        transformed_detections = transform_detections(detections, matrix)
        apply_homography(frame, matrix, transformed_detections, src_pts)
        last_matrix = matrix
      elif type(last_matrix) != bool:
        transformed_detections = transform_detections(detections, last_matrix)
        apply_homography(frame, last_matrix, transformed_detections, src_pts)

      # Print debug info
      cv.putText(frame, f"Lines: {str(len(v_lines) + len(h_lines))}", (25, 430), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 128, 255), 1, cv.LINE_AA)
      cv.putText(frame, f"Intersections: {str(len(intersections))}", (25, 445), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 128, 128), 1, cv.LINE_AA)
      cv.putText(frame, f"FPS: {str(1.0 / (time.time() - start_time))}", (25, 460), cv.FONT_HERSHEY_SIMPLEX, 0.5, (128, 128, 255), 1, cv.LINE_AA)
     
      cv.imshow("Result", frame_with_intersections)
    else:
      # Print debug info
      cv.putText(frame, f"FPS: {str(1.0 / (time.time() - start_time))}", (25, 460), cv.FONT_HERSHEY_SIMPLEX, 0.5, (128, 128, 255), 1, cv.LINE_AA)

      cv.imshow("Result", frame)
                      
    if cv.waitKey(1) == ord("q"):
      break

  # When everything done, release the capture
  video.release()
  cv.destroyAllWindows()

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

def apply_homography(frame, matrix, transformed_detections, src_pts):
  warped_frame = cv.warpPerspective(frame, matrix, dsize=resolution, flags=cv.INTER_NEAREST, borderMode=cv.BORDER_CONSTANT, borderValue=0)
  tmp_draw_targets(warped_frame)
  
  for detection in transformed_detections:
    cv.circle(warped_frame, (int(detection["x"]), int(detection["y"])), 5, (0, 0, 255), 4, cv.LINE_AA)
    
  # Temporary birds-eye-view output
  biv_frame = cv.imread('templines.png')
  biv_frame = cv.resize(biv_frame, resolution)
  for detection in transformed_detections:
    if detection["class"] == 0:
      cv.circle(biv_frame, (int(detection["x"]), int(detection["y"])), 3, detection['colour'], 4, cv.LINE_AA)
    elif detection["class"] == 1:
      cv.circle(biv_frame, (int(detection["x"]), int(detection["y"])), 3, detection['colour'], 4, cv.LINE_AA)
    elif detection["class"] == 2:
      cv.circle(biv_frame, (int(detection["x"]), int(detection["y"])), 3, detection['colour'], 4, cv.LINE_AA)

  frame_compare = cv.hconcat([frame, warped_frame, biv_frame])
  for i in range(len(src_pts)):
    pt1 = np.array([src_pts[i][0], src_pts[i][1], 1])
    pt1 = pt1.reshape(3, 1)
    pt2 = np.dot(matrix, pt1)
    pt2 = pt2/pt2[2]
    end = (int(frame.shape[1] + pt2[0]), int(pt2[1]))
    cv.line(frame_compare, tuple([int(j) for j in src_pts[i]]), end, (255, 255, 255), 2, cv.LINE_AA)
  
  cv.imshow("Homography", frame_compare)

def transform_detections(detections, matrix):
  transformed_detection = []
  for detection in detections:
    # Use ymax and xcentre as the point at the players feet
    feet = np.array([[[detection['xmin'] + ((detection['xmax'] - detection['xmin']) / 2), detection['ymax']]]], dtype=np.float32)
    feet_converted = cv.perspectiveTransform(feet, matrix)

    transformed_detection.append({
      "class": detection['class'],
      "colour": detection['colour'],
      "x": feet_converted[0][0][0],
      "y": feet_converted[0][0][1]
    })
    
  return transformed_detection

def classify_players(frame, detections, module, input_size):
  classified_detections = []
  temp_detection = []
  temp_pose = []
  
  for index, row in detections.iterrows():
    if row['class'] == 0:
      # Crop the frame to bounding box
      cropped_frame = frame[int(row['ymin']):int(row['ymax']), int(row['xmin']):int(row['xmax'])]
      
      # Player pitch mask
      hue_min = cv.getTrackbarPos("Hue Min", "Players")
      hue_max = cv.getTrackbarPos("Hue Max", "Players")
      sat_min = cv.getTrackbarPos("Sat Min", "Players")
      sat_max = cv.getTrackbarPos("Sat Max", "Players")
      val_min = cv.getTrackbarPos("Val Min", "Players")
      val_max = cv.getTrackbarPos("Val Max", "Players")
      
      lower = np.array([hue_min, sat_min, val_min])
      upper = np.array([hue_max, sat_max, val_max])

      mask = cv.inRange(cropped_frame, lower, upper)
      output = cv.bitwise_and(cropped_frame, cropped_frame, mask=mask)

      # Get average colour
      mean = cv.mean(cropped_frame, mask=mask)
      # row["colour"] = (mean[0], mean[1], mean[2])
      
      # Home team
      home_blue_min = cv.getTrackbarPos("home_blue_min", "Players")
      home_green_min = cv.getTrackbarPos("home_green_min", "Players")
      home_red_min = cv.getTrackbarPos("home_red_min", "Players")
      home_blue_max = cv.getTrackbarPos("home_blue_max", "Players")
      home_green_max = cv.getTrackbarPos("home_green_max", "Players")
      home_red_max = cv.getTrackbarPos("home_red_max", "Players")
      
      # Away team
      away_blue_min = cv.getTrackbarPos("away_blue_min", "Players")
      away_green_min = cv.getTrackbarPos("away_green_min", "Players")
      away_red_min = cv.getTrackbarPos("away_red_min", "Players")
      away_blue_max = cv.getTrackbarPos("away_blue_max", "Players")
      away_green_max = cv.getTrackbarPos("away_green_max", "Players")
      away_red_max = cv.getTrackbarPos("away_red_max", "Players")
      
      # If mean colour is within threshold range for home team parameters
      if home_blue_min < mean[0] < home_blue_max and home_green_min < mean[1] < home_green_max and home_red_min < mean[2] < home_red_max:
        row["colour"] = (0, 0, 255)
      elif away_blue_min < mean[0] < away_blue_max and away_green_min < mean[1] < away_green_max and away_red_min < mean[2] < away_red_max:
        row["colour"] = (255, 0, 0)
      else:
        row["colour"] = (0, 255, 255) # Likely the refs - so yellow

      # Movenet
      if poses == True:
        input_image = tf.expand_dims(cropped_frame, axis=0)
        input_image = tf.image.resize_with_pad(input_image, input_size, input_size)

        keypoints_with_scores = movenet(input_image, module)
        
        movenet_image = tf.expand_dims(cropped_frame, axis=0)
        movenet_image = tf.cast(tf.image.resize_with_pad(movenet_image, 400, 400), dtype=tf.int32)
        output_overlay = draw_pose_on_image(np.squeeze(movenet_image.numpy(), axis=0), keypoints_with_scores)
        temp_pose.append(output_overlay)

      # Output for preview
      output = cv.resize(output, (50, 100))
      temp_detection.append(output)

    elif row['class'] == 1: # ball
      row["colour"] = (255, 255, 255)
    elif row['class'] == 2: # goal
      row["colour"] = (0, 255, 0)
    
    classified_detections.append(row)
    
  # Show all players to help aid with filtering
  def concat_tile(im_list_2d, row_size):
    return cv.vconcat([cv.resize(cv.hconcat(im_list_h), row_size) for im_list_h in im_list_2d])
  
  def chunks(lst, n):
    for i in range(0, len(lst), n):
      yield lst[i:i + n]

  detections_list = list(chunks(temp_detection, 5))
  im_tile = concat_tile(detections_list, (500, 100))
  cv.imshow("Detected Players", im_tile)
  
  if poses == True:
    detections_list = list(chunks(temp_pose, 3))
    im_tile = concat_tile(detections_list, (1200, 400))
    cv.imshow("Player Poses", im_tile)

  return classified_detections  

def detect_players(frame, model, module, input_size):
  detections = model(frame)
  detections = detections.pandas().xyxy[0]    
  detections = classify_players(frame, detections, module, input_size)
  
  for detection in detections:
    bb.add(frame, detection['xmin'], detection['ymin'], detection['xmax'], detection['ymax'], detection['name'], "purple")
    cv.circle(frame, (int(detection['xmin'] + ((detection['xmax'] - detection['xmin']) / 2)), int(detection["ymax"])), 2, detection['colour'], 2, cv.LINE_AA)
  
  return frame, detections
  
def tmp_draw_targets(frame):
  global intersection_dict
  
  for intersection in intersection_dict:
    cv.circle(frame, (int(intersection["x"] * resolution[0]), int(intersection["y"] * resolution[1])), 4, (0, 255, 255), 5, cv.LINE_AA)
  
  return frame

def get_homography(intersections):
  if len(intersections) < 4:
    return False, []
    
  # Create src points array
  source = []
  for intersection in intersections:
    source.append([intersection["x"], intersection["y"]])
  source = np.array(source)
  
  # Create dst points array
  destination = []
  for intersection in intersections:
    temp_dest = []
    for int_dict in intersection_dict:
      if int_dict["id"] == intersection["id"]:
        temp_dest = [int_dict["x"] * resolution[0], int_dict["y"] * resolution[1]]
        destination.append(temp_dest)
        # break
    
    if len(temp_dest) == 0:
      return False, []
  destination = np.array(destination)

  # Make sure destination points are not all on same axis
  tmp_x_axis_check = False
  tmp_y_axis_check = False
  tmp_x = destination[0][0]
  tmp_y = destination[0][1]
  for pnt in destination:
    if pnt[0] != tmp_x:
      tmp_x_axis_check = True
    if pnt[1] != tmp_y:
      tmp_y_axis_check = True
      
    tmp_x = pnt[0]
    tmp_y = pnt[1]
    
  if tmp_x_axis_check == False or tmp_y_axis_check == False:
    return False, []

  # Reshape for homography
  src_pts = np.array(source).reshape(-1,1,2)
  dst_pts = np.array(destination).reshape(-1,1,2)
  
  H, _ = cv.findHomography(src_pts, dst_pts)
  
  return H, source

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
  
def line_intersection(line1, line2):
  line1 = [line1["point1"], line1["point2"]]
  line2 = [line2["point1"], line2["point2"]]

  xdiff = (line1[0][0] - line1[1][0], line2[0][0] - line2[1][0])
  ydiff = (line1[0][1] - line1[1][1], line2[0][1] - line2[1][1])

  def det(a, b):
    return a[0] * b[1] - a[1] * b[0]

  div = det(xdiff, ydiff)
  if div == 0:
    return False # Lines do not intersect

  d = (det(*line1), det(*line2))
  x = det(d, xdiff) / div
  y = det(d, ydiff) / div
  
  # # Point ouside of boundaries - removed temporarily
  # if 0 < x < resolution[0] and 0 < y < resolution[1]:
  # Filter out points over 2x away from viewport
  if -resolution[0] < x < resolution[0] * 2 and -resolution[1] < y < resolution[1] * 2:
    return [x, y]
  else:
    return False

def generate_intersections(frame, v_lines, h_lines):
  intersections = []
  
  for vline in v_lines:
    for hline in h_lines:
      intersection = line_intersection(vline, hline)
      if intersection is not False:
        
        if vline["angle"] > 0: 
          v_side = 1
        else:
          v_side = 0

        # Work out horizontal side (left of right)
        if vline["angle"] > 0 and hline["angle"] < 0: 
          h_side = 0
        else:
          h_side = 1
        
        for int_dict in intersection_dict:
          if int_dict["v_line"] == vline["id"] and int_dict["h_line"] == hline["id"]:
            if int_dict["v_side"] == v_side and int_dict["h_side"] == h_side:             
              intersections.append({
                "id": int_dict["id"],
                "v_line": vline["id"],
                "h_line": hline["id"],
                "h_side": h_side,
                "v_side": v_side,
                "x": intersection[0],
                "y": intersection[1]
              })
              break
        
  # Draw intersections
  for intersection in intersections:
    cv.circle(frame, (int(intersection["x"]), int(intersection["y"])), 5, (0, 255, 255), 2, cv.LINE_AA)
    cv.putText(frame, str(intersection["id"]), (int(intersection["x"]), int(intersection["y"])), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2, cv.LINE_AA)
  
  return frame, intersections
 
def classify_line(line):
  x1, y1, x2, y2 = line[0]
    
  line_midpoint = ((x1 + x2) / 2, (y1 + y2) / 2) 
  length_of_line = math.hypot(x2-x1, y2-y1)
  angle_of_line = math.degrees(math.atan2(-(y2-y1), x2-x1))
  if angle_of_line < 0:
    norm_angle_of_line = angle_of_line * -1
  else:
    norm_angle_of_line = angle_of_line
    
  # Horizontal/Vertical classification
  if norm_angle_of_line < 15:
    direction = 1
  else:
    direction = 0

  # Center Line
  centre_min_length = cv.getTrackbarPos("centre_min_length", "Result Controls")
  centre_max_length = cv.getTrackbarPos("centre_max_length", "Result Controls")
  centre_min_angle = cv.getTrackbarPos("centre_min_angle", "Result Controls")
  centre_max_angle = cv.getTrackbarPos("centre_max_angle", "Result Controls")
  
  # Goal Line
  goal_min_length = cv.getTrackbarPos("goal_min_length", "Result Controls")
  goal_max_length = cv.getTrackbarPos("goal_max_length", "Result Controls")
  goal_min_angle = cv.getTrackbarPos("goal_min_angle", "Result Controls")
  goal_max_angle = cv.getTrackbarPos("goal_max_angle", "Result Controls")
  
  # Box Line
  box_min_length = cv.getTrackbarPos("box_min_length", "Result Controls")
  box_max_length = cv.getTrackbarPos("box_max_length", "Result Controls")
  box_min_angle = cv.getTrackbarPos("box_min_angle", "Result Controls")
  box_max_angle = cv.getTrackbarPos("box_max_angle", "Result Controls")
  
  # 6yrd Line
  six_min_length = cv.getTrackbarPos("six_min_length", "Result Controls")
  six_max_length = cv.getTrackbarPos("six_max_length", "Result Controls")
  six_min_angle = cv.getTrackbarPos("six_min_angle", "Result Controls")
  six_max_angle = cv.getTrackbarPos("six_max_angle", "Result Controls")
  
  # Box Edge Line
  boxedge_min_length = cv.getTrackbarPos("boxedge_min_length", "Result Controls")
  boxedge_max_length = cv.getTrackbarPos("boxedge_max_length", "Result Controls")
  boxedge_min_angle = cv.getTrackbarPos("boxedge_min_angle", "Result Controls")
  boxedge_max_angle = cv.getTrackbarPos("boxedge_max_angle", "Result Controls")
  
  # Side Line
  side_min_length = cv.getTrackbarPos("side_min_length", "Result Controls")
  side_max_length = cv.getTrackbarPos("side_max_length", "Result Controls")
  side_min_angle = cv.getTrackbarPos("side_min_angle", "Result Controls")
  side_max_angle = cv.getTrackbarPos("side_max_angle", "Result Controls")
    
  # Return line with classification
  # LineID, Point1, Point2, Angle of line, Length of line, Line vert/hori
  
  # Centre line
  lineId = 0
  if centre_min_angle < norm_angle_of_line < centre_max_angle and centre_min_length < length_of_line < centre_max_length:
    lineId = 1
  # Goal line
  elif goal_min_angle < norm_angle_of_line < goal_max_angle and goal_min_length < length_of_line < goal_max_length: # Need to add check to make sure line is near the border of the field
    lineId = 6
  # Box line
  elif box_min_angle < norm_angle_of_line < box_max_angle and box_min_length < length_of_line < box_max_length:
    lineId = 3
  # 6yrd line
  elif six_min_angle < norm_angle_of_line < six_max_angle and six_min_length < length_of_line < six_max_length:
    lineId = 5
  # Box Edge line
  elif boxedge_min_angle < norm_angle_of_line < boxedge_max_angle and boxedge_min_length < length_of_line < boxedge_max_length:
    lineId = 4
  # Side line
  elif side_min_angle < norm_angle_of_line < side_max_angle and side_min_length < length_of_line < side_max_length:
    lineId = 2
  
  if lineId == 0:
    return False # unclassified line
  else:
    return {
      "id": lineId,
      "point1": [x1, y1],
      "point2": [x2, y2],
      "midpoint": line_midpoint,
      "angle": angle_of_line,
      "length": length_of_line,
      "direction": direction
    }

def generate_lines(frame, lines):
  v_lines = []
  h_lines = []

  for line in lines:
    classified_line = classify_line(line)
    if classified_line is not False:
      # Draw midpoint
      cv.circle(frame, (int(classified_line["midpoint"][0]), int(classified_line["midpoint"][1])), 5, (255, 0, 255), 5, cv.LINE_AA)
      
      # Split lines into horizontal/vertical groups using their classifed lines      
      if classified_line["id"] == 2 or classified_line["id"] == 4:
        # cv.line(frame, classified_line[1], classified_line[2], (255, 0, 0), 2, cv.LINE_AA)
        h_lines.append(classified_line)
      else:
        # cv.line(frame, classified_line[1], classified_line[2], (0, 0, 255), 2, cv.LINE_AA)
        v_lines.append(classified_line)
      
      # Split lines into horizontal/vertical groups using line angle
      # tmpAngle = classified_line["angle"]
      # if tmpAngle < 0:
      #   tmpAngle = tmpAngle * -1

      # if tmpAngle < 15:
      #   # cv.line(frame, classified_line["point1"], classified_line["point2"], (255, 0, 0), 2, cv.LINE_AA)
      #   h_lines.append(classified_line)
      # else:
      #   # cv.line(frame, classified_line["point1"], classified_line["point2"], (0, 0, 255), 2, cv.LINE_AA)
      #   v_lines.append(classified_line)
      
  # Draw valid lines
  for line in v_lines:
    if line["id"] == 1:
      cv.line(frame, line["point1"], line["point2"], (255, 0, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("C: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1, cv.LINE_AA)
    elif line["id"] == 2:
      cv.line(frame, line["point1"], line["point2"], (0, 255, 255), 2, cv.LINE_AA)
      cv.putText(frame, str("S: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv.LINE_AA)
    elif line["id"] == 3:
      cv.line(frame, line["point1"], line["point2"], (0, 0, 255), 2, cv.LINE_AA)
      cv.putText(frame, str("B: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv.LINE_AA)
    elif line["id"] == 4:
      cv.line(frame, line["point1"], line["point2"], (255, 255, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("BE: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1, cv.LINE_AA)
    elif line["id"] == 5:
      cv.line(frame, line["point1"], line["point2"], (0, 128, 128), 2, cv.LINE_AA)
      cv.putText(frame, str("6: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 128, 128), 1, cv.LINE_AA)
    elif line["id"] == 6:
      cv.line(frame, line["point1"], line["point2"], (0, 255, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("G: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1, cv.LINE_AA)
      
  for line in h_lines:
    if line["id"] == 1:
      cv.line(frame, line["point1"], line["point2"], (255, 0, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("C: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1, cv.LINE_AA)
    elif line["id"] == 2:
      cv.line(frame, line["point1"], line["point2"], (0, 255, 255), 2, cv.LINE_AA)
      cv.putText(frame, str("S: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv.LINE_AA)
    elif line["id"] == 3:
      cv.line(frame, line["point1"], line["point2"], (0, 0, 255), 2, cv.LINE_AA)
      cv.putText(frame, str("B: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv.LINE_AA)
    elif line["id"] == 4:
      cv.line(frame, line["point1"], line["point2"], (255, 255, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("BE: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1, cv.LINE_AA)
    elif line["id"] == 5:
      cv.line(frame, line["point1"], line["point2"], (0, 128, 128), 2, cv.LINE_AA)
      cv.putText(frame, str("6: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 128, 128), 1, cv.LINE_AA)
    elif line["id"] == 6:
      cv.line(frame, line["point1"], line["point2"], (0, 255, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("G: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1, cv.LINE_AA)
     
  return frame, v_lines, h_lines
 
def prune_lines(lines):
  min_distance = cv.getTrackbarPos('min_distance', "Pre Prune")
  min_angle = cv.getTrackbarPos('min_angle', "Pre Prune")
  bundler = HoughBundler(min_distance, min_angle)
  lines = bundler.process_lines(lines)
  return lines
 
def hough(frame):
  threshold = cv.getTrackbarPos('threshold', "Result Controls")
  minLineLength = cv.getTrackbarPos('minLineLength', "Result Controls")
  maxLineGap = cv.getTrackbarPos('maxLineGap', "Result Controls")
  resolution = cv.getTrackbarPos('resolution', "Result Controls")
  rho = cv.getTrackbarPos('rho', "Result Controls")

  return cv.HoughLinesP(frame, rho, resolution * np.pi/180, threshold=threshold, minLineLength=minLineLength, maxLineGap=maxLineGap)

def closing(frame):
  size = cv.getTrackbarPos('size', 'Closing')
  shape = morph_shape(cv.getTrackbarPos('shape', 'Closing'))
  element = cv.getStructuringElement(shape, (2 * size + 1, 2 * size + 1), (size, size))

  dst = cv.morphologyEx(frame, cv.MORPH_CLOSE, element)
  cv.imshow('Closing', dst)
  
  return dst

def opening(frame):
  size = cv.getTrackbarPos('size', 'Opening')
  shape = morph_shape(cv.getTrackbarPos('shape', 'Opening'))
  element = cv.getStructuringElement(shape, (2 * size + 1, 2 * size + 1), (size, size))

  dst = cv.morphologyEx(frame, cv.MORPH_OPEN, element)
  cv.imshow('Opening', dst)
  
  return dst
  
def dilate(frame):
  size = cv.getTrackbarPos('size', 'Dilation')
  shape = morph_shape(cv.getTrackbarPos('shape', 'Dilation'))
  element = cv.getStructuringElement(shape, (2 * size + 1, 2 * size + 1), (size, size))

  dst = cv.dilate(frame, element)
  cv.imshow('Dilation', dst)
  
  return dst
  
def erode(frame):
  size = cv.getTrackbarPos('size', 'Erosion')
  shape = morph_shape(cv.getTrackbarPos('shape', 'Erosion'))
  element = cv.getStructuringElement(shape, (2 * size + 1, 2 * size + 1), (size, size))
  
  dst = cv.erode(frame, element)
  cv.imshow('Erosion', dst)
  
  return dst
 
def add_masks(frame, crowd_mask, player_mask):
  masked_edges = cv.bitwise_and(frame, frame, mask=crowd_mask)
  masked_edges = cv.bitwise_and(masked_edges, masked_edges, mask=player_mask)
  cv.imshow("Masked Canny", masked_edges)

  return masked_edges
  
def generate_canny(frame):
  threshold_1 = cv.getTrackbarPos("Treshhold1", "Canny")
  threshold_2 = cv.getTrackbarPos("Treshhold2", "Canny")
  
  edges = cv.Canny(frame, threshold_1, threshold_2, 3)
  cv.imshow("Canny", edges)

  return edges
  
def generate_tophat(frame, crowd_mask, player_mask):
  filter_size = cv.getTrackbarPos("filter_size", "Tophat")
  if filter_size%2 == 0:
    filter_size+=1
  kernel = cv.getStructuringElement(cv.MORPH_RECT, (filter_size, filter_size))
  tophat = cv.morphologyEx(frame, cv.MORPH_TOPHAT, kernel)
  tophat = cv.bitwise_and(tophat, tophat, mask=crowd_mask)
  tophat = cv.bitwise_and(tophat, tophat, mask=player_mask)
  
  cv.imshow("Tophat", tophat)
  
  return tophat
  
def blur(frame):
  blur_size = cv.getTrackbarPos("blur_size", "Blur")
  if blur_size%2 == 0:
    blur_size+=1

  blurred = cv.GaussianBlur(frame, (blur_size, blur_size), 0)
  cv.imshow("Blur", blurred)

  return blurred
  
def threshold(frame):
  thresh = cv.getTrackbarPos("thresh", "Threshold")
  max_val = cv.getTrackbarPos("max_val", "Threshold")
  
  ret, threshold = cv.threshold(frame, thresh, max_val, cv.THRESH_BINARY)
  cv.imshow("Threshold", threshold)

  return threshold
  
def turn_grey(frame):
  grey = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
  # cv.imshow("Grey", grey)

  return grey
  
def generate_player_mask(frame):
  hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
  
  # Values for hues
  hue_min = cv.getTrackbarPos("Hue Min", "PlayerMask Controls")
  hue_max = cv.getTrackbarPos("Hue Max", "PlayerMask Controls")
  sat_min = cv.getTrackbarPos("Sat Min", "PlayerMask Controls")
  sat_max = cv.getTrackbarPos("Sat Max", "PlayerMask Controls")
  val_min = cv.getTrackbarPos("Val Min", "PlayerMask Controls")
  val_max = cv.getTrackbarPos("Val Max", "PlayerMask Controls")

  player_lower = np.array([hue_min, sat_min, val_min])
  player_upper = np.array([hue_max, sat_max, val_max])
  
  # Create mask
  playerMask = cv.inRange(hsv, player_lower, player_upper)

  # Erode mask
  erosion_size = cv.getTrackbarPos("erosion_size", "PlayerMask Controls")
  erosion_shape = morph_shape(cv.getTrackbarPos("erosion_shape", "PlayerMask Controls"))
  element = cv.getStructuringElement(erosion_shape, (2 * erosion_size + 1, 2 * erosion_size + 1), (erosion_size, erosion_size))
  player_erosion_dst = cv.erode(playerMask, element)

  # Dilate mask
  dilation_size = cv.getTrackbarPos("dilation_size", "PlayerMask Controls")
  dilation_shape = morph_shape(cv.getTrackbarPos("dilation_shape", "PlayerMask Controls"))
  element = cv.getStructuringElement(dilation_shape, (2 * dilation_size + 1, 2 * dilation_size + 1), (dilation_size, dilation_size))
  player_dilation_dst = cv.dilate(player_erosion_dst, element)
  
  invertPlayerMask = cv.getTrackbarPos("invert", "PlayerMask Controls")
  if invertPlayerMask == 1:
      player_dilation_dst = 255 - player_dilation_dst
  
  # player_res = cv.bitwise_and(frame, frame, mask=player_dilation_dst)
  # cv.imshow("PlayerMask", player_res)
  
  # Apply closing/opening
  size = cv.getTrackbarPos('closing_size', 'PlayerMask Controls')
  shape = morph_shape(cv.getTrackbarPos('closing_shape', 'PlayerMask Controls'))
  element = cv.getStructuringElement(shape, (2 * size + 1, 2 * size + 1), (size, size))

  dst = cv.morphologyEx(player_dilation_dst, cv.MORPH_CLOSE, element)
  
  size = cv.getTrackbarPos('opening_size', 'PlayerMask Controls')
  shape = morph_shape(cv.getTrackbarPos('opening_shape', 'PlayerMask Controls'))
  element = cv.getStructuringElement(shape, (2 * size + 1, 2 * size + 1), (size, size))

  dst = cv.morphologyEx(dst, cv.MORPH_OPEN, element)
  
  player_res = cv.bitwise_and(frame, frame, mask=dst)
  
  cv.imshow("PlayerMask", player_res)

  return player_dilation_dst
  
def generate_crowd_mask(frame):
  # Convert frame to HSV
  hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
  
  # Values for hues
  hue_min = cv.getTrackbarPos("Hue Min", "CrowdMask Controls")
  hue_max = cv.getTrackbarPos("Hue Max", "CrowdMask Controls")
  sat_min = cv.getTrackbarPos("Sat Min", "CrowdMask Controls")
  sat_max = cv.getTrackbarPos("Sat Max", "CrowdMask Controls")
  val_min = cv.getTrackbarPos("Val Min", "CrowdMask Controls")
  val_max = cv.getTrackbarPos("Val Max", "CrowdMask Controls")

  crowd_lower = np.array([hue_min, sat_min, val_min])
  crowd_upper = np.array([hue_max, sat_max, val_max])
  
  # Create mask
  crowdMask = cv.inRange(hsv, crowd_lower, crowd_upper)

  # Erode mask
  erosion_size = cv.getTrackbarPos("erosion_size", "CrowdMask Controls")
  erosion_shape = morph_shape(cv.getTrackbarPos("erosion_shape", "CrowdMask Controls"))
  element = cv.getStructuringElement(erosion_shape, (2 * erosion_size + 1, 2 * erosion_size + 1), (erosion_size, erosion_size))
  crowd_erosion_dst = cv.erode(crowdMask, element)

  # Dilate mask
  dilation_size = cv.getTrackbarPos("dilation_size", "CrowdMask Controls")
  dilation_shape = morph_shape(cv.getTrackbarPos("dilation_shape", "CrowdMask Controls"))
  element = cv.getStructuringElement(dilation_shape, (2 * dilation_size + 1, 2 * dilation_size + 1), (dilation_size, dilation_size))
  crowd_dilation_dst = cv.dilate(crowd_erosion_dst, element)
  
  invertCrowdMask = cv.getTrackbarPos("invert", "CrowdMask Controls")
  if invertCrowdMask == 1:
    crowd_dilation_dst = 255 - crowd_dilation_dst
  
  # crowd_res = cv.bitwise_and(frame, frame, mask=crowd_dilation_dst)
  # cv.imshow("CrowdMask", crowd_res)
  
  # Apply closing/opening
  size = cv.getTrackbarPos('closing_size', 'CrowdMask Controls')
  shape = morph_shape(cv.getTrackbarPos('closing_shape', 'CrowdMask Controls'))
  element = cv.getStructuringElement(shape, (2 * size + 1, 2 * size + 1), (size, size))

  dst = cv.morphologyEx(crowd_dilation_dst, cv.MORPH_CLOSE, element)
  
  crowd_res = cv.bitwise_and(frame, frame, mask=dst)
  
  cv.imshow("CrowdMask", crowd_res)
 
  return dst

def add_inputs():
  # =============================================== Player Mask ==============================================
  cv.createTrackbar("Hue Min", "PlayerMask Controls", 0, 255, on_change)
  cv.createTrackbar("Hue Max", "PlayerMask Controls", 38, 255, on_change)
  cv.createTrackbar("Sat Min", "PlayerMask Controls", 0, 255, on_change)
  cv.createTrackbar("Sat Max", "PlayerMask Controls", 255, 255, on_change)
  cv.createTrackbar("Val Min", "PlayerMask Controls", 72, 255, on_change)
  cv.createTrackbar("Val Max", "PlayerMask Controls", 181, 255, on_change)
  # Erosion
  cv.createTrackbar("erosion_size", "PlayerMask Controls", 4, 21, on_change)
  cv.createTrackbar("erosion_shape", "PlayerMask Controls", 2, 2, on_change)
  # Dilation
  cv.createTrackbar("dilation_size", "PlayerMask Controls", 2, 21, on_change)
  cv.createTrackbar("dilation_shape", "PlayerMask Controls", 2, 2, on_change)
  # Opening
  cv.createTrackbar("opening_size", "PlayerMask Controls", 0, 21, on_change)
  cv.createTrackbar("opening_shape", "PlayerMask Controls", 0, 2, on_change)
  # Closing
  cv.createTrackbar("closing_size", "PlayerMask Controls", 2, 21, on_change)
  cv.createTrackbar("closing_shape", "PlayerMask Controls", 0, 2, on_change)
  # Invert slider
  cv.createTrackbar("invert", "PlayerMask Controls", 0, 1, on_change)
          
  # =============================================== Crowd Mask ===============================================
  cv.createTrackbar("Hue Min", "CrowdMask Controls", 22, 255, on_change)
  cv.createTrackbar("Hue Max", "CrowdMask Controls", 47, 255, on_change)
  cv.createTrackbar("Sat Min", "CrowdMask Controls", 40, 255, on_change)
  cv.createTrackbar("Sat Max", "CrowdMask Controls", 255, 255, on_change)
  cv.createTrackbar("Val Min", "CrowdMask Controls", 75, 255, on_change)
  cv.createTrackbar("Val Max", "CrowdMask Controls", 255, 255, on_change)
  # Erosion
  cv.createTrackbar("erosion_size", "CrowdMask Controls", 5, 21, on_change)
  cv.createTrackbar("erosion_shape", "CrowdMask Controls", 2, 2, on_change)
  # Dilation
  cv.createTrackbar("dilation_size", "CrowdMask Controls", 20, 21, on_change)
  cv.createTrackbar("dilation_shape", "CrowdMask Controls", 2, 2, on_change)
  # Opening
  # cv.createTrackbar("opening_size", "CrowdMask Controls", 0, 21, on_change)
  # cv.createTrackbar("opening_shape", "CrowdMask Controls", 0, 2, on_change)
  # Closing
  cv.createTrackbar("closing_size", "CrowdMask Controls", 2, 21, on_change)
  cv.createTrackbar("closing_shape", "CrowdMask Controls", 0, 2, on_change)
  # Invert slider
  cv.createTrackbar("invert", "CrowdMask Controls", 0, 1, on_change)
  
  # ================================================ Grey Blur ===============================================

  cv.createTrackbar("blur_size", "Blur", 0, 100, on_change)
  
  # ================================================ Threshhold ==============================================

  cv.createTrackbar("thresh", "Threshold", 130, 360, on_change)
  cv.createTrackbar("max_val", "Threshold", 255, 360, on_change)
  
  # ================================================= Tophat =================================================
  
  cv.createTrackbar("filter_size", "Tophat", 3, 100, on_change)
  
  # ================================================== Canny =================================================

  cv.createTrackbar("Treshhold1", "Canny", 30, 500, on_change)
  cv.createTrackbar("Treshhold2", "Canny", 120, 500, on_change)
  
  # ========================================== Morphological Filters =========================================
  
  # Erosion
  cv.createTrackbar("size", "Erosion", 2, 21, on_change)
  cv.createTrackbar("shape", "Erosion", 0, 2, on_change)
  # Dilation
  cv.createTrackbar("size", "Dilation", 2, 21, on_change)
  cv.createTrackbar("shape", "Dilation", 0, 2, on_change)
  # Opening
  cv.createTrackbar("size", "Opening", 0, 21, on_change)
  cv.createTrackbar("shape", "Opening", 0, 2, on_change)
  # Closing
  cv.createTrackbar("size", "Closing", 2, 21, on_change)
  cv.createTrackbar("shape", "Closing", 0, 2, on_change)
        
  # ================================================== Result ================================================
  cv.createTrackbar("threshold", "Result Controls", 87, 500, on_change)
  cv.createTrackbar("minLineLength", "Result Controls", 23, 500, on_change)
  cv.createTrackbar("maxLineGap", "Result Controls", 57, 500, on_change)
  cv.createTrackbar("resolution", "Result Controls", 1, 25, on_change)
  cv.createTrackbar("rho", "Result Controls", 1, 25, on_change)
  
  # Line thresholds
  cv.createTrackbar("centre_min_angle", "Result Controls", 80, 500, on_change)
  cv.createTrackbar("centre_max_angle", "Result Controls", 100, 500, on_change)
  cv.createTrackbar("centre_min_length", "Result Controls", 200, 360, on_change)
  cv.createTrackbar("centre_max_length", "Result Controls", 600, 600, on_change)
  
  cv.createTrackbar("goal_min_angle", "Result Controls", 13, 500, on_change)
  cv.createTrackbar("goal_max_angle", "Result Controls", 19, 500, on_change)
  cv.createTrackbar("goal_min_length", "Result Controls", 150, 360, on_change)
  cv.createTrackbar("goal_max_length", "Result Controls", 600, 600, on_change)
  
  cv.createTrackbar("box_min_angle", "Result Controls", 20, 500, on_change)
  cv.createTrackbar("box_max_angle", "Result Controls", 35, 500, on_change)
  cv.createTrackbar("box_min_length", "Result Controls", 200, 100, on_change)
  cv.createTrackbar("box_max_length", "Result Controls", 450, 600, on_change)
  
  cv.createTrackbar("six_min_angle", "Result Controls", 10, 500, on_change)
  cv.createTrackbar("six_max_angle", "Result Controls", 22, 500, on_change)
  cv.createTrackbar("six_min_length", "Result Controls", 100, 360, on_change)
  cv.createTrackbar("six_max_length", "Result Controls", 250, 360, on_change)
  
  cv.createTrackbar("boxedge_min_angle", "Result Controls", 5, 500, on_change)
  cv.createTrackbar("boxedge_max_angle", "Result Controls", 10, 500, on_change)
  cv.createTrackbar("boxedge_min_length", "Result Controls", 50, 360, on_change)
  cv.createTrackbar("boxedge_max_length", "Result Controls", 250, 600, on_change)
  
  cv.createTrackbar("side_min_angle", "Result Controls", 0, 500, on_change)
  cv.createTrackbar("side_max_angle", "Result Controls", 50, 500, on_change)
  cv.createTrackbar("side_min_length", "Result Controls", 150, 360, on_change)
  cv.createTrackbar("side_max_length", "Result Controls", 600, 600, on_change)
  
  # ================================================== Prune ================================================
  cv.createTrackbar("min_distance", "Pre Prune", 10, 100, on_change)
  cv.createTrackbar("min_angle", "Pre Prune", 5, 100, on_change)
  
  # ================================================ FindPeaks ==============================================
  cv.createTrackbar("prominence", "FindPeaks", 0, 256, on_change)
  cv.createTrackbar("width", "FindPeaks", 0, 256, on_change)
  cv.createTrackbar("height", "FindPeaks", 7500, 20000, on_change)
  cv.createTrackbar("threshold", "FindPeaks", 0, 256, on_change)
  cv.createTrackbar("distance", "FindPeaks", 256, 256, on_change)
  cv.createTrackbar("rel_height", "FindPeaks", 95, 100, on_change)
  
  # ================================================ Players ==============================================
  cv.createTrackbar("Hue Min", "Players", 0, 255, on_change)
  cv.createTrackbar("Hue Max", "Players", 255, 255, on_change)
  cv.createTrackbar("Sat Min", "Players", 0, 255, on_change)
  cv.createTrackbar("Sat Max", "Players", 255, 255, on_change)
  cv.createTrackbar("Val Min", "Players", 175, 255, on_change)
  cv.createTrackbar("Val Max", "Players", 255, 255, on_change)
  
  cv.createTrackbar("home_blue_min", "Players", 0, 255, on_change)
  cv.createTrackbar("home_green_min", "Players", 0, 255, on_change)
  cv.createTrackbar("home_red_min", "Players", 0, 255, on_change)
  cv.createTrackbar("home_blue_max", "Players", 255, 255, on_change)
  cv.createTrackbar("home_green_max", "Players", 255, 255, on_change)
  cv.createTrackbar("home_red_max", "Players", 215, 255, on_change)
  
  cv.createTrackbar("away_blue_min", "Players", 182, 255, on_change)
  cv.createTrackbar("away_green_min", "Players", 172, 255, on_change)
  cv.createTrackbar("away_red_min", "Players", 182, 255, on_change)
  cv.createTrackbar("away_blue_max", "Players", 255, 255, on_change)
  cv.createTrackbar("away_green_max", "Players", 255, 255, on_change)
  cv.createTrackbar("away_red_max", "Players", 255, 255, on_change)

def create_windows():
  cv.namedWindow("PlayerMask")
  cv.namedWindow("PlayerMask Controls", cv.WINDOW_NORMAL)
  cv.resizeWindow('PlayerMask Controls', 600, 800)
  
  cv.namedWindow("CrowdMask")
  cv.namedWindow("CrowdMask Controls", cv.WINDOW_NORMAL)
  cv.resizeWindow('CrowdMask Controls', 600, 800)
  
  # cv.namedWindow("Grey")
  cv.namedWindow("Threshold")
  cv.namedWindow("Blur")
  cv.namedWindow("Tophat")
  cv.namedWindow("Canny")
  cv.namedWindow("Masked Canny")
  cv.namedWindow("Erosion")
  cv.namedWindow("Dilation")
  cv.namedWindow("Opening")
  cv.namedWindow("Closing")

  cv.namedWindow("Result")
  cv.namedWindow("Result Controls", cv.WINDOW_NORMAL)
  cv.resizeWindow('Result Controls', 600, 800)
  
  cv.namedWindow("Pre Prune")
  cv.namedWindow("FindPeaks")
  cv.namedWindow("Players")
  cv.resizeWindow('Players', 600, 800)
  cv.namedWindow("Detected Players")
  cv.namedWindow("Player Poses")
  cv.namedWindow("Homography")
  
  add_inputs()

def get_source():
  cap = cv.VideoCapture(0)
  if not cap.isOpened():
    print("Cannot open camera")
    exit()
      
  cap.set(cv.CAP_PROP_FRAME_WIDTH, resolution[0])
  cap.set(cv.CAP_PROP_FRAME_HEIGHT, resolution[1])
      
  return cap

def on_change(value):
    init = True

def morph_shape(val):
    if val == 0:
        return cv.MORPH_RECT
    elif val == 1:
        return cv.MORPH_CROSS
    elif val == 2:
        return cv.MORPH_ELLIPSE

class HoughBundler:
  def __init__(self,min_distance=5,min_angle=2):
    self.min_distance = min_distance
    self.min_angle = min_angle

  def get_orientation(self, line):
    orientation = math.atan2(abs((line[3] - line[1])), abs((line[2] - line[0])))
    return math.degrees(orientation)

  def check_is_line_different(self, line_1, groups, min_distance_to_merge, min_angle_to_merge):
    for group in groups:
      for line_2 in group:
        if self.get_distance(line_2, line_1) < min_distance_to_merge:
          orientation_1 = self.get_orientation(line_1)
          orientation_2 = self.get_orientation(line_2)
          if abs(orientation_1 - orientation_2) < min_angle_to_merge:
            group.append(line_1)
            return False
    return True

  def distance_point_to_line(self, point, line):
    px, py = point
    x1, y1, x2, y2 = line

    def line_magnitude(x1, y1, x2, y2):
      line_magnitude = math.sqrt(math.pow((x2 - x1), 2) + math.pow((y2 - y1), 2))
      return line_magnitude

    lmag = line_magnitude(x1, y1, x2, y2)
    if lmag < 0.00000001:
      distance_point_to_line = 9999
      return distance_point_to_line

    u1 = (((px - x1) * (x2 - x1)) + ((py - y1) * (y2 - y1)))
    u = u1 / (lmag * lmag)

    if (u < 0.00001) or (u > 1):
      #// closest point does not fall within the line segment, take the shorter distance
      #// to an endpoint
      ix = line_magnitude(px, py, x1, y1)
      iy = line_magnitude(px, py, x2, y2)
      if ix > iy:
          distance_point_to_line = iy
      else:
          distance_point_to_line = ix
    else:
      # Intersecting point is on the line, use the formula
      ix = x1 + u * (x2 - x1)
      iy = y1 + u * (y2 - y1)
      distance_point_to_line = line_magnitude(px, py, ix, iy)

    return distance_point_to_line

  def get_distance(self, a_line, b_line):
    dist1 = self.distance_point_to_line(a_line[:2], b_line)
    dist2 = self.distance_point_to_line(a_line[2:], b_line)
    dist3 = self.distance_point_to_line(b_line[:2], a_line)
    dist4 = self.distance_point_to_line(b_line[2:], a_line)

    return min(dist1, dist2, dist3, dist4)

  def merge_lines_into_groups(self, lines):
    groups = []  # all lines groups are here
    # first line will create new group every time
    groups.append([lines[0]])
    # if line is different from existing gropus, create a new group
    for line_new in lines[1:]:
        if self.check_is_line_different(line_new, groups, self.min_distance, self.min_angle):
            groups.append([line_new])

    return groups

  def merge_line_segments(self, lines):
    orientation = self.get_orientation(lines[0])
  
    if(len(lines) == 1):
        return np.block([[lines[0][:2], lines[0][2:]]])

    points = []
    for line in lines:
        points.append(line[:2])
        points.append(line[2:])
    if 45 < orientation <= 90:
        #sort by y
        points = sorted(points, key=lambda point: point[1])
    else:
        #sort by x
        points = sorted(points, key=lambda point: point[0])

    return np.block([[points[0],points[-1]]])

  def process_lines(self, lines):
    lines_horizontal  = []
    lines_vertical  = []

    for line_i in [l[0] for l in lines]:
        orientation = self.get_orientation(line_i)
        # if vertical
        if 45 < orientation <= 90:
            lines_vertical.append(line_i)
        else:
            lines_horizontal.append(line_i)

    lines_vertical  = sorted(lines_vertical , key=lambda line: line[1])
    lines_horizontal  = sorted(lines_horizontal , key=lambda line: line[0])
    merged_lines_all = []

    # for each cluster in vertical and horizantal lines leave only one line
    for i in [lines_horizontal, lines_vertical]:
        if len(i) > 0:
            groups = self.merge_lines_into_groups(i)
            merged_lines = []
            for group in groups:
                merged_lines.append(self.merge_line_segments(group))
            merged_lines_all.extend(merged_lines)
                
    return np.asarray(merged_lines_all)

# X,Y are in pct!
intersection_dict = [{
  "id": 1,
  "v_line": 6,
  "h_line": 2,
  "h_side": 0,
  "v_side": 1,
  "x": 0.0231,
  "y": 0.0344
}, {
  "id": 2,
  "v_line": 6,
  "h_line": 4,
  "h_side": 0,
  "v_side": 1,
  "x": 0.0231,
  "y": 0.2009
}, {
  "id": 3,
  "v_line": 6,
  "h_line": 4,
  "h_side": 0,
  "v_side": 0,
  "x": 0.0231,
  "y": 0.7882
}, {
  "id": 4,
  "v_line": 6,
  "h_line": 2,
  "h_side": 0,
  "v_side": 0,
  "x": 0.0231,
  "y": 0.9644
}, {
  "id": 5,
  "v_line": 5,
  "h_line": 2,
  "h_side": 0,
  "v_side": 1,
  "x": 0.0725,
  "y": 0.0344
}, {
  "id": 6,
  "v_line": 5,
  "h_line": 4,
  "h_side": 0,
  "v_side": 1,
  "x": 0.0725,
  "y": 0.2009
}, {
  "id": 7, # Invalid point - no h line
  "v_line": 5,
  "h_line": 0,
  "h_side": 0,
  "v_side": 1,
  "x": 0.0725,
  "y": 0.3677
}, {
  "id": 8, # Invalid point - no h line
  "v_line": 5,
  "h_line": 0,
  "h_side": 0,
  "v_side": 0,
  "x": 0.0725,
  "y": 0.6301
}, {
  "id": 9,
  "v_line": 5,
  "h_line": 4,
  "h_side": 0,
  "v_side": 0,
  "x": 0.0725,
  "y": 0.7882
}, {
  "id": 10,
  "v_line": 5,
  "h_line": 2,
  "h_side": 0,
  "v_side": 0,
  "x": 0.0725,
  "y": 0.9644
}, {
  "id": 11,
  "v_line": 3,
  "h_line": 2,
  "h_side": 0,
  "v_side": 1,
  "x": 0.1759,
  "y": 0.0344
}, {
  "id": 12,
  "v_line": 3,
  "h_line": 4,
  "h_side": 0,
  "v_side": 1,
  "x": 0.1759,
  "y": 0.2009
}, {
  "id": 13,
  "v_line": 3,
  "h_line": 4,
  "h_side": 0,
  "v_side": 0,
  "x": 0.1759,
  "y": 0.7882
}, {
  "id": 14,
  "v_line": 3,
  "h_line": 2,
  "h_side": 0,
  "v_side": 0,
  "x": 0.1759,
  "y": 0.9644
}, {
  "id": 15, # This is the center line - doesn't need left/right side
  "v_line": 1,
  "h_line": 2,
  "h_side": -1,
  "v_side": 1,
  "x": 0.5,
  "y": 0.0344
}, {
  "id": 16, # This is the center line - doesn't need left/right side
  "v_line": 1,
  "h_line": 4,
  "h_side": -1,
  "v_side": 1,
  "x": 0.5,
  "y": 0.2009
}, {
  "id": 17, # This is the center line - doesn't need left/right side
  "v_line": 1,
  "h_line": 4,
  "h_side": -1,
  "v_side": 0,
  "x": 0.5,
  "y": 0.7882
}, {
  "id": 18, # This is the center line - doesn't need left/right side
  "v_line": 1,
  "h_line": 2,
  "h_side": -1,
  "v_side": 0,
  "x": 0.5,
  "y": 0.9644
}, {
  "id": 19,
  "v_line": 3,
  "h_line": 2,
  "h_side": 1,
  "v_side": 1,
  "x": 0.8234,
  "y": 0.0344
}, {
  "id": 20,
  "v_line": 3,
  "h_line": 4,
  "h_side": 1,
  "v_side": 1,
  "x": 0.8234,
  "y": 0.2009
}, {
  "id": 21,
  "v_line": 3,
  "h_line": 4,
  "h_side": 1,
  "v_side": 0,
  "x": 0.8234,
  "y": 0.7882
}, {
  "id": 22,
  "v_line": 3,
  "h_line": 2,
  "h_side": 1,
  "v_side": 0,
  "x": 0.8234,
  "y": 0.9644
}, {
  "id": 23,
  "v_line": 5,
  "h_line": 2,
  "h_side": 1,
  "v_side": 1,
  "x": 0.9273,
  "y": 0.0344
}, {
  "id": 24,
  "v_line": 5,
  "h_line": 4,
  "h_side": 1,
  "v_side": 1,
  "x": 0.9273,
  "y": 0.2009
}, {
  "id": 25, # Invalid point - no h line
  "v_line": 5,
  "h_line": 0,
  "h_side": 1,
  "v_side": 1,
  "x": 0.9273,
  "y": 0.3677
}, {
  "id": 26, # Invalid point - no h line
  "v_line": 5,
  "h_line": 0,
  "h_side": 1,
  "v_side": 0,
  "x": 0.9273,
  "y": 0.6301
}, {
  "id": 27,
  "v_line": 5,
  "h_line": 4,
  "h_side": 1,
  "v_side": 0,
  "x": 0.9273,
  "y": 0.7882
}, {
  "id": 28,
  "v_line": 5,
  "h_line": 2,
  "h_side": 1,
  "v_side": 0,
  "x": 0.9273,
  "y": 0.9644
}, {
  "id": 29,
  "v_line": 6,
  "h_line": 2,
  "h_side": 1,
  "v_side": 1,
  "x": 0.9771,
  "y": 0.0344
}, {
  "id": 30,
  "v_line": 6,
  "h_line": 4,
  "h_side": 1,
  "v_side": 1,
  "x": 0.9771,
  "y": 0.2009
}, {
  "id": 31,
  "v_line": 6,
  "h_line": 4,
  "h_side": 1,
  "v_side": 0,
  "x": 0.9771,
  "y": 0.7882
}, {
  "id": 32,
  "v_line": 6,
  "h_line": 2,
  "h_side": 1,
  "v_side": 0,
  "x": 0.9771,
  "y": 0.9644
}]
  
main()