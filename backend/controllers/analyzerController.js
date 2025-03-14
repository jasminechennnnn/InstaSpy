const SearchHistory = require('../models/SearchHistory');
const InstagramService = require('../services/igService');
const llmService = require('../services/llmService');


// ensure service is ready
let serviceReady = false;
const ensureServiceReady = async () => {
  if (serviceReady) return;
  
  await new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (InstagramService._isReady) {
        clearInterval(checkInterval);
        serviceReady = true;
        resolve();
      }
    }, 100);
    
    // timeout in 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 10000);
  });
};

// loginInstagram
exports.loginInstagram = async (req, res) => {
  try {
    await ensureServiceReady();
    
    const { username, password, code } = req.body;
    const result = await InstagramService.login(username, password, code);
    
    if (result.success) {
      res.status(200).json({ success: true, message: 'Login successful' });
    } else {
      res.status(400).json({ success: false, message: 'Login failed', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Service error', error: error.message });
  }
};

// getFollowees
exports.getFollowees = async (req, res) => {
    try {
        // Change from req.body to req.query to get the target parameter from URL query string
        const { target } = req.query;
        
        // Log the received target parameter for debugging
        console.log("[IG Service] Received target parameter:", target);
        
        if (!target) {
            return res.status(400).json({ success: false, message: 'Target parameter is missing' });
        }
        
        const result = await InstagramService.fetchFollowees(target);
        
        if (result.success) {
            try {
                console.log("[IG Service] result.followees check:", result.followees ? `Length: ${result.followees.length}` : "No followees data");
                if (result.followees && result.followees.length > 0) {
                    console.log("[IG Service] followees sample:", result.followees.slice(0, 2));
                }

                const searcherUsername = 'unknown';
                const searchHistory = await SearchHistory.create({
                    userId: req.user.id,
                    searcherUsername: searcherUsername,
                    targetUsername: result.target,
                    followeeList: result.followees,
                    status: 'processing'
                });
                console.log("[IG Service] searchHistory.followeeList check:", searchHistory.followeeList.length ? "followeeList data exist" : "No!! followeeList data exist");
                console.log("[IG Service] new search history:", searcherUsername, ": ", result.target);
                console.log("[IG Service] search history ID:", searchHistory._id || searchHistory.id);
            
                // Return the followees data to the frontend with search history ID
                return res.status(200).json({ 
                    success: true, 
                    message: 'Fetch successful',
                    followees: result.followees, // Include the followees in the response
                    searchId: searchHistory._id || searchHistory.id // Include the search ID
                });
            
            } catch (dbError) {
                // Log the error, but still try to send a response with followees
                console.error("[IG Service] Database operation error:", dbError);
                
                // Return the followees data without search ID
                return res.status(200).json({ 
                    success: true, 
                    message: 'Fetch successful but failed to create search history',
                    followees: result.followees,
                    error: dbError.message
                });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Fetch failed', error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Service error', error: error.message });
    }
};

// // getFollowees
// exports.getFollowees = async (req, res) => {
//     try {
//         // Change from req.body to req.query to get the target parameter from URL query string
//         const { target } = req.query;
        
//         // Log the received target parameter for debugging
//         console.log("[IG Service] Received target parameter:", target);
        
//         if (!target) {
//             return res.status(400).json({ success: false, message: 'Target parameter is missing' });
//         }
        
//         const result = await InstagramService.fetchFollowees(target);
        
//         if (result.success) {
//             try {
//                 console.log("[IG Service] result.followees check:", result.followees ? `Length: ${result.followees.length}` : "No followees data");
//                 if (result.followees && result.followees.length > 0) {
//                     console.log("[IG Service] followees sample:", result.followees.slice(0, 2));
//                 }

//                 const searcherUsername = 'unknown';
//                 const searchHistory = await SearchHistory.create({
//                     userId: req.user.id,
//                     searcherUsername: searcherUsername,
//                     targetUsername: result.target,
//                     followeeList: result.followees,
//                     status: 'processing'
//                 });
//                 console.log("[IG Service] searchHistory.followeeList check:", searchHistory.followeeList.length ? "followeeList data exist" : "No!! followeeList data exist");
//                 console.log("[IG Service] new search history:", searcherUsername, ": ", result.target);
            
//             } catch (dbError) {
//                 // Just log the error, don't send a response here
//                 console.error("[IG Service] Database operation error:", dbError);
//             }

//             // Return the followees data to the frontend
//             res.status(200).json({ 
//                 success: true, 
//                 message: 'Fetch successful',
//                 followees: result.followees // Include the followees in the response
//             });
//         } else {
//             res.status(400).json({ success: false, message: 'Fetch failed', error: result.error });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Service error', error: error.message });
//     }
// };

// exports.getFollowees = async (req, res) => {
//     try {
//         const { target } = req.body;
        
//         const result = await InstagramService.fetchFollowees(target);
        
//         if (result.success) {
//             try {
//                 console.log("[IG Service] result.followees check:", result.followees ? `Length: ${result.followees.length}` : "No followees data");
//                 if (result.followees && result.followees.length > 0) {
//                         console.log("[IG Service] followees sample:", result.followees.slice(0, 2));
//                     }

//                 const searcherUsername = 'unknown';
//                 const searchHistory = await SearchHistory.create({
//                     userId: req.user.id,
//                     searcherUsername: searcherUsername,
//                     targetUsername: result.target,
//                     followeeList: result.followees,
//                     status: 'processing'
//                 });
//                 console.log("[IG Service] searchHistory.followeeList check:", searchHistory.followeeList.length ? "followeeList data exist" : "No!! followeeList data exist");
//                 console.log("[IG Service] new search history:", searcherUsername, ": ", result.target);
            
//             } catch (dbError) {
//                 // Just log the error, don't send a response here
//                 console.error("[IG Service] Database operation error:", dbError);
//             }

//             res.status(200).json({ 
//                 success: true, message: 'Fetch successful'
//             });
//         } else {
//             res.status(400).json({ success: false, message: 'Fetch failed', error: result.error });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Service error', error: error.message });
//     }
// };

// Logout controller

exports.logoutInstagram = async (req, res) => {
    try {
        const result = await InstagramService.logout();
        if (result) {
            res.status(200).json({ success: true, message: 'Logout successful'});
        } else {
            res.status(500).json({ success: false, message: 'Logout failed'});
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Service error', error: error.message });
    }
  };
  
// This function needs to be called when the application shuts down
exports.shutdownService = async () => {
try {
    await InstagramService.shutdown();
    console.log('[IG Service] Instagram service has been closed');
} catch (error) {
    console.error('[IG Service] Error closing Instagram service:', error);
}
};


// @desc    Manually trigger analysis process
// @route   POST /api/analyzer/process/:id
// @access  Private
exports.triggerAnalysisProcess = async (req, res) => {
    try {
        const searchId = req.params.id;
        // Get model from request body or use default
        const { model = 'gemini' } = req.body;
        
        if (!searchId) {
            return res.status(400).json({
                success: false,
                message: 'Search ID required'
            });
        }
        
        // Get search history
        const searchHistory = await SearchHistory.findById(searchId);
        
        if (!searchHistory) {
            return res.status(404).json({
                success: false,
                message: 'Search record not found'
            });
        }
        
        // Check if the record belongs to this user
        if (searchHistory.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No permission to access this search record'
            });
        }
        
        // Check if followee list exists in the database
        if (!searchHistory.followeeList || searchHistory.followeeList.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'This search has no followee list'
            });
        }
        
        // Update status to processing
        searchHistory.status = 'processing';
        searchHistory.model = model; // Store which model is being used
        await searchHistory.save();
        
        // Start analysis process with the specified model
        exports.processAnalysis(searchId, model);
        
        return res.status(200).json({
            success: true,
            message: 'Analysis process has begun',
            searchId: searchId,
            model: model
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Process analysis - exported for testing purposes
exports.processAnalysis = async (searchId, model = 'claude') => {
    try {
        // Get search history record
        const searchHistory = await SearchHistory.findById(searchId);
        if (!searchHistory) {
            console.error(`[LLM Service] Search record not found: ${searchId}`);
            return;
        }
        // Get followee list from the database
        const followeeList = searchHistory.followeeList;
        
        if (!followeeList || followeeList.length === 0) {
            console.error(`[LLM Service] Followee list not found: ${searchId}`);
            searchHistory.status = 'failed';
            searchHistory.errorMessage = 'Followee list not found';
            await searchHistory.save();
            return;
        }
        // Perform LLM analysis with the specified model
        try {
            console.log(`[LLM Service] Starting analysis of user ${searchHistory.targetUsername}'s followee list using ${model}`);
            
            const analysisResult = await llmService.analyzeFollowees(
                searchHistory.targetUsername,
                followeeList,
                model
            );

            searchHistory.analysisResult = {
                model: model,
                time: new Date(Date.now() + (8 * 60 * 60 * 1000)), // UTC+8
                result: analysisResult
            };
            searchHistory.status = 'completed';
            await searchHistory.save();
            
            console.log(`[LLM Service] Analysis completed: ${searchId}`);
        } catch (error) {
            console.error(`[LLM Service] LLM analysis failed: ${error.message}`);
            searchHistory.status = 'failed';
            searchHistory.errorMessage = `Analysis failed: ${error.message}`;
            await searchHistory.save();
        }
    } catch (err) {
        console.error(`[LLM Service] Error processing analysis: ${err.message}`);
    }
};