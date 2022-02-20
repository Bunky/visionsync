import numpy as np
import cv2 as cv
import math
import matplotlib.pyplot as plt
from scipy.signal import find_peaks
import itertools
from torch import threshold_

def main():
  create_windows()
  video = get_source()

  while True:
    ret, frame = video.read()
    
    # Processing
    # colour_histogram = get_histogram(frame)
    crowd_mask = generate_crowd_mask(frame)
    player_mask = generate_player_mask(frame)
    
    grey_frame = turn_grey(frame)
    blur_frame = blur(grey_frame)
    # thresh_frame = threshold(blur_frame)
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
    
    if lines is not None:
      # Filter/prune lines (combines lines that are duplicates etc)
      lines = prune_lines(lines)      
      cv.putText(frame, f"Lines: {str(len(lines))}", (50, 100), cv.FONT_HERSHEY_SIMPLEX, 1, (255, 128, 255), 2, cv.LINE_AA)
      
      frame_with_lines, intersections = generate_lines(frame, lines)

      cv.putText(frame, f"Intersections: {str(len(intersections))}", (50, 150), cv.FONT_HERSHEY_SIMPLEX, 1, (255, 128, 128), 2, cv.LINE_AA)
      cv.imshow("Result", frame_with_lines)
      
      homography = get_homography(frame, intersections)
    else:
      cv.imshow("Result", frame)
                
    if cv.waitKey(1) == ord("q"):
        break

  # When everything done, release the capture
  video.release()
  cv.destroyAllWindows()
  
def get_homography(frame, intersections):
  
  if len(intersections) < 4:
    return False
  
  source = np.array([
    [intersections[0][0], intersections[0][1]],
    [intersections[1][0], intersections[1][1]],
    [intersections[2][0], intersections[2][1]],
    [intersections[3][0], intersections[3][1]],
  ])
 
  # Source points will be collected from lines, either intersections or end of lines, and will map to the destination points by classifying the lines
  # source = np.array([
  #   [50, 50],
  #   [590, 50],
  #   [0, 430],
  #   [750, 430]
  # ])
  
  # Destination points will be a fixed square topdown map of points
  destination = np.array([
    [50, 50],
    [590, 50],
    [50, 430],
    [590, 430]
  ])
  src_pts = np.array(source).reshape(-1,1,2)
  dst_pts = np.array(destination).reshape(-1,1,2)

  random_color = (list(np.random.choice(range(256), size=3)))  

  H, _ = cv.findHomography(src_pts, dst_pts)
  warped_frame = cv.warpPerspective(frame, H, (600, 480), frame, cv.INTER_NEAREST, cv.BORDER_CONSTANT,  0)

  img_draw_matches = cv.hconcat([frame, warped_frame])
  for i in range(len(source)):
    pt1 = np.array([source[i][0], source[i][1], 1])
    pt1 = pt1.reshape(3, 1)
    pt2 = np.dot(H, pt1)
    pt2 = pt2/pt2[2]
    end = (int(frame.shape[1] + pt2[0]), int(pt2[1]))
    cv.line(img_draw_matches, tuple([int(j) for j in source[i]]), end, (int(random_color[0]), int(random_color[1]), int(random_color[2])), 2)

  cv.imshow("Homography", img_draw_matches)

