import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSearchHistories } from '../services/history.service';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSearches();
  }, []);

  const fetchRecentSearches = async () => {
    try {
      setLoading(true);
      const data = await getSearchHistories();
      // Get the 3 most recent searches
      setRecentSearches((data.histories || []).slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, wallwall's friends 👽</h2>
        <p className="text-gray-600 mb-3 text-center text-base">
        Uncover secrets with <span className="text-2xl font-bold animate-pulse bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-transparent bg-clip-text shadow-sm">InstaSpy</span> – your social detective! 🕵️‍♀️
      </p>
        
         {/* Center Detective Image */}
         <div className="flex justify-center mb-6">
          <div className="w-100 h-64 overflow-hidden rounded-lg shadow-lg">
            <img 
              src={process.env.PUBLIC_URL + 'spyfamily1.jpg'}
              alt="Anime detective character with magnifying glass" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
            <h3 className="text-lg font-semibold mb-2">Analyze Instagram Profiles</h3>
            <p className="text-gray-600 mb-4">
              Connect to Instagram and analyze profiles to get detailed insights.
            </p>
            <Link
              to="/analyzer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Analyzing
            </Link>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
            <h3 className="text-lg font-semibold mb-2">View Search History</h3>
            <p className="text-gray-600 mb-4">
              Access your previous analysis results and search history.
            </p>
            <Link
              to="/history"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              View History
            </Link>
          </div>
        </div>
      </div>
      
      {!loading && recentSearches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Searches</h2>
            <Link to="/history" className="text-indigo-600 hover:text-indigo-800 text-sm">
              View All
            </Link>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {recentSearches.map((search) => (
              <li key={search._id} className="py-3">
                <Link to={`/history/${search._id}`} className="hover:text-indigo-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{search.profile?.username || 'Unknown Profile'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(search.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-gray-400">&rarr;</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}