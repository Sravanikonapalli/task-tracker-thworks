import React from "react";

const Insights = ({ summary }) => {
  return (
    <div className="insights">
      <h2>Smart Insights</h2>
      <p>{summary || "No insights available yet."}</p>
    </div>
  );
};

export default Insights;
