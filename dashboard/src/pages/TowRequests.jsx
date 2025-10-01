import React, { useState, useEffect } from 'react';
import { FiPhone, FiClock } from 'react-icons/fi';
import { LoadingState } from '../components/LoadingState';
import '../styles/towRequests.scss';

const TowRequests = () => {
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  // Mock API call - replace with actual API integration
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      const data = [
        {
          id: 'TOW-001',
          status: 'pending',
          customer: {
            name: 'Ahmed Mohamed',
            phone: '+218 91-234-5678'
          },
          location: 'Al Seyaheyya, Tripoli, Libya',
          timestamp: '2025-09-27T10:30:00Z'
        },
        {
          id: 'TOW-002',
          status: 'in-progress',
          customer: {
            name: 'Sara Ali',
            phone: '+218 92-345-6789'
          },
          location: 'Gergarish Road, Tripoli, Libya',
          timestamp: '2025-09-27T10:15:00Z'
        }
      ];
      
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = (status) => {
    setFilter(status);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'in-progress': 'جاري التنفيذ',
      'accepted': 'تم القبول',
      'rejected': 'مرفوض'
    };
    return statusMap[status] || status;
  };

  const handleAccept = async (requestId) => {
    setActionLoading(requestId + '_accept');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update request status
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' } : req
      ));
    } catch (error) {
      console.error('Error accepting request:', error);
      // Handle error state
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(requestId + '_reject');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update request status
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      ));
    } catch (error) {
      console.error('Error rejecting request:', error);
      // Handle error state
    } finally {
      setActionLoading('');
    }
  };

  if (isLoading) {
    return <LoadingState type="skeleton" count={3} />;
  }

  return (
    <div className="tow-requests">
      <div className="header">
        <div className="title">
          <h1 className="TXT-heading">طلبات السحب</h1>
          <p className="TXT-normal">إدارة طلبات سحب السيارات</p>
        </div>

        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => filterRequests('all')}
          >
            الكل
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => filterRequests('pending')}
          >
            قيد الانتظار
          </button>
          <button 
            className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => filterRequests('in-progress')}
          >
            جاري التنفيذ
          </button>
        </div>
      </div>

      <div className="requests-grid">
        {requests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <span className="request-id">{request.id}</span>
              <span className={`status-badge ${request.status}`}>
                {getStatusText(request.status)}
              </span>
            </div>

            <div className="customer-info">
              <h3 className="name">{request.customer.name}</h3>
              <div className="contact">
                <FiPhone />
                <span>{request.customer.phone}</span>
              </div>
            </div>

            <div className="location-info">
              <p className="location-title">الموقع</p>
              <p className="location">{request.location}</p>
            </div>

            <div className="request-footer">
              <div className="time">
                <FiClock />
                <span>{formatTime(request.timestamp)}</span>
              </div>

              <div className="actions">
                <button 
                  className={`accept-btn ${actionLoading === request.id + '_accept' ? 'loading' : ''}`}
                  onClick={() => handleAccept(request.id)}
                  disabled={actionLoading || request.status !== 'pending'}
                >
                  {actionLoading === request.id + '_accept' ? (
                    <span className="loading-spinner"></span>
                  ) : 'قبول'}
                </button>
                <button 
                  className={`reject-btn ${actionLoading === request.id + '_reject' ? 'loading' : ''}`}
                  onClick={() => handleReject(request.id)}
                  disabled={actionLoading || request.status !== 'pending'}
                >
                  {actionLoading === request.id + '_reject' ? (
                    <span className="loading-spinner"></span>
                  ) : 'رفض'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TowRequests;