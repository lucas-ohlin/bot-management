import React from 'react';

interface Application {
  name: string;
  path: string;
}

interface ApplicationsContainerProps {
  applications: Application[];
}

const ApplicationsContainer: React.FC<ApplicationsContainerProps> = ({ applications }) => {
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
              <td>{app.name}</td>
              <td>{app.path}</td>
              <td>
                <button className="quick-action-btn">Manage</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsContainer;