tmp = False
def get_histogram(frame):
  # hist_h = cv.calcHist([frame[:,:,0]], [0], None, [256], [0,256])
  # hist_s = cv.calcHist([frame[:,:,1]], [0], None, [256], [0,256])
  # hist_v = cv.calcHist([frame[:,:,2]], [0], None, [256], [0,256])
  
  # [32] is frequency bin, the lower these are, faster it runs, realistically i dont need to be checking each 256, so for speed only check x
  hist_h = cv.calcHist([frame[:,:,0]], [0], None, [32], [0,256]) 
  hist_s = cv.calcHist([frame[:,:,1]], [0], None, [32], [0,256])
  hist_v = cv.calcHist([frame[:,:,2]], [0], None, [32], [0,256])
  
  # x = [val[0] for val in hist_h]; 
  
  # peaks, properties = find_peaks(x, prominence=1, width=20)
  
  # plt.plot(x)
  # plt.plot(peaks, x[peaks], "x")
  # # plt.vlines(x=peaks, ymin=x[peaks] - properties["prominences"], ymax=x[peaks], color="C1")
  # # plt.hlines(y=properties["width_heights"], xmin=properties["left_ips"], xmax=properties["right_ips"], color="C1")
  # plt.show()
  
  # plt.plot(hist_h, color='c', label="h")
  # plt.plot(hist_s, color='m', label="s")
  # plt.plot(hist_v, color='y', label="v")
  
  global tmp
  if tmp:
    tmp = False   
    plt.ion()
    plt.legend()
    plt.show()
  else:
    plt.clf()
    plt.plot(hist_h, color='c', label="h")
    plt.plot(hist_s, color='m', label="s")
    plt.plot(hist_v, color='y', label="v")
    plt.draw()
    plt.pause(0.001)  
  
def prune_lines(lines):
  min_distance = cv.getTrackbarPos('min_distance', "Post Prune")
  min_angle = cv.getTrackbarPos('min_angle', "Post Prune")
  bundler = HoughBundler(min_distance, min_angle)
  lines = bundler.process_lines(lines)
  return lines
  
def classify_line(angle, length):
  return True

def line_intersection(frame, line1, line2):
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
  
  # Draw point
  cv.circle(frame, (int(x), int(y)), 5, (0, 255, 255), 2, cv.LINE_AA)

  return x, y

