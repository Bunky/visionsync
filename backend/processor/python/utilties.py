import cv2 as cv
import base64
import numpy as np
import math
import time
from threading import Thread
from sklearn.cluster import MiniBatchKMeans
# from main import resolution
resolution = (640, 360)
first_frame = True
mbKmeans = False
kmeans = False

def classify_players(settings, frame, detections):
  global first_frame
  global mbKmeans
  global kmeans
  classified_detections = []
  
  for index, detection in detections.iterrows():
    if detection["class"] == 0:
      # Crop the frame to bounding box
      cropped_frame = frame[int(detection['ymin']):int(detection['ymax']), int(detection['xmin']):int(detection['xmax'])]
          
      # Invert player mask
      mask = cv.inRange(cropped_frame, np.array(settings["playerMask"]["hsv"]["lower"]), np.array(settings["playerMask"]["hsv"]["upper"]))
      mask = 255 - mask

      # Get average colour
      mean = cv.mean(cropped_frame, mask=mask)

      detection["colour"] = (round(mean[2], 0), round(mean[1], 0), round(mean[0], 0)) # BGR to RGB
    elif detection['class'] == 1: # ball
      detection["colour"] = (255, 255, 255)
    elif detection['class'] == 2: # goal
      detection["colour"] = (0, 255, 0)
      
    detection["xmin"] = round(detection["xmin"] / resolution[0] * 100, 2)
    detection["ymin"] = round(detection["ymin"] / resolution[1] * 100, 2)
    detection["xmax"] = round(detection["xmax"] / resolution[0] * 100, 2)
    detection["ymax"] = round(detection["ymax"] / resolution[1] * 100, 2)
    detection["team"] = -1 # Set default team to unknown

    classified_detections.append(detection)
  
  # k-mean team classification using clustered colours
  rgb_colours = []
  for d in classified_detections:
    if d["class"] == 0:
      rgb_colours.append([d["colour"][0], d["colour"][1], d["colour"][2]])

  if (len(rgb_colours) > 1): # Makes sure enough players
    X = np.array(rgb_colours)
    if first_frame is True:
      first_frame = False
      mbKmeans = MiniBatchKMeans(
        n_clusters = 2,
        batch_size = 1,
        n_init = 10,
        max_no_improvement = 10,
      )
      kmeans = mbKmeans.fit(X)

  if kmeans is not False:
    for d in classified_detections:
      if d["class"] == 0:
        cluster0 = kmeans.cluster_centers_[0]
        cluster1 = kmeans.cluster_centers_[1]

        # euclidean distance0 for cluster0
        distance0 = cv.norm([[d["colour"][0], d["colour"][1], d["colour"][2]]] - cluster0, cv.NORM_L2)
        # euclidean distance1 for cluster1
        distance1 = cv.norm([[d["colour"][0], d["colour"][1], d["colour"][2]]] - cluster1, cv.NORM_L2)
        
        # if distance0 < distance1: team is 0, else 1
        if distance0 < distance1:
          if distance0 < 150: # Only assign team if distance below 100 threshold
            d["team"] = 0
            d["colour"] = cluster0
        else:
          if distance1 < 150:
            d["team"] = 1 # Only assign team if distance below 100 threshold
            d["colour"] = cluster1

  return classified_detections  

def morph_shape(val):
  if val == 0:
    return cv.MORPH_RECT
  elif val == 1:
    return cv.MORPH_CROSS
  elif val == 2:
    return cv.MORPH_ELLIPSE

def get_base64_from_frame(frame):
  _, buffer = cv.imencode('.jpg', frame)
  return base64.b64encode(buffer).decode("utf-8")

def classify_lines(settings, lines):
  classified_lines = []
  for line in lines:
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
    centre_min_angle = settings["lineClassifications"]["centre"]["angle"][0]
    centre_max_angle = settings["lineClassifications"]["centre"]["angle"][1]
    centre_min_length = settings["lineClassifications"]["centre"]["length"][0]
    centre_max_length = settings["lineClassifications"]["centre"]["length"][1]
    
    # Goal Line
    goal_min_angle = settings["lineClassifications"]["goal"]["angle"][0]
    goal_max_angle = settings["lineClassifications"]["goal"]["angle"][1]
    goal_min_length = settings["lineClassifications"]["goal"]["length"][0]
    goal_max_length = settings["lineClassifications"]["goal"]["length"][1]
    
    # Box Line
    box_min_angle = settings["lineClassifications"]["penaltyBox"]["angle"][0]
    box_max_angle = settings["lineClassifications"]["penaltyBox"]["angle"][1]
    box_min_length = settings["lineClassifications"]["penaltyBox"]["length"][0]
    box_max_length = settings["lineClassifications"]["penaltyBox"]["length"][1]
    
    # 6yrd Line
    six_min_angle = settings["lineClassifications"]["sixYardLine"]["angle"][0]
    six_max_angle = settings["lineClassifications"]["sixYardLine"]["angle"][1]
    six_min_length = settings["lineClassifications"]["sixYardLine"]["length"][0]
    six_max_length = settings["lineClassifications"]["sixYardLine"]["length"][1]
    
    # Box Edge Line
    boxedge_min_angle = settings["lineClassifications"]["penaltyBoxSide"]["angle"][0]
    boxedge_max_angle = settings["lineClassifications"]["penaltyBoxSide"]["angle"][1]
    boxedge_min_length = settings["lineClassifications"]["penaltyBoxSide"]["length"][0]
    boxedge_max_length = settings["lineClassifications"]["penaltyBoxSide"]["length"][1]
    
    # Side Line
    side_min_angle = settings["lineClassifications"]["side"]["angle"][0]
    side_max_angle = settings["lineClassifications"]["side"]["angle"][1]
    side_min_length = settings["lineClassifications"]["side"]["length"][0]
    side_max_length = settings["lineClassifications"]["side"]["length"][1]
      
    # Return line with classification
    # LineID, Point1, Point2, Angle of line, Length of line, Line vert/hori
    
    lineId = 0
    # Centre line
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
    
    # if lineId != 0:
    classified_lines.append({
      "id": lineId,
      "point1": [x1, y1],
      "point2": [x2, y2],
      "midpoint": line_midpoint,
      "angle": angle_of_line,
      "length": length_of_line,
      "direction": direction
    })
  
  return classified_lines

