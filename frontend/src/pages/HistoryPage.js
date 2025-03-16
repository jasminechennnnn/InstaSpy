import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSearchHistories, getSearchHistory, deleteSearchHistory } from '../services/history.service';
import { triggerAnalysis } from '../services/analyzer.service';
import CustomMarkdown from '../utils/customMarkdown'; // 引入自定義 Markdown 組件

export default function HistoryPage() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [deleteConfirmation, setDeleteConfirmation] = useState({});
  const [historyDetails, setHistoryDetails] = useState({});
  const [analysisStatus, setAnalysisStatus] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchHistories();
  }, []);

  // Fetch all search histories
  const fetchHistories = async () => {
    try {
      setLoading(true);
      const response = await getSearchHistories();
      setHistories(response.data || []);
      
      if (id) {
        await fetchHistoryDetail(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific search history by ID
  const fetchHistoryDetail = async (historyId) => {
    try {
      if (historyDetails[historyId]) {
        return;
      }
      
      const response = await getSearchHistory(historyId);
      
      setHistoryDetails(prev => ({
        ...prev,
        [historyId]: response.data
      }));
      
      setExpandedRows(prev => ({
        ...prev,
        [historyId]: true
      }));
    } catch (err) {
      console.error(`Error fetching history detail for ID ${historyId}:`, err);
    }
  };
  
  // Handle analysis
  const handleAnalysis = async (searchId) => {
    try {
      setAnalysisStatus('Processing...');
      const result = await triggerAnalysis(searchId);
      setAnalysisStatus('Analysis complete!');
      alert('Analysis triggered successfully! Check History for results.');
      fetchHistories();
    } catch (err) {
      console.error(err);
      setAnalysisStatus('Analysis failed');
      alert('Failed to trigger analysis');
    }
  };

  // Delete confirmation
  const confirmDelete = (historyId) => {
    setDeleteConfirmation(prev => ({
      ...prev,
      [historyId]: true
    }));
  };

  const cancelDelete = (historyId) => {
    setDeleteConfirmation(prev => ({
      ...prev,
      [historyId]: false
    }));
  };

  // Delete history
  const handleDelete = async (historyId) => {
    try {
      await deleteSearchHistory(historyId);
      setDeleteConfirmation(prev => ({
        ...prev,
        [historyId]: false
      }));
      fetchHistories();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle expanded rows
  const toggleExpandRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format to Taiwan time with specific format: YYYY/MM/DD 上午/下午H:MM:SS
  const formatToTaiwanTime = (dateString) => {
    const date = new Date(dateString);
    // Format like "2025/3/12 下午8:44:29"
    return date.toLocaleString('zh-TW', { 
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).replace(/\//g, '/');
  };

  // Random rotation
  const getRandomRotation = () => {
    return Math.random() * 10 - 5; // -5 to +5 degrees
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header section with title and image */}
      <div className="flex justify-center items-center mb-3">
        <div className="flex items-center">
          <span className="text-2xl font-bold animate-pulse bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-transparent bg-clip-text shadow-sm">InstaSpy</span>
          <h1 className="text-2xl font-bold ml-2"> - Search History</h1>
          <div className="ml-4">
            <img 
              src={process.env.PUBLIC_URL + 'spyfamily1.jpg'}
              alt="Spy Family" 
              className="w-40 h-20 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center mb-2">
        <span>powered by</span>
        <span className="ml-1 font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">gemini-2.0-flash</span>
      </div>
      {histories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No search history found.</p>
          <Link 
            to="/analyzer" 
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
          >
            Go to Analyzer to create a new search
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {histories.map((search) => (
                  <React.Fragment key={search.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatToTaiwanTime(search.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-300 text-white font-bold text-sm shadow-md">
                          <span className="mr-1">🔍</span>
                          {search.targetUsername}
                        </div>
                        <div className="text-sm text-gray-500">
                          Status: {search.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            toggleExpandRow(search.id);
                            if (!expandedRows[search.id] && !historyDetails[search.id]) {
                              fetchHistoryDetail(search.id);
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-3"
                        >
                          {expandedRows[search.id] ? '➖ Hide Details' : '➕ Show Details'}
                        </button>
                        {search.status === 'processing' && (
                          <button
                            onClick={() => handleAnalysis(search.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-lg text-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 animate-pulse"
                            style={{
                              boxShadow: '0 0 10px 2px rgba(255, 215, 0, 0.6)'
                            }}
                          >
                            🚀 Analyze 🚀
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {deleteConfirmation[search.id] ? (
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Are you sure?</span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDelete(search.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => cancelDelete(search.id)}
                                className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => confirmDelete(search.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            ❌ Delete
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expandable Details Row */}
                    {expandedRows[search.id] && (
                      <tr key={`${search.id}-details`} className="bg-gray-50">
                        <td colSpan="4" className="px-6 py-4">
                          {/* Followees Section */}
                          <div className="mb-6">
                          <div className="mb-2 flex items-center">
                            <h3 className="text-lg font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border-l-4 border-gray-500">
                              Followees <span className="text-gray-500">({historyDetails[search.id]?.followeeList?.length || 0})</span>
                            </h3>
                          </div>
                            {/* Fixed height container with horizontal scroll */}
                            <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                              <div className="flex flex-wrap gap-4 justify-center pb-2">
                                {historyDetails[search.id]?.followeeList?.length > 0 ? (
                                  historyDetails[search.id].followeeList.map((account, index) => {
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
                                        key={`${search.id}-${account.id || index}`}
                                        className={`border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 w-30 bg-gradient-to-br ${randomGradient}`}
                                        style={{
                                          transform: `rotate(${getRandomRotation()}deg)`,
                                          marginTop: `${Math.random() * 12}px`
                                        }}
                                      >
                                        <div className="text-center">
                                          <p className="font-bold text-sm text-white truncate">{account.username}</p>
                                          <p className="text-xs text-white text-opacity-90 truncate mt-1">{account.full_name}</p>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="flex items-center justify-center w-full py-6">
                                    {historyDetails[search.id] ? (
                                      <p className="text-sm text-gray-500">No followees found</p>
                                    ) : (
                                      <p className="text-sm text-gray-500">Loading...</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Analysis Results Section */}
                          <div>
                          <div className="mb-2 flex items-center">
                            <h3 className="text-lg font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border-l-4 border-gray-500">
                              Analysis Results
                            </h3>
                          </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              {historyDetails[search.id]?.analysisResult ? (
                                <div className="prose max-w-none">
                                  {/* CustomMarkdown */}
                                  <CustomMarkdown content={historyDetails[search.id].analysisResult.result} />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center w-full py-6">
                                  {historyDetails[search.id] ? (
                                    <p className="text-sm text-gray-500">No analysis results available</p>
                                  ) : (
                                    <p className="text-sm text-gray-500">Loading...</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}