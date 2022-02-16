# Using machine learning to derive statistics from football broadcasts in 
real-time 


## Introduction 
Statistics are used in a variety of industries related to football, such as broadcasts, sports betting, and performance analysis. Current systems have a heavy reliance on user input to monitor and verify statistics through various proprietary software (Premier League, 2020). By automating analysis of matches, both time and money can be saved while still providing reliable data in real-time. 

## Solution 

The proposed solution involves development of a full-stack web application to analyse football matches through broadcast feeds to derive statistics in real-time using machine learning. As an example, heatmaps and player paths can be derived from player positions on the pitch by using homography and player tracking (see Figure 1 and Figure 2). A solution such as this could be used by broadcast studios such as BT Sports or football club coaches for player performance analysis. 

[figures]

Development of the solution will involve multiple phases such as requirements elicitation, design, development, and testing. Through research, requirements will be formed to outline the core features and functionality of the application. The design stage will produce mock-ups and wireframes following accessible UI and UX design standards, and the development and testing stages will take place following agile methodology building upon a minimum-viable product, with end-to-end testing throughout. 

The webapp will be created using MERN stack, providing a UI for users to interact and control the application. Machine learning will be handled by TensorFlow, either running in browser using TensorFlowJS, or directly on a machine. For this solution, TensorFlow is likely to be used in the middleware allowing for broader device support and therefore not rely on the performance of the user’s device to process video, ensuring consistent and reliable results for a range of users. 

One of the main challenges that will be faced with this implementation is the creation of reliable machine learning models that can analyse broadcast footage with little error. To best assist this, datasets such as SoccerNet will be used to help train and test models on real footage. SoccerNet provides sports classification data and homography samples to build and test machine learning models and will be crucial for developing reliable models (SoccerNet, 2022). 

## Requirements 

For the solution, below is a list of high-level requirements that are subject to change. 

[table]

## High-Level Requirements

|1 | Webapp | Interactive web UI allowing users to easily manage and view analysed videos. |
|2 | Video Integration |Allow users to add any video for analysis through upload, stream or supplied YouTube link. |
|3 | Data Analysis | Derive statistics from variables from analysed feed such as player positions, possession, player movement.|
|4 | Analysis Presentation | Present analysis in real-time on the webapp in an easy-to-understand format.|
|5 | 2D Player Map |Show birds-eye-view map of players on the pitch and show location in 2D, in real-time. |
|6 | Object Tracking | Tracking of individual players to collect individual statistics. Further tracking will be used to determine teams, and detecting the balls position, as well as other variables such as the referee.|

## Stakeholders 
This application will be targeted towards use with both sports broadcasters and football coaches for performance analysis. For broadcasting, the real-time statistics can be used to aid commentators or be displayed on screen providing viewers with easy to interpret data through heatmaps, maps and visualisations. For football coaches, the application can be used to analyse player performance to help train and develop individual player’s by focusing on statistical weaknesses. 

## Related Literature 

Various studies have already taken place in this field and will be used as a starting point to aid in design and development of the application. 
Cui (2018) investigates player detection on broadcast videos using Fuzzy Decision Support Vector Machine (FD-OCSVM) to improve detection by using a decision function. Shi (2020), explores various methods and techniques for player tracking, evaluating their effectiveness and accuracy. Both Convolution Neural Networks (CNN) and Histogram-based detectors are discussed. Manikanta et al. (2018), implement methods for tracking players in broadcast videos using machine learning and computer vision outlining various techniques to improve accuracy and reliability. Jiang et al. (2020) introduce the SoccerDB dataset outlining its use cases and exploring methods for each scenario. 

## References 

* Cui, C. (2018) “Player Detection based on Support Vector Machine in Football Videos,” International Journal of Performability Engineering, 14(2). doi: 
10.23940/ijpe.18.02.p12.309319. 
Jiang, Y. et al. (2020) “SoccerDB,” Proceedings of the 3rd International Workshop on Multimedia Content Analysis in Sports. doi: 10.1145/3422844.3423051. 
* Li, Y., Dore, A. and Orwell, J. (2005) “Evaluating the performance of systems for tracking football players and ball,” Proceedings. IEEE Conference on Advanced Video and Signal Based Surveillance, 2005. doi: 10.1109/avss.2005.1577342. 

* Ma, Y., Feng, S. and Wang, Y. (2018) “Fully-Convolutional Siamese Networks for Football Player Tracking,” 2018 IEEE/ACIS 17th International Conference on Computer and Information Science (ICIS). doi: 10.1109/icis.2018.8466503. 
Manikanta, S. et al. (2018) “Tracking Players in Broadcast Sports,” Journal of Multimedia Information System, 5(4), pp. 257–264. doi: 10.9717/JMIS.2018.5.4.257. 
* Mullen, S. (2020) “The story behind Tavernier’s form,” BBC Sport, 7 December. Available at: https://www.bbc.co.uk/sport/football/55209149 (Accessed: 18 January 2022). 
* Premier League (2020) Data Capture, Player & Club Statistics | Premier League, 
www.premierleague.com. Available at: https://www.premierleague.com/stats/clarification. 
* Shankar, Y. (2022) Estimating a Homography Matrix, Medium. Available at: 
https://towardsdatascience.com/estimating-a-homography-matrix-522c70ec4b2c 
(Accessed: 18 January 2022). 
* Shi, S. (2020) Comparison of Player Tracking-by-Detection Algorithms in Football Videos. Available at: http://kth.diva-portal.org/smash/record.jsf?pid=diva2%3A1501273&dswid=-5969 (Accessed: 19 January 2022). 
SoccerNet (2022) SoccerNet-v2, soccer-net.org. Available at: https://soccer-net.org/ 
(Accessed: 18 January 2022). 
* Thinh, N. H. et al. (2019) “A video-based tracking system for football player analysis using Efficient Convolution Operators,” 2019 International Conference on Advanced Technologies for Communications (ATC). doi: 10.1109/atc.2019.8924544. 