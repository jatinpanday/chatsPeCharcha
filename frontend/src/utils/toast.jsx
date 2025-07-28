import { toast } from 'sonner';

export const showToast = {
  success: (message) => {
    // Function to create a toast with common properties
    const createToast = (duration) => {
      return toast.custom(
        (t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            style={{
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 14px',
              fontWeight: '500',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '320px',
              minHeight: '50px',
              // maxHeight: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.4'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" fill="white" fillOpacity="0.2"/>
              <path d="M11.4 5.4L7 9.8 4.6 7.4 3.4 8.6 7 12.2l5.6-5.6-1.2-1.2z" fill="white"/>
            </svg>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {message}
            </span>
          </div>
        ),
        {
          id: `success-${Date.now()}`,
          position: "top-center",
          duration: duration,
          onHover: (id) => {
            // Replace with infinite duration toast on hover
            toast.dismiss(id);
            createToast(Infinity);
          }
        }
      );
    };

    createToast(3000);
  },
  
  warn: (message) => {
    // Function to create a toast with common properties
    const createToast = (duration) => {
      return toast.custom(
        (t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            style={{
              background: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 14px',
              fontWeight: '500',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '320px',
              minHeight: '50px',
              // maxHeight: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.4'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" fill="white" fillOpacity="0.2"/>
              <path d="M8 4v6m0 2v.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {message}
            </span>
          </div>
        ),
        {
          id: `warning-${Date.now()}`,
          position: "top-center",
          duration: duration,
          onHover: (id) => {
            // Replace with infinite duration toast on hover
            toast.dismiss(id);
            createToast(Infinity);
          }
        }
      );
    };

    createToast(3000);
  },
  
  error: (message) => {
    // Function to create a toast with common properties
    const createToast = (duration) => {
      return toast.custom(
        (t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 14px',
              fontWeight: '500',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '320px',
              minHeight: '50px',
              // maxHeight: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.4'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" fill="white" fillOpacity="0.2"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" fill="white"/>
            </svg>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {message}
            </span>
          </div>
        ),
        {
          id: `error-${Date.now()}`,
          position: "top-center",
          duration: duration,
          onHover: (id) => {
            // Replace with infinite duration toast on hover
            toast.dismiss(id);
            createToast(Infinity);
          }
        }
      );
    };

    createToast(3000);
  }
};