import numpy as np
import cv2 as cv
from bounding_box import bounding_box as bb
import utilties as utils
# from main import resolution
resolution = (640, 360)

def detect_players(settings, frame, model):
  detections = model(frame)
  detections = detections.pandas().xyxy[0]
  detections = utils.classify_players(settings, frame, detections)
  
  # Preview 
  if (settings["preview"]["enabled"] and settings["preview"]["stage"] == 'detections'):
    preview = frame.copy()
    for detection in detections:
      bb.add(preview, detection['xmin'], detection['ymin'], detection['xmax'], detection['ymax'], detection['name'], "purple")
      cv.circle(preview, (int(detection['xmin'] + ((detection['xmax'] - detection['xmin']) / 2)), int(detection["ymax"])), 2, detection['colour'], 2, cv.LINE_AA)
  else:
    preview = False
  return detections, preview

def generate_crowd_mask(settings, frame):
  # Convert frame to HSV
  hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)

  # Create mask
  crowd_mask = cv.inRange(hsv, np.array(settings["crowdMask"]["hsv"]["lower"]), np.array(settings["crowdMask"]["hsv"]["upper"]))

  # Settings
  erosion_size = settings["crowdMask"]["erosion"]["size"]
  erosion_shape = settings["crowdMask"]["erosion"]["shape"]
  dilation_size = settings["crowdMask"]["dilation"]["size"]
  dilation_shape = settings["crowdMask"]["dilation"]["shape"]
  closing_size = settings["crowdMask"]["closing"]["size"]
  closing_shape = settings["crowdMask"]["closing"]["shape"]
  opening_size = settings["crowdMask"]["opening"]["size"]
  opening_shape = settings["crowdMask"]["opening"]["shape"]

  # Erode mask
  if settings["crowdMask"]["erosion"]["enabled"]:
    erode_element = cv.getStructuringElement(utils.morph_shape(erosion_shape), (2 * erosion_size + 1, 2 * erosion_size + 1), (erosion_size, erosion_size))
    crowd_mask = cv.erode(crowd_mask, erode_element)

  # Dilate mask
  if settings["crowdMask"]["dilation"]["enabled"]:
    dilate_element = cv.getStructuringElement(utils.morph_shape(dilation_shape), (2 * dilation_size + 1, 2 * dilation_size + 1), (dilation_size, dilation_size))
    crowd_mask = cv.dilate(crowd_mask, dilate_element)
    
  # Closing
  if settings["crowdMask"]["closing"]["enabled"]:
    closing_element = cv.getStructuringElement(utils.morph_shape(closing_shape), (2 * closing_size + 1, 2 * closing_size + 1), (closing_size, closing_size))
    crowd_mask = cv.morphologyEx(crowd_mask, cv.MORPH_CLOSE, closing_element)
    
  # Opening
  if settings["crowdMask"]["opening"]["enabled"]:
    opening_element = cv.getStructuringElement(utils.morph_shape(opening_shape), (2 * opening_size + 1, 2 * opening_size + 1), (opening_size, opening_size))
    crowd_mask = cv.morphologyEx(crowd_mask, cv.MORPH_OPEN, opening_element)
  
  # Invert
  if settings["crowdMask"]["invert"]:
    crowd_mask = 255 - crowd_mask
  
  # Preview 
  if settings["preview"]["enabled"] and settings["preview"]["stage"] == 'crowdMask':
    if settings["crowdMask"]["overlap"]:
      preview = frame.copy()
      preview = cv.bitwise_and(preview, preview, mask=crowd_mask)
    else:
      preview = crowd_mask
  else:
    preview = False
  return crowd_mask, preview

