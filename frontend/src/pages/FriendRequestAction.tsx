import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useMutation from '../hooks/useMutation';
import { API_ACCEPT_REQUEST, API_REJECT_REQUEST } from '../imports/api';

const FriendRequestAction = () => {
  const [searchParams] = useSearchParams();
  const { requestId } = useParams();
  const action = searchParams.get('action');
  const navigate = useNavigate();

  const [message, setMessage] = useState('Processing your request...');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, loading } = useMutation();

  const handleRequest = async () => {
    // Use the correct endpoint based on the action
    const endpoint = action === 'accept' ? 'accept' : 'reject';
    // Construct the URL to match the backend route
    const baseUrl = API_ACCEPT_REQUEST.split('/requests/')[0];
    const url = `${baseUrl}/requests/${endpoint}/${requestId}`;
    console.log('API URL:', url);

    const response = await mutate({ 
      url, 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization token if needed
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.success) {
      setIsSuccess(true);
      setMessage(
        action === 'accept'
          ? 'Friend request accepted successfully!'
          : 'Friend request rejected.'
      );
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
      setMessage(
        response?.error || `Failed to ${action} friend request. Please try again.`
      );
    }
  };

  useEffect(() => {
    if (action && requestId) {
      handleRequest();
    }
  }, [action, requestId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isSuccess ? 'Success!' : 'Processing...'}
        </h1>
        <p className="mb-6">{message}</p>
        {!isSuccess && !loading && (
          <button
            onClick={handleRequest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendRequestAction;
