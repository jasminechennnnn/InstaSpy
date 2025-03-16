import { useState, useEffect } from 'react';
import { loginInstagram, getFollowees, triggerAnalysis } from '../services/analyzer.service';

export default function AnalyzerPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(false);
  const [target, setTarget] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  // Load login status from localStorage on initial render
  useEffect(() => {
    const savedLoginStatus = localStorage.getItem('loginStatus');
    if (savedLoginStatus === 'true') {
      setLoginStatus(true);
    }
    
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Login with username, password and 2FA code
      await loginInstagram(username, password, code);
      setLoginStatus(true);
      
      // Save login status to localStorage
      localStorage.setItem('loginStatus', 'true');
    } catch (err) {
      console.error(err);
      alert('Failed to login to Instagram. Please check your credentials and 2FA code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!target.trim()) {
      alert('Please enter an Instagram username to search');
      return;
    }
  
    try {
      setLoading(true);
      
      // Using the getFollowees function to search for a specific account
      const data = await getFollowees(target);
      
      setSearchResults(data.followees || []);
      
      if (!data.followees || data.followees.length === 0) {
        alert('No results found for this username');
      } else {
        // Add search to history with timestamp and searchId from backend
        const newSearch = {
          id: data.searchId || Date.now(), // Use the searchId from backend if available
          searchId: data.searchId, // Store the actual searchId for API calls
          timestamp: new Date().toISOString(),
          target: target,
          accounts: data.followees || []
        };
        
        const updatedHistory = [newSearch, ...searchHistory];
        setSearchHistory(updatedHistory);
        
        // Save history to localStorage
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      }
    } catch (err) {
      console.error("Error occurred during search:", err);
      alert('Failed to fetch account information');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async (searchId) => {
    try {
      setAnalysisStatus('Processing...');
      // Pass only the search ID to the analysis function
      const result = await triggerAnalysis(searchId);
      setAnalysisStatus('Analysis complete!');
      alert('Analysis triggered successfully! Check History for results.');
    } catch (err) {
      console.error(err);
      setAnalysisStatus('Analysis failed');
      alert('Failed to trigger analysis');
    }
  };

  const toggleRowExpand = (historyId) => {
    setExpandedRows(prev => ({
      ...prev,
      [historyId]: !prev[historyId]
    }));
  };

  const handleLogout = () => {
    setLoginStatus(false);
    localStorage.removeItem('loginStatus');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
    {/* Header section with title and image */}
    <div className="flex justify-center items-center mb-3">
      <div className="flex items-center">
        <span className="text-2xl font-bold animate-pulse bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-transparent bg-clip-text shadow-sm">InstaSpy</span>
        <h1 className="text-2xl font-bold ml-2"> - Analyzer</h1>
      </div>
    </div>
      
      {!loginStatus ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Login to Instagram</h2>
            <img 
              src={process.env.PUBLIC_URL + 'ig.png'}
              alt="Instagram Icon" 
              className="w-16 h-16 object-cover rounded-full"
            />
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> ⚠️ Two-factor authentication must be enabled on your Instagram account to use this service.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 pl-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter the code from your authenticator app"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-6">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 flex-grow flex items-center">
            <p className="text-sm text-green-700">
              <strong>Success!</strong> Instagram account logged in successfully.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      )}
      
      {/* Search Form - Always visible regardless of login status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Enter Target Instagram Account</h2>
          <img 
            src={process.env.PUBLIC_URL + 'spyfamily2.jpeg'}
            alt="Detective girl with magnifying glass" 
            className="w-16 h-16 object-cover rounded-full"
          />
        </div>
        {!loginStatus && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> You need to login first before searching.
            </p>
          </div>
        )}
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-grow">
            <label htmlFor="target" className="sr-only">Instagram Username</label>
            <input
              id="target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="block pl-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter Instagram username to analyze"
              required
              disabled={!loginStatus || loading}
            />
          </div>
          <button
            type="submit"
            disabled={!loginStatus || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* {loginStatus && searchResults.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow mb-6">
        
          <p className="text-gray-500 text-center">No search results yet. Search for an Instagram account to begin.</p>
        </div>
      )} */}

      {/* Search History Table */}
      {searchHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Searches</h2>
            <img 
              src={process.env.PUBLIC_URL + 'spyfamily3.jpg'}
              alt="History Icon" 
              className="w-16 h-16 object-cover rounded-full"
            />
          </div>
          <div className="text-xs text-gray-500 flex items-center mb-4">
            <span>powered by</span>
            <span className="ml-1 font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">gemini-2.0-flash</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Followees
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchHistory.map((search) => (
                  <>
                    <tr key={search.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(search.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-300 text-white font-bold text-sm shadow-md">
                          <span className="mr-1">🔍</span>
                          {search.target}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => toggleRowExpand(search.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {search.accounts.length} accounts {expandedRows[search.id] ? '▲' : '▼'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleAnalysis(search.searchId)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-lg text-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 animate-pulse"
                          style={{
                            boxShadow: '0 0 10px 2px rgba(255, 215, 0, 0.6)'
                          }}
                        >
                          🚀 Analyze 🚀
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expandable content */}
                    {expandedRows[search.id] && (
                      <tr key={`${search.id}-accounts`} className="bg-gray-50">
                        <td colSpan="4" className="px-6 py-4">
                        <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                          <div className="flex flex-wrap gap-4 justify-center pb-2">
                            {search.accounts.map((account, index) => {
                              // Generate gradients from blue to pink
                              const gradients = [
                                'from-blue-400 to-pink-300',
                                'from-blue-500 to-purple-300',
                                'from-indigo-400 to-pink-400',
                                'from-cyan-400 to-fuchsia-300',
                                'from-sky-400 to-rose-300'
                              ];
                              const randomGradient = gradients[index % gradients.length];
                              
                              return (
                                <div 
                                  key={`${search.id}-${account.id}`}
                                  className={`border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 w-30 bg-gradient-to-br ${randomGradient}`}
                                  style={{
                                    transform: `rotate(${Math.random() * 4 - 2}deg)`,
                                    marginTop: `${Math.random() * 12}px`
                                  }}
                                >
                                  <div className="text-center">          
                                    <p className="font-bold text-sm text-white truncate">{account.username}</p>
                                    <p className="text-xs text-white text-opacity-90 truncate mt-1">{account.full_name}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 分析結果區域 (如果有) */}
      {analysisStatus && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Analysis Status</h2>
            <img 
              src={process.env.PUBLIC_URL + 'spyfamily3.jpg'}
              alt="Cool girl with sunglasses" 
              className="w-12 h-12 object-cover rounded-full"
            />
          </div>
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <img 
                src={process.env.PUBLIC_URL + 'spyfamily3.jpg'}
                alt="Analysis Status" 
                className="mx-auto mb-4 w-32 h-32 object-cover rounded-lg"
              />
              <p className={`text-lg font-medium ${analysisStatus.includes('complete') ? 'text-green-600' : analysisStatus.includes('failed') ? 'text-red-600' : 'text-blue-600'}`}>
                {analysisStatus}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}