def generate_player_mask(settings, frame):
  # Convert frame to HSV
  hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)

  # Create mask
  player_mask = cv.inRange(hsv, np.array(settings["playerMask"]["hsv"]["lower"]), np.array(settings["playerMask"]["hsv"]["upper"]))

  # Settings
  erosion_size = settings["playerMask"]["erosion"]["size"]
  erosion_shape = settings["playerMask"]["erosion"]["shape"]
  dilation_size = settings["playerMask"]["dilation"]["size"]
  dilation_shape = settings["playerMask"]["dilation"]["shape"]
  closing_size = settings["playerMask"]["closing"]["size"]
  closing_shape = settings["playerMask"]["closing"]["shape"]
  opening_size = settings["playerMask"]["opening"]["size"]
  opening_shape = settings["playerMask"]["opening"]["shape"]

  # Erode mask
  if settings["playerMask"]["erosion"]["enabled"]:
    erode_element = cv.getStructuringElement(utils.morph_shape(erosion_shape), (2 * erosion_size + 1, 2 * erosion_size + 1), (erosion_size, erosion_size))
    player_mask = cv.erode(player_mask, erode_element)

  # Dilate mask
  if settings["playerMask"]["dilation"]["enabled"]:
    dilate_element = cv.getStructuringElement(utils.morph_shape(dilation_shape), (2 * dilation_size + 1, 2 * dilation_size + 1), (dilation_size, dilation_size))
    player_mask = cv.dilate(player_mask, dilate_element)
    
  # Closing
  if settings["playerMask"]["closing"]["enabled"]:
    closing_element = cv.getStructuringElement(utils.morph_shape(closing_shape), (2 * closing_size + 1, 2 * closing_size + 1), (closing_size, closing_size))
    player_mask = cv.morphologyEx(player_mask, cv.MORPH_CLOSE, closing_element)
    
  # Opening
  if settings["playerMask"]["opening"]["enabled"]:
    opening_element = cv.getStructuringElement(utils.morph_shape(opening_shape), (2 * opening_size + 1, 2 * opening_size + 1), (opening_size, opening_size))
    player_mask = cv.morphologyEx(player_mask, cv.MORPH_OPEN, opening_element)
  
  # Invert
  if settings["playerMask"]["invert"]:
    player_mask = 255 - player_mask
  
  # Preview 
  if settings["preview"]["enabled"] and settings["preview"]["stage"] == 'playerMask':
    if settings["playerMask"]["overlap"]:
      preview = frame.copy()
      preview = cv.bitwise_and(preview, preview, mask=player_mask)
    else:
      preview = player_mask
  else:
    preview = False
  return player_mask, preview

def generate_canny(settings, frame, crowd_mask, player_mask):
  # Settings
  blur_size = settings["canny"]["blur"]["size"]
  threshold_one = settings["canny"]["thresholdOne"]
  threshold_two = settings["canny"]["thresholdTwo"]
  masked = settings["canny"]["masked"]

  erosion_size = settings["canny"]["erosion"]["size"]
  erosion_shape = settings["canny"]["erosion"]["shape"]
  dilation_size = settings["canny"]["dilation"]["size"]
  dilation_shape = settings["canny"]["dilation"]["shape"]
  closing_size = settings["canny"]["closing"]["size"]
  closing_shape = settings["canny"]["closing"]["shape"]
  opening_size = settings["canny"]["opening"]["size"]
  opening_shape = settings["canny"]["opening"]["shape"]

  # Apply blur
  blur = frame
  if settings["canny"]["blur"]["enabled"]:
    if blur_size % 2 == 0:
      blur_size += 1
    blur = cv.GaussianBlur(frame, (blur_size, blur_size), 0)
  
  # Turn grey
  grey = cv.cvtColor(blur, cv.COLOR_BGR2GRAY)

  # Apply canny 
  canny = cv.Canny(grey, threshold_one, threshold_two, 3)
  
  # Add masks
  masked_canny = cv.bitwise_and(canny, canny, mask=crowd_mask)
  masked_canny = cv.bitwise_and(masked_canny, masked_canny, mask=player_mask)

  # Erode mask
  if settings["canny"]["erosion"]["enabled"]:
    erode_element = cv.getStructuringElement(utils.morph_shape(erosion_shape), (2 * erosion_size + 1, 2 * erosion_size + 1), (erosion_size, erosion_size))
    masked_canny = cv.erode(masked_canny, erode_element)
    if not masked:
      canny = cv.erode(canny, erode_element)

  # Dilate mask
  if settings["canny"]["dilation"]["enabled"]:
    dilate_element = cv.getStructuringElement(utils.morph_shape(dilation_shape), (2 * dilation_size + 1, 2 * dilation_size + 1), (dilation_size, dilation_size))
    masked_canny = cv.dilate(masked_canny, dilate_element)
    if not masked:
      canny = cv.dilate(canny, dilate_element)
    
  # Closing
  if settings["canny"]["closing"]["enabled"]:
    closing_element = cv.getStructuringElement(utils.morph_shape(closing_shape), (2 * closing_size + 1, 2 * closing_size + 1), (closing_size, closing_size))
    masked_canny = cv.morphologyEx(masked_canny, cv.MORPH_CLOSE, closing_element)
    if not masked:
      canny = cv.morphologyEx(canny, cv.MORPH_CLOSE, closing_element)
    
  # Opening
  if settings["canny"]["opening"]["enabled"]:
    opening_element = cv.getStructuringElement(utils.morph_shape(opening_shape), (2 * opening_size + 1, 2 * opening_size + 1), (opening_size, opening_size))
    masked_canny = cv.morphologyEx(masked_canny, cv.MORPH_OPEN, opening_element)
    if not masked:
      canny = cv.morphologyEx(canny, cv.MORPH_OPEN, opening_element)
  
  # Preview 
  if settings["preview"]["enabled"] and settings["preview"]["stage"] == 'canny':
    if settings["canny"]["overlap"]:
      if settings["canny"]["masked"]:
        inverted_canny = 255 - masked_canny
      else:
        inverted_canny = 255 - canny

      preview = frame.copy()
      preview = cv.bitwise_and(preview, preview, mask=inverted_canny)
    else:
      if settings["canny"]["masked"]:
        preview = masked_canny
      else:
        preview = canny
  else:
    preview = False
  return masked_canny, preview

