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
  threaded_camera = utils.ThreadedCamera(f"http://d1pu8bxuwsqdvz.cloudfront.net/matches/{matchId}.mp4")

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
      settings = r.json().get(f"{matchId}-settings:jsondata")

      # Get latest frame     
      frame = threaded_camera.get_frame()
      
      if np.shape(frame) == ():
        break;
      
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
      biv_detections, corners, homography_frame, matrix = stages.apply_homography(settings, frame, intersections, detections, last_matrix)
      
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

      if detections_limit_time + 10 < current_ms:
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
          "data": json.dumps(biv_detections),
          "corners": json.dumps(corners)
        })
        positions_limit_time = current_ms

      sys.stdout.write(json.dumps(message))
      sys.stdout.flush()

    except AttributeError:
      pass

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