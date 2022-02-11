import numpy as np
import cv2 as cv
import math
import matplotlib.pyplot as plt
from scipy.signal import find_peaks

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
    # tophat = generate_tophat(blur_frame, crowd_mask, player_mask)
    
    canny_edged = generate_canny(blur_frame)
    masked_canny = add_masks(canny_edged, crowd_mask, player_mask)
    
    eroded = erode(masked_canny)
    dilated = dilate(eroded)
    
    lines = hough(dilated)
    
    if lines is not None:
      cv.putText(frame, str(len(lines)), (50, 50), cv.FONT_HERSHEY_SIMPLEX, 1, (255, 128, 255), 2, cv.LINE_AA)
      frame_with_lines = generate_lines(frame, lines)
      cv.imshow("Result", frame_with_lines)
      
    homography = get_homography(frame)
    # cv.imshow("Homography", homography)
    
    if cv.waitKey(1) == ord("q"):
        break

  # When everything done, release the capture
  video.release()
  cv.destroyAllWindows()
  
def get_homography(frame):
 
  source = np.array([
    [50, 50],
    [590, 50],
    [0, 430],
    [750, 430]
  ])
  destination = np.array([
    [50, 50],
    [590, 50],
    [50, 430],
    [590, 430]
  ])
  src_pts = np.array(source).reshape(-1,1,2)
  dst_pts = np.array(destination).reshape(-1,1,2)

  random_color = (list(np.random.choice(range(256), size=3)))  

# srouce points, and destination points - so, points as detecting with lines, and points as in correct placement
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
  
def classify_line(line):
  return True
  
def generate_lines(frame, lines):
  for line in lines:
    x1, y1, x2, y2 = line[0]
    
    angle_of_line = math.degrees(math.atan2(-(y2-y1), x2-x1))
    length_of_line = math.hypot(x2-x1, y2-y1)

    # Center Line
    centre_length = cv.getTrackbarPos("centre_length", "Result")
    centre_min_angle = cv.getTrackbarPos("centre_min_angle", "Result")
    centre_max_angle = cv.getTrackbarPos("centre_max_angle", "Result")
    
    cv.putText(frame, str("{:.2f}".format(angle_of_line)), (x1, y1), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv.LINE_AA)
    
    # classify_line(line)
    
    if centre_min_angle < angle_of_line < centre_max_angle: # and length_of_line > centre_length:
        cv.line(frame, (x1, y1), (x2, y2), (0, 255, 0), 1)
    else:
        cv.line(frame, (x1, y1), (x2, y2), (255, 0, 0), 1)
        
  return frame
  
def hough(frame):
  threshold = cv.getTrackbarPos('threshold', "Result")
  minLineLength = cv.getTrackbarPos('minLineLength', "Result")
  maxLineGap = cv.getTrackbarPos('maxLineGap', "Result")

  return cv.HoughLinesP(frame, 1, np.pi/180, threshold=threshold, minLineLength=minLineLength, maxLineGap=maxLineGap)
  
def dilate(frame):
  dilation_size = cv.getTrackbarPos('dilation_size', 'Dilation')
  dilation_shape = morph_shape(cv.getTrackbarPos('dilation_shape', 'Dilation'))
  element = cv.getStructuringElement(dilation_shape, (2 * dilation_size + 1, 2 * dilation_size + 1), (dilation_size, dilation_size))

  dilation_dst = cv.dilate(frame, element)
  cv.imshow('Dilation', dilation_dst)
  
  return dilation_dst
  
def erode(frame):
  erosion_size = cv.getTrackbarPos('erosion_size', 'Erosion')
  erosion_shape = morph_shape(cv.getTrackbarPos('erosion_shape', 'Erosion'))
  element = cv.getStructuringElement(erosion_shape, (2 * erosion_size + 1, 2 * erosion_size + 1), (erosion_size, erosion_size))
  
  erosion_dst = cv.erode(frame, element)
  cv.imshow('Erosion', erosion_dst)
  
  return erosion_dst
 
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
  
def turn_grey(frame):
  grey = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
  # cv.imshow("Grey", grey)

  return grey
  