def generate_lines(settings, frame, canny):
  # Settings
  threshold = settings["lines"]["threshold"]
  min_line_length = settings["lines"]["minLineLength"]
  max_line_gap = settings["lines"]["maxLineGap"]
  resolution = settings["lines"]["resolution"]
  rho = settings["lines"]["rho"]

  min_distance = settings["lines"]["prune"]["minDistance"]
  min_angle = settings["lines"]["prune"]["minAngle"]

  # Apply hough
  lines = cv.HoughLinesP(canny, rho, resolution * np.pi / 180, threshold=threshold, minLineLength=min_line_length, maxLineGap=max_line_gap)
  if lines is None:
    lines = []
  
  # Prune lines
  if settings["lines"]["prune"]["enabled"]:
    bundler = utils.HoughBundler(min_distance, min_angle)
    lines = bundler.process_lines(lines)
    
  # Classify lines
  classified_lines = utils.classify_lines(lines)
  
  # Preview 
  if (settings["preview"]["enabled"] and settings["preview"]["stage"] == 'lines'):
    preview = frame.copy()
    preview = utils.draw_lines(classified_lines, preview)
  else:
    preview = False
    
  return classified_lines, preview

def generate_circles(settings, frame, canny):
  # Settings
  # threshold = settings["lines"]["threshold"]
  # min_line_length = settings["lines"]["minLineLength"]
  # max_line_gap = settings["lines"]["maxLineGap"]
  # resolution = settings["lines"]["resolution"]
  # rho = settings["lines"]["rho"]

  # min_distance = settings["lines"]["prune"]["minDistance"]
  # min_angle = settings["lines"]["prune"]["minAngle"]

  # Apply hough
  circles = cv.HoughCircles(canny, cv.HOUGH_GRADIENT, 1, 20, param1=50, param2=30, minRadius=0, maxRadius=0)
  if circles is not None:
    circles = np.uint16(np.around(circles))
  
  # # Prune lines
  # if settings["lines"]["prune"]["enabled"]:
  #   bundler = utils.HoughBundler(min_distance, min_angle)
  #   lines = bundler.process_lines(lines)
    
  # # Classify lines
  # classified_lines = utils.classify_lines(lines)
  
  # Preview 
  if (settings["preview"]["enabled"] and settings["preview"]["stage"] == 'circles'):
    preview = frame.copy()
    preview = utils.draw_circles(circles, preview)
  else:
    preview = False
    
  return circles, preview