def draw_lines(lines, frame):
  for line in lines:
    # Draw midpoint
    cv.circle(frame, (int(line["midpoint"][0]), int(line["midpoint"][1])), 5, (255, 0, 255), 5, cv.LINE_AA)
    
    # Draw line
    if line["id"] == 0:
      cv.line(frame, line["point1"], line["point2"], (255, 255, 255), 2, cv.LINE_AA)
      cv.putText(frame, str("C: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv.LINE_AA)
    elif line["id"] == 1:
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
      cv.line(frame, line["point1"], line["point2"], (255, 0, 255), 2, cv.LINE_AA)
      cv.putText(frame, str("6: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 128, 128), 1, cv.LINE_AA)
    elif line["id"] == 6:
      cv.line(frame, line["point1"], line["point2"], (0, 255, 0), 2, cv.LINE_AA)
      cv.putText(frame, str("G: {:.2f}".format(line["angle"])), line["point1"], cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1, cv.LINE_AA)
      
  return frame

def get_intersection(line1, line2):
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

def draw_intersections(intersections, frame):
  for intersection in intersections:
    cv.circle(frame, (int(intersection["x"]), int(intersection["y"])), 5, (0, 255, 255), 2, cv.LINE_AA)
    cv.putText(frame, str(intersection["id"]), (int(intersection["x"]), int(intersection["y"])), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2, cv.LINE_AA)
  return frame

def transform_detections(matrix, detections):
  transformed_detections = []
  for detection in detections:
    # Use ymax and xcentre as the point at the players feet
    xmin = (detection['xmin'] / 100) * resolution[0]
    xmax = (detection['xmax'] / 100) * resolution[0]
    ymax = (detection['ymax'] / 100) * resolution[1]

    feet = np.array([[[xmin + ((xmax - xmin) / 2), ymax]]], dtype=np.float32)
    feet_converted = cv.perspectiveTransform(feet, matrix)

    transformed_detections.append({
      "class": detection['class'],
      "colour": [round(detection["colour"][0], 0), round(detection["colour"][1], 0), round(detection["colour"][2], 0)],
      "team": detection['team'],
      "x": round(float(feet_converted[0][0][0] / resolution[0]) * 100, 2),
      "y": round(float(feet_converted[0][0][1] / resolution[1]) * 100, 2)
    })
    
  return transformed_detections

def transform_frame_boundary(matrix):
  transformed_corners = {}
  corners = {
    "tl": [0, 0],
    "tr": [resolution[0], 0],
    "bl": [0, resolution[1]],
    "br": [resolution[0], resolution[1]]
  }
  for corner in corners:
    # Use ymax and xcentre as the point at the players feet
    coords = np.array([[corners[corner]]], dtype=np.float32)
    coords_converted = cv.perspectiveTransform(coords, matrix)

    transformed_corners[corner] = {
      "x": round(float(coords_converted[0][0][0] / resolution[0]) * 100, 2),
      "y": round(float(coords_converted[0][0][1] / resolution[1]) * 100, 2)
    }
    
  return transformed_corners

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

class ThreadedCamera(object):
  def __init__(self, src=0):
    self.capture = cv.VideoCapture(src)
    # self.capture.set(cv.CAP_PROP_BUFFERSIZE, 2)

    # FPS = 1/desired FPS
    self.FPS = 1/30

    # Start frame retrieval thread
    self.paused = False
    self.thread = Thread(target=self.update, args=())
    self.thread.daemon = True
    self.thread.start()

  def update(self):
    while True:
      if not self.paused:
        if self.capture.isOpened():
          (self.status, self.frame) = self.capture.read()

          if np.shape(self.frame) == ():
            self.capture.set(cv.CAP_PROP_POS_FRAMES, 0)
            continue

      time.sleep(self.FPS)
    
  def get_frame(self):
    return self.frame
  
  def play(self):
    self.paused = False
    
  def pause(self):
    self.paused = True
    
  def get_paused(self):
    return self.paused

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
  