def generate_player_mask(frame):
  hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
  
  # Values for hues
  hue_min = cv.getTrackbarPos("Hue Min", "PlayerMask")
  hue_max = cv.getTrackbarPos("Hue Max", "PlayerMask")
  sat_min = cv.getTrackbarPos("Sat Min", "PlayerMask")
  sat_max = cv.getTrackbarPos("Sat Max", "PlayerMask")
  val_min = cv.getTrackbarPos("Val Min", "PlayerMask")
  val_max = cv.getTrackbarPos("Val Max", "PlayerMask")

  player_lower = np.array([hue_min, sat_min, val_min])
  player_upper = np.array([hue_max, sat_max, val_max])
  
  # Create mask
  playerMask = cv.inRange(hsv, player_lower, player_upper)

  # Erode mask
  erosion_size = cv.getTrackbarPos("erosion_size", "PlayerMask")
  erosion_shape = morph_shape(cv.getTrackbarPos("erosion_shape", "PlayerMask"))
  element = cv.getStructuringElement(erosion_shape, (2 * erosion_size + 1, 2 * erosion_size + 1), (erosion_size, erosion_size))
  player_erosion_dst = cv.erode(playerMask, element)

  # Dilate mask
  dilation_size = cv.getTrackbarPos("dilation_size", "PlayerMask")
  dilation_shape = morph_shape(cv.getTrackbarPos("dilation_shape", "PlayerMask"))
  element = cv.getStructuringElement(dilation_shape, (2 * dilation_size + 1, 2 * dilation_size + 1), (dilation_size, dilation_size))
  player_dilation_dst = cv.dilate(player_erosion_dst, element)
  
  invertPlayerMask = cv.getTrackbarPos("invert", "PlayerMask")
  if invertPlayerMask == 1:
      player_dilation_dst = 255 - player_dilation_dst
  
  player_res = cv.bitwise_and(frame, frame, mask=player_dilation_dst)
  cv.imshow("PlayerMask", player_res)

  return player_dilation_dst
  
def generate_crowd_mask(frame):
  # Convert frame to HSV
  hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
  
  # Values for hues
  hue_min = cv.getTrackbarPos("Hue Min", "CrowdMask")
  hue_max = cv.getTrackbarPos("Hue Max", "CrowdMask")
  sat_min = cv.getTrackbarPos("Sat Min", "CrowdMask")
  sat_max = cv.getTrackbarPos("Sat Max", "CrowdMask")
  val_min = cv.getTrackbarPos("Val Min", "CrowdMask")
  val_max = cv.getTrackbarPos("Val Max", "CrowdMask")

  crowd_lower = np.array([hue_min, sat_min, val_min])
  crowd_upper = np.array([hue_max, sat_max, val_max])
  
  # Create mask
  crowdMask = cv.inRange(hsv, crowd_lower, crowd_upper)

  # Erode mask
  erosion_size = cv.getTrackbarPos("erosion_size", "CrowdMask")
  erosion_shape = morph_shape(cv.getTrackbarPos("erosion_shape", "CrowdMask"))
  element = cv.getStructuringElement(erosion_shape, (2 * erosion_size + 1, 2 * erosion_size + 1), (erosion_size, erosion_size))
  crowd_erosion_dst = cv.erode(crowdMask, element)

  # Dilate mask
  dilation_size = cv.getTrackbarPos("dilation_size", "CrowdMask")
  dilation_shape = morph_shape(cv.getTrackbarPos("dilation_shape", "CrowdMask"))
  element = cv.getStructuringElement(dilation_shape, (2 * dilation_size + 1, 2 * dilation_size + 1), (dilation_size, dilation_size))
  crowd_dilation_dst = cv.dilate(crowd_erosion_dst, element)
  
  invertCrowdMask = cv.getTrackbarPos("invert", "CrowdMask")
  if invertCrowdMask == 1:
    crowd_dilation_dst = 255 - crowd_dilation_dst
  
  crowd_res = cv.bitwise_and(frame, frame, mask=crowd_dilation_dst)     
  cv.imshow("CrowdMask", crowd_res)
 
  return crowd_dilation_dst

