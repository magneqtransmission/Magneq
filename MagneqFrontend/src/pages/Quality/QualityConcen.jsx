import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DaynamicTable from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import useQuality from "../../services/useQuality";

const tableHeaders = ["Ticket ID", "Reported by", "Date", "Issue Type", "Status"];

const formatCell = (cell, idx) => {
  if (idx === 3) {
    return <Badge size="sm" color="primary">{cell}</Badge>;
  }
  if (idx === 4) {
    const isResolved = cell === "YES" || cell === true;
    return (
      <Badge size="sm" color={isResolved ? "success" : "warning"}>
        {isResolved ? "Resolved" : "Pending"}
      </Badge>
    );
  }
  return cell;
};

const QualityConcen = () => {
  const { getAllQualityIssues } = useQuality();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quality-issues"],
    queryFn: getAllQualityIssues,
  });
  console.log(data)

  const items = Array.isArray(data?.item) ? data.item : [];

  const materialIssues = items.filter(issue => (issue.data[3] || issue.issue_type) === "Material");
  const otherIssues = items.filter(issue => (issue.data[3] || issue.issue_type) !== "Material");

  const tableData = {
    item: materialIssues.map((issue) => ({
      id: issue.id,
      data: [
        issue.data[0] || issue.ticket_number || issue.id.slice(-8).toUpperCase(),
        issue.data[1] || issue.created_by || "Unknown",
        issue.data[2] || "Invalid Date",
        issue.data[3] || issue.issue_type || "Unknown",
        issue.data[4] || issue.action_taken,
      ],
    })),
  };

  const handleRowClick = ({ item_id }) => {
    navigate(`/quality/${item_id}`);
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-6 text-text">Quality Issues</h2>

      {isLoading ? (
        <p className="text-center">Loading quality issues...</p>
      ) : isError ? (
        <p className="text-center text-red-500">Failed to load quality issues</p>
      ) : (
        <>
          {/* Table for Material Issues */}
          {tableData.item.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-text mb-3">Material Issues</h3>
              <DaynamicTable
                header={tableHeaders}
                tableData={tableData}
                formatCell={formatCell}
                onRowClick={handleRowClick}
              />
            </>
          )}

          {/* Cards for Other Issues */}
          {otherIssues.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-text mt-8 mb-3">Other Issues</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherIssues.map((issue) => {
                  const [ticket, reporter, date, type, resolved] = issue.data;
                  const isResolved = resolved === "YES" || resolved === true;

                  return (
                    <div
                      key={issue.id}
                      className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-background shadow-sm hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/quality/${issue.id}`)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{ticket}</span>
                        <Badge size="xs" color={isResolved ? "success" : "warning"}>
                          {isResolved ? "Resolved" : "Pending"}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-semibold text-text mb-1">{type}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{issue.issue}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>By:</strong> {reporter} <span className="mx-1">•</span>
                        <strong>Date:</strong> {date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QualityConcen;