def generate_lines(frame, lines):
  valid_lines = []

  for line in lines:
    x1, y1, x2, y2 = line[0]
    
    length_of_line = math.hypot(x2-x1, y2-y1)
    angle_of_line = math.degrees(math.atan2(-(y2-y1), x2-x1))
    if angle_of_line < 0:
      angle_of_line = angle_of_line * -1

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
     
    # classify_line(line)
    
    # Centre line
    if centre_min_angle < angle_of_line < centre_max_angle and centre_min_length < length_of_line < centre_max_length:
      cv.line(frame, (x1, y1), (x2, y2), (255, 0, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("C: {:.2f}".format(angle_of_line)), (x1, y1), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1, cv.LINE_AA)
      valid_lines.append([[x1, y1],[x2, y2]])
    # Goal line
    elif goal_min_angle < angle_of_line < goal_max_angle and goal_min_length < length_of_line < goal_max_length: # Need to add check to make sure line is near the border of the field
      cv.line(frame, (x1, y1), (x2, y2), (0, 255, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("G: {:.2f}".format(angle_of_line)), (x1, y1), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1, cv.LINE_AA)
      valid_lines.append([[x1, y1],[x2, y2]])
    # Box line
    elif box_min_angle < angle_of_line < box_max_angle and box_min_length < length_of_line < box_max_length:
      cv.line(frame, (x1, y1), (x2, y2), (0, 0, 255), 2, cv.LINE_AA)
      cv.putText(frame, str("B: {:.2f}".format(angle_of_line)), (x1, y1), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv.LINE_AA)
      valid_lines.append([[x1, y1],[x2, y2]])
    # 6yrd line
    elif six_min_angle < angle_of_line < six_max_angle and six_min_length < length_of_line < six_max_length:
      cv.line(frame, (x1, y1), (x2, y2), (0, 128, 128), 2, cv.LINE_AA)
      cv.putText(frame, str("6: {:.2f}".format(angle_of_line)), (x1, y1), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 128, 128), 1, cv.LINE_AA)
      valid_lines.append([[x1, y1],[x2, y2]])
    # Box Edge line
    elif boxedge_min_angle < angle_of_line < boxedge_max_angle and boxedge_min_length < length_of_line < boxedge_max_length:
      cv.line(frame, (x1, y1), (x2, y2), (255, 255, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("BE: {:.2f}".format(angle_of_line)), (x1, y1), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1, cv.LINE_AA)
      valid_lines.append([[x1, y1],[x2, y2]])
    # Side line
    elif side_min_angle < angle_of_line < side_max_angle and side_min_length < length_of_line < side_max_length:
      cv.line(frame, (x1, y1), (x2, y2), (0, 255, 255), 2, cv.LINE_AA)
      cv.putText(frame, str("S: {:.2f}".format(angle_of_line)), (x1, y1), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv.LINE_AA)
      valid_lines.append([[x1, y1],[x2, y2]])
    # else:
    #   cv.line(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)#
    
  # Draw intersections 
  intersections = []
  for index, line1 in enumerate(valid_lines):
    for line2 in valid_lines[index+1:]:
      intersection = line_intersection(frame, line1, line2)
      if intersection is not False:
        intersections.append(intersection)
        
  return frame, intersections
  
def hough(frame):
  threshold = cv.getTrackbarPos('threshold', "Result Controls")
  minLineLength = cv.getTrackbarPos('minLineLength', "Result Controls")
  maxLineGap = cv.getTrackbarPos('maxLineGap', "Result Controls")
  resolution = cv.getTrackbarPos('resolution', "Result Controls")
  rho = cv.getTrackbarPos('rho', "Result Controls")

  return cv.HoughLinesP(frame, rho, resolution * np.pi/180, threshold=threshold, minLineLength=minLineLength, maxLineGap=maxLineGap)
  # return cv.HoughLines(frame, 1, resolution * np.pi/180, threshold=threshold)

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
  cv.createTrackbar("Hue Min", "PlayerMask Controls", 0, 179, on_change)
  cv.createTrackbar("Hue Max", "PlayerMask Controls", 38, 179, on_change)
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
  cv.createTrackbar("Hue Min", "CrowdMask Controls", 22, 179, on_change)
  cv.createTrackbar("Hue Max", "CrowdMask Controls", 47, 179, on_change)
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

  cv.createTrackbar("thresh", "Threshold", 180, 360, on_change)
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
  cv.createTrackbar("goal_min_length", "Result Controls", 300, 360, on_change)
  cv.createTrackbar("goal_max_length", "Result Controls", 600, 600, on_change)
  
  cv.createTrackbar("box_min_angle", "Result Controls", 20, 500, on_change)
  cv.createTrackbar("box_max_angle", "Result Controls", 35, 500, on_change)
  cv.createTrackbar("box_min_length", "Result Controls", 200, 360, on_change)
  cv.createTrackbar("box_max_length", "Result Controls", 450, 600, on_change)
  
  cv.createTrackbar("six_min_angle", "Result Controls", 10, 500, on_change)
  cv.createTrackbar("six_max_angle", "Result Controls", 20, 500, on_change)
  cv.createTrackbar("six_min_length", "Result Controls", 150, 360, on_change)
  cv.createTrackbar("six_max_length", "Result Controls", 250, 360, on_change)
  
  cv.createTrackbar("boxedge_min_angle", "Result Controls", 15, 500, on_change)
  cv.createTrackbar("boxedge_max_angle", "Result Controls", 23, 500, on_change)
  cv.createTrackbar("boxedge_min_length", "Result Controls", 50, 360, on_change)
  cv.createTrackbar("boxedge_max_length", "Result Controls", 250, 600, on_change)
  
  cv.createTrackbar("side_min_angle", "Result Controls", 0, 500, on_change)
  cv.createTrackbar("side_max_angle", "Result Controls", 50, 500, on_change)
  cv.createTrackbar("side_min_length", "Result Controls", 150, 360, on_change)
  cv.createTrackbar("side_max_length", "Result Controls", 600, 600, on_change)
  
  # ================================================== Prune  ================================================
  cv.createTrackbar("min_distance", "Post Prune", 10, 100, on_change)
  cv.createTrackbar("min_angle", "Post Prune", 5, 100, on_change)

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
  
  cv.namedWindow("Post Prune")

  cv.namedWindow("Homography")
  
  add_inputs()

def get_source():
  cap = cv.VideoCapture(0)
  if not cap.isOpened():
      print("Cannot open camera")
      exit()
      
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
  
main()