def add_inputs():
  # =============================================== Player Mask ==============================================
  
  # Mask Sliders
  cv.createTrackbar("Hue Min", "PlayerMask", 32, 179, on_change)
  cv.createTrackbar("Hue Max", "PlayerMask", 38, 179, on_change)
  cv.createTrackbar("Sat Min", "PlayerMask", 0, 255, on_change)
  cv.createTrackbar("Sat Max", "PlayerMask", 255, 255, on_change)
  cv.createTrackbar("Val Min", "PlayerMask", 72, 255, on_change)
  cv.createTrackbar("Val Max", "PlayerMask", 181, 255, on_change)
  # Erosion
  cv.createTrackbar("erosion_size", "PlayerMask", 4, 21, on_change)
  cv.createTrackbar("erosion_shape", "PlayerMask", 2, 2, on_change)
  # Dilation
  cv.createTrackbar("dilation_size", "PlayerMask", 2, 21, on_change)
  cv.createTrackbar("dilation_shape", "PlayerMask", 2, 2, on_change)
  # Invert slider
  cv.createTrackbar("invert", "PlayerMask", 0, 1, on_change)
          
  # =============================================== Crowd Mask ===============================================
  
  # Mask Sliders
  cv.createTrackbar("Hue Min", "CrowdMask", 22, 179, on_change)
  cv.createTrackbar("Hue Max", "CrowdMask", 47, 179, on_change)
  cv.createTrackbar("Sat Min", "CrowdMask", 40, 255, on_change)
  cv.createTrackbar("Sat Max", "CrowdMask", 255, 255, on_change)
  cv.createTrackbar("Val Min", "CrowdMask", 75, 255, on_change)
  cv.createTrackbar("Val Max", "CrowdMask", 255, 255, on_change)
  # Erosion
  cv.createTrackbar("erosion_size", "CrowdMask", 5, 21, on_change)
  cv.createTrackbar("erosion_shape", "CrowdMask", 2, 2, on_change)
  # Dilation
  cv.createTrackbar("dilation_size", "CrowdMask", 20, 21, on_change)
  cv.createTrackbar("dilation_shape", "CrowdMask", 2, 2, on_change)
  # Invert slider
  cv.createTrackbar("invert", "CrowdMask", 0, 1, on_change)
  
  # ================================================ Grey Blur ===============================================

  cv.createTrackbar("blur_size", "Blur", 3, 100, on_change)
  
  # ================================================= Tophat =================================================
  
  cv.createTrackbar("filter_size", "Tophat", 3, 100, on_change)
  
  # ================================================== Canny =================================================

  cv.createTrackbar("Treshhold1", "Canny", 30, 500, on_change)
  cv.createTrackbar("Treshhold2", "Canny", 120, 500, on_change)
  
  # ========================================== Morphological Filters =========================================
  
  # Erosion
  cv.createTrackbar("erosion_size", "Erosion", 0, 21, on_change)
  cv.createTrackbar("erosion_shape", "Erosion", 0, 2, on_change)
  # Dilation
  cv.createTrackbar("dilation_size", "Dilation", 0, 21, on_change)
  cv.createTrackbar("dilation_shape", "Dilation", 0, 2, on_change)
        
  # ================================================== Result ================================================
  cv.createTrackbar("threshold", "Result", 87, 500, on_change)
  cv.createTrackbar("minLineLength", "Result", 23, 500, on_change)
  cv.createTrackbar("maxLineGap", "Result", 57, 500, on_change)
  
  # Line thresholds
  cv.createTrackbar("centre_min_angle", "Result", 80, 500, on_change)
  cv.createTrackbar("centre_max_angle", "Result", 100, 500, on_change)
  cv.createTrackbar("centre_length", "Result", 20, 360, on_change)          

def create_windows():
  cv.namedWindow("PlayerMask")
  cv.namedWindow("CrowdMask")
  # cv.namedWindow("Grey")
  cv.namedWindow("Blur")
  cv.namedWindow("Tophat")
  cv.namedWindow("Canny")
  cv.namedWindow("Masked Canny")
  cv.namedWindow("Erosion")
  cv.namedWindow("Dilation")
  cv.namedWindow("Result")
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

main()