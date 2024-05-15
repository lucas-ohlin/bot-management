import React from 'react';

interface Application {
  name: string;
  path: string;
}

interface ApplicationsContainerProps {
  applications: Application[];
  onManage: (app: Application) => void;
}

const ApplicationsContainer: React.FC<ApplicationsContainerProps> = ({ applications, onManage }) => {
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div className="applications-container">
      <h2 className="applications-title">Applications</h2>
      <div className="applications-divider"></div>
      <table className="applications-table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>PATH</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, index) => (
            <tr key={index}>
              <td title={app.name}>{truncateText(app.name, 20)}</td>
              <td title={app.path}>{truncateText(app.path, 40)}</td>
              <td>
                <button className="developer-portal-btn"
                  onClick={() => {
                    console.log("Manage button clicked for app:", app);
                    onManage(app);
                  }}>
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsContainer;
