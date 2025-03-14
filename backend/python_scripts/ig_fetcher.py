"""
Persistent Instagram Follower Fetcher Service
----------------------------------------------
A persistent service to login to Instagram once and fetch followees
for multiple target accounts on demand.
Communicates with Node.js through stdin/stdout.
"""

import sys
import json
import signal
import time
from instagrapi import Client

# Global client to maintain the session
client = None


def signal_handler(sig, frame):
    """
    Handle exit signals and ensure clean logout
    """
    print(json.dumps({
        "status": "shutdown",
        "message": "Service is shutting down"
    }))
    
    if client:
        try:
            client.logout()
        except:
            pass
    
    sys.exit(0)

# https://subzeroid.github.io/instagrapi/usage-guide/user.html
def login_to_instagram(username, password, code):
    """
    Login to Instagram and maintain the session
    
    Args:
        username (str): Instagram username
        password (str): Instagram password
        code (str, optional): Two-factor authentication code
        
    Returns:
        bool: True if login successful, False otherwise
    """
    global client
    
    # Create Instagram client if not exists
    if client is None:
        client = Client()
        client.delay_range = [1, 5]  # Set delay between requests
    
    try:
        print(json.dumps({
            "status": "info",
            "message": f"Attempting to login with username: {username}"
        }), flush=True)

        # print(json.dumps({
        # "status": "debug",
        # "message": f"Login parameters - username: {username}, password type: {type(password).__name__}, code: {code}, code type: {type(code).__name__ if code else 'None'}"
        # }), flush=True)
        
        login_result = client.login(username, password,
                                    verification_code=code)
        
        if login_result:
            print(json.dumps({
                "status": "login_success",
                "message": f"Login successful for {username}"
            }), flush=True)
        
        return login_result
        
    except Exception as e:
        print(json.dumps({
            "status": "login_error",
            "message": f"Login failed: {str(e)}"
        }), flush=True)
        
        client = None
        return False


def fetch_followees(target):
    """
    Fetch followees for the target account using existing session
    
    Args:
        target (str): Username to fetch followees from
        
    Returns:
        dict: Result dictionary with followees data
    """
    global client
    
    if client is None:
        return {
            "success": False,
            "error": "Not logged in"
        }
    
    try:
        print(json.dumps({
            "status": "info",
            "message": f"Fetching followees for target: {target}"
        }), flush=True)
        
        user_id = client.user_id_from_username(target)
        followees = client.user_following(user_id)
        
        # Process user data
        user_data = [
            {'username': user.username,
             'full_name': user.full_name} for user in followees.values()
        ]
        
        print(json.dumps({
            "status": "info",
            "message": f"Successfully fetched {len(user_data)} followees for {target}"
        }, ensure_ascii=False), flush=True)
        
        return {
            "success": True,
            "target": target,
            "count": len(user_data),
            "followees": user_data
        }
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": f"Failed to fetch followees: {str(e)}"
        }), flush=True)
        
        return {
            "success": False,
            "error": f"Failed to fetch followees: {str(e)}"
        }


def main():
    """
    Main function to run the persistent service
    """
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print(json.dumps({
        "status": "ready",
        "message": "Instagram service started. Waiting for commands..."
    }), flush=True)
    
    # Main loop to process commands
    while True:
        try:
            # Read command from stdin
            command_line = sys.stdin.readline().strip()
            
            if not command_line:
                time.sleep(0.1)  # Prevent CPU hogging
                continue
            
            command = json.loads(command_line)
            command_type = command.get("command")
            
            if command_type == "login":
                username = command.get("username")
                password = command.get("password")
                code = command.get("code")

                success = login_to_instagram(username, password, str(code))
                
                result = {
                    "command": "login_response",
                    "request_id": command.get("request_id"),
                    "success": success
                }
                
                print(json.dumps(result), flush=True)
            
            elif command_type == "fetch":
                target = command.get("target")
                request_id = command.get("request_id")
                
                try:
                    result = fetch_followees(target)
                    result["command"] = "fetch_response"
                    result["request_id"] = request_id
                    
                    if result["success"]:
                        followees = result.pop("followees")
                        # print(json.dumps(result), flush=True)

                        BATCH_SIZE = min(30, len(followees))
                        total_batches = (len(followees) + BATCH_SIZE - 1) // BATCH_SIZE
                        for start in range(0, len(followees), BATCH_SIZE):
                            batch_num = start // BATCH_SIZE + 1
                            end = min(start+BATCH_SIZE, len(followees))
                            print(f"Debug: Processing batch {batch_num}/{total_batches}, records {start} to {end}", flush=True)
                            
                            batch = followees[start:end]
                            batch_result = {
                                "command": "fetch_batch",
                                "request_id": request_id,
                                "success": result["success"],
                                "target": target,
                                "batch_num": batch_num,
                                "total_batches": total_batches,
                                "data": batch
                            }
                            print(json.dumps(batch_result, ensure_ascii=False), flush=True)
                        continue
                    else:
                        print(json.dumps(result, ensure_ascii=False), flush=True)
                
                except Exception as e:
                    print(json.dumps({
                        "command": "fetch_response",
                        "request_id": request_id,
                        "success": False,
                        "error": f"Unexpected error in fetch: {str(e)}"
                    }, ensure_ascii=False), flush=True)

            elif command_type == "logout":
                if client:
                    try:
                        client.logout()
                        client = None
                    except:
                        pass
                
                print(json.dumps({
                    "command": "logout",
                    "request_id": command.get("request_id"),
                    "success": True
                }), flush=True)
            
            elif command_type == "shutdown":
                signal_handler(None, None)
            
            # Unknown command
            else:
                print(json.dumps({
                    "command": "error",
                    "request_id": command.get("request_id"),
                    "message": f"Unknown command: {command_type}"
                }), flush=True)
                
        except json.JSONDecodeError as e:
            print(json.dumps({
                "status": "error",
                "message": f"Invalid JSON input: {str(e)}"
            }), flush=True)
            
        except Exception as e:
            print(json.dumps({
                "status": "error",
                "message": f"Unexpected error: {str(e)}"
            }), flush=True)


if __name__ == "__main__":
    main()