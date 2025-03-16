const { spawn } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For generating request IDs

const pendingRequests = new Map();
const pendingBatches = new Map();

const igService = spawn('python3',
                [path.join(process.env.PYTHON_SCRIPT_PATH, 'ig_fetcher.py')]);

let serviceReady = false;

// Process stdout from the Python service
igService.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
  
    lines.forEach(line => {
        try {
            const response = JSON.parse(line);
            console.log(line)

            // Handle service status messages
            if (response.status) {
                console.log(`[IG Service] ${response.status}: ${response.message}`);
                
                if (response.status === 'ready') {
                    serviceReady = true;
                }
                return;
            }

            // Handle command responses
            if (response.command && response.request_id) {
              const requestId = response.request_id;
                
              if (response.success === "false") {
                const callback = pendingRequests.get(requestId);
                if (callback) {
                    callback(null, response);
                    pendingRequests.delete(requestId);
                }
              } else {
                if (response.command === "fetch_response") {
                  // init batch collector
                  if (!pendingBatches.has(requestId)) {
                      pendingBatches.set(requestId, {
                      metadata: response,
                      batches: [],
                      totalBatches: 0,
                      receivedBatches: 0
                      });
                  }
                } else if (response.command === "fetch_batch") {
                  // init batch collector
                  if (!pendingBatches.has(requestId)) {
                      pendingBatches.set(requestId, {
                      metadata: response,
                      batches: [],
                      totalBatches: 0,
                      receivedBatches: 0
                      });
                  }
                  // collect batch data
                  const batchInfo = pendingBatches.get(requestId);
                  if (batchInfo) {
                      // push batch to batchInfo.batches
                      batchInfo.batches.push(...response.data);
                      batchInfo.totalBatches = response.total_batches;
                      batchInfo.receivedBatches++;
                      console.log("batchInfo.receivedBatches =", batchInfo.receivedBatches);
                      console.log("batchInfo.totalBatches =", batchInfo.totalBatches)
                      
                      // collection completed!
                      if (batchInfo.receivedBatches == batchInfo.totalBatches) {
                          const callback = pendingRequests.get(requestId);
                          if (callback) {
                              // complete result
                              const { command, request_id, success, target } = batchInfo.metadata;
                              const completeResult = {
                                  command,
                                  request_id,
                                  success,
                                  target,
                                  followees: batchInfo.batches // bug fixed==
                              };
                              
                              // check completeResult.success
                              // console.log("completeResult.success =", completeResult.success);
                              // console.log("batchInfo.metadata =", JSON.stringify(batchInfo.metadata));
                              
                              callback(null, completeResult);
                              pendingRequests.delete(requestId);
                              pendingBatches.delete(requestId);
                          }
                      }
                  }
                } else {
                  const callback = pendingRequests.get(requestId);
                  if (callback) {
                      callback(null, response);
                      pendingRequests.delete(requestId);
                  }
                }
              }
            } 
        } catch (error) {
            console.error('[IG Service] Failed to parse response:', line);
        }
    });
});

// Handle errors
igService.stderr.on('data', (data) => {
  const errorMsg = data.toString().trim();
  console.error(`[IG Service Error] ${errorMsg}`);
  
  // fetch error
  if (errorMsg.includes("User not found") || 
      errorMsg.includes("does not exist") || 
      errorMsg.includes("Status 404")) {
      
      // 
      if (pendingRequests.size > 0) {
          const [latestId] = [...pendingRequests.keys()].slice(-1);
          const callback = pendingRequests.get(latestId);
          if (callback) {
              callback(null, {
                  success: false,
                  error: "User not found"
              });
              pendingRequests.delete(latestId);
              pendingBatches.delete(latestId);
              console.log("[IG Service] Triggered error callback for request", latestId);
          }
      }
  }
});

// Handle process exit
igService.on('close', (code) => {
    console.log(`[IG Service] Process exited with code ${code}`);
    
    // Reject all pending requests
    for (const [requestId, callback] of pendingRequests.entries()) {
        callback(new Error('Service terminated unexpectedly'), null);
        pendingRequests.delete(requestId);
    }
});

/*
 * Send a command to the Instagram service
 * @param {Object} command - The command object to send
 * @param {Function} callback - Callback function(error, result)
 */
function sendCommand(command, callback) {
    if (!serviceReady) {
        return callback(new Error('Instagram service is not ready'), null);
    }
    
    const requestId = uuidv4();
    command.request_id = requestId;
    
    pendingRequests.set(requestId, callback);
    igService.stdin.write(JSON.stringify(command) + '\n');
}

/*
 * Promise-based API for the Instagram service
 */
const InstagramService = {
    /*
    * Login to Instagram
    * @param {string} username - Instagram username
    * @param {string} password - Instagram password
    * @param {string} code - Optional 2FA code
    * @returns {Promise<Object>} - Login result
    */
    login: (username, password, code = null) => {
        return new Promise((resolve, reject) => {
            sendCommand({
                    command: 'login',
                    username,
                    password,
                    code
                }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
            });
        });
    },
  
  /*
   * Fetch followees for a target user
   * @param {string} target - Target username
   * @returns {Promise<Object>} - Followees data
   */
  fetchFollowees: (target) => {
    return new Promise((resolve, reject) => {
      sendCommand({
        command: 'fetch',
        target
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  },
  
  /*
   * Logout from Instagram
   * @returns {Promise<Object>} - Logout result
   */
  logout: () => {
    return new Promise((resolve, reject) => {
      sendCommand({
        command: 'logout'
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  },
  
  /*
   * Shutdown the service
   * @returns {Promise<void>}
   */
  shutdown: () => {
    return new Promise((resolve) => {
      sendCommand({
        command: 'shutdown'
      }, () => {
        // We don't expect a response for shutdown
        resolve();
      });
      
      // Clear all pending requests
      for (const [requestId, callback] of pendingRequests.entries()) {
        callback(new Error('Service is shutting down'), null);
        pendingRequests.delete(requestId);
      }
    });
  }
};

module.exports = InstagramService;

// Clean up garbage batch
setInterval(() => {
    const now = Date.now();
    
    pendingBatches.forEach((batchInfo, requestId) => {
      // timeout = 5 minutes
      if (!batchInfo.completed && batchInfo.startTime && (now - batchInfo.startTime > 5 * 60 * 1000)) {
        console.warn(`[IG Service] Request ${requestId} timed out after 5 minutes`);
        
        batchInfo.completed = true;
        
        const callback = pendingRequests.get(requestId);
        if (callback) {
          callback(new Error('Request timed out while collecting batch data'), null);
          pendingRequests.delete(requestId);
          pendingBatches.delete(requestId);
        }
      }
    });
  }, 60000); 