def generate_intersections(settings, frame, lines):
  intersections = []
  h_lines = []
  v_lines = []

  for line in lines:
    # Split lines into horizontal/vertical groups using their classifed lines      
    if line["id"] == 2 or line["id"] == 4:
      h_lines.append(line)
    else:
      v_lines.append(line)
      
    # Split lines into horizontal/vertical groups using line angle
    # tmpAngle = line["angle"]
    # if tmpAngle < 0:
    #   tmpAngle = tmpAngle * -1

    # if tmpAngle < 15:
    #   h_lines.append(line)
    # else:
    #   v_lines.append(line)
      
  # Find intersections 
  for vline in v_lines:
    for hline in h_lines:
      intersection = utils.get_intersection(vline, hline)
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
        
        for int_dict in utils.intersection_dict:
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
            
  # Preview 
  if (settings["preview"]["enabled"] and settings["preview"]["stage"] == 'intersections'):
    preview = frame.copy()
    preview = utils.draw_intersections(intersections, preview)
  else:
    preview = False
  return intersections, preview

def apply_homography(settings, frame, intersections, detections, last_matrix):
  # Cannot do homography if less than 4 intersections
  src_pts = []
  if len(intersections) > 3:   
    # Create src points array
    source = []
    for intersection in intersections:
      source.append([intersection["x"], intersection["y"]])
    source = np.array(source)
    
    # Create dst points array
    destination = []
    for intersection in intersections:
      temp_dest = []
      for int_dict in utils.intersection_dict:
        if int_dict["id"] == intersection["id"]:
          temp_dest = [int_dict["x"] * resolution[0], int_dict["y"] * resolution[1]]
          destination.append(temp_dest)
          # break
      
      if len(temp_dest) == 0:
        noHomographyPreview = False
        if (settings["preview"]["enabled"] and settings["preview"]["stage"] == 'homography'):
          cv.putText(noHomographyPreview, "No homography applied", (10, 50), cv.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv.LINE_AA)
        return [], {}, noHomographyPreview, last_matrix
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
      noHomographyPreview = False
      if (settings["preview"]["enabled"] and settings["preview"]["stage"] == 'homography'):
        cv.putText(noHomographyPreview, "No homography applied", (10, 50), cv.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv.LINE_AA)
      return [], {}, noHomographyPreview, last_matrix

    # Reshape for homography
    src_pts = np.array(source).reshape(-1,1,2)
    dst_pts = np.array(destination).reshape(-1,1,2)
    
    H, _ = cv.findHomography(src_pts, dst_pts)
  
  # Apply homography matrix to detections
  transformed_detections = []
  corners = {}
  if len(src_pts) > 0:
    transformed_detections = utils.transform_detections(H, detections)
    corners = utils.transform_frame_boundary(H)
    last_matrix = H
  elif type(last_matrix) != bool:
    transformed_detections = utils.transform_detections(last_matrix, detections)
    corners = utils.transform_frame_boundary(last_matrix)
    H = last_matrix
  else:
    noHomographyPreview = False
    if (settings["preview"]["enabled"] and settings["preview"]["stage"] == 'homography'):
      cv.putText(noHomographyPreview, "No homography applied", (10, 50), cv.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv.LINE_AA)
    return [], {}, noHomographyPreview, last_matrix
  
  # Preview 
  if (settings["preview"]["enabled"] and settings["preview"]["stage"] == 'homography'):
    preview = frame.copy()
    preview = cv.warpPerspective(preview, H, dsize=resolution, flags=cv.INTER_NEAREST, borderMode=cv.BORDER_CONSTANT, borderValue=0)

    # Draw destination intersections
    for intersection in utils.intersection_dict:
      cv.circle(preview, (int(intersection["x"] * resolution[0]), int(intersection["y"] * resolution[1])), 4, (0, 255, 255), 5, cv.LINE_AA)
    
    # Draw dots for transformed detections
    for detection in transformed_detections:
      cv.circle(preview, (int(detection["x"]), int(detection["y"])), 5, (0, 0, 255), 4, cv.LINE_AA)
    
  else:
    preview = False
  return transformed_detections, corners, preview, last_matrix