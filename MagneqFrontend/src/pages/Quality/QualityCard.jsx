import React, { useState } from "react";
import Button from "../../components/buttons/Button";
import Badge from "../../components/common/Badge";
import { HiOutlineArchiveBox, HiOutlineCheck, HiOutlineTrash } from "react-icons/hi2";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useQuality from "../../services/useQuality";
import { useSelector } from "react-redux";
import { selectAuth } from "../../features/authSlice";

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const QualityCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useSelector(selectAuth);
  const { getSpecificQualityIssue, approveQualityIssue, deleteQualityIssue } = useQuality();
  
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: issue, isLoading, isError } = useQuery({
    queryKey: ["quality-issue", id],
    queryFn: () => getSpecificQualityIssue(id),
    enabled: !!id,
  });
  console.log(issue)

  const handleApprove = async () => {
    if (!issue || issue.action_taken) return;
    
    setIsApproving(true);
    try {
      await approveQualityIssue(id);
      queryClient.invalidateQueries(["quality-issue", id]);
      queryClient.invalidateQueries(["quality-issues"]);
      toast.success("Quality issue approved successfully!");
    } catch (error) {
      console.error("Failed to approve quality issue:", error);
      toast.error("Failed to approve quality issue");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDelete = async () => {
    if (!issue) return;
    
    if (!window.confirm("Are you sure you want to delete this quality issue?")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteQualityIssue(id);
      toast.success("Quality issue deleted successfully!");
      navigate("/quality");
    } catch (error) {
      console.error("Failed to delete quality issue:", error);
      toast.error("Failed to delete quality issue");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return (
    <div className="mt-10 flex justify-center">
      <p className="text-lg">Loading quality issue details...</p>
    </div>
  );
  
  if (isError) return (
    <div className="mt-10 flex justify-center">
      <p className="text-lg text-red-500">Failed to load quality issue details.</p>
    </div>
  );

  if (!issue) return (
    <div className="mt-10 flex justify-center">
      <p className="text-lg text-red-500">Quality issue not found.</p>
    </div>
  );

  const canApprove = (user.route.role === "ADMIN" || user.route.role === "QUALITY_MANAGER") && !issue.action_taken;
  const canDelete = user.route.role === "ADMIN" || user.route.role === "QUALITY_MANAGER";

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">
          Quality Issue Details
        </h2>
        <div className="flex gap-3">
          {canApprove && (
            <Button
              variant="primary"
              size="md"
              startIcon={<HiOutlineCheck />}
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? "Approving..." : "Approve Issue"}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="secondary"
              size="md"
              startIcon={<HiOutlineTrash />}
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Issue"}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-background p-6 border border-border rounded-xl shadow-sm">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Ticket ID</label>
              <p className="text-lg font-semibold text-text">
                {issue._id.toString().slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Issue Type</label>
              <div className="mt-1">
                <Badge size="md" color="primary">
                  {issue.issue_type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge 
                  size="md" 
                  color={issue.action_taken ? "success" : "warning"}
                >
                  {issue.action_taken ? "Resolved" : "Pending"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created By</label>
              <p className="text-text">
                {issue.created_by || "Unknown"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Created Date</label>
              <p className="text-text">{formatDateTime(issue.created_at)}</p>
            </div>
            {issue.updated_at && issue.updated_at !== issue.created_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-text">{formatDateTime(issue.updated_at)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Issue Description */}
        <div className="mb-8">
          <label className="text-sm font-medium text-gray-500 mb-2 block">Issue Description</label>
          <div className="bg-=background p-4 rounded-lg border">
            <p className="text-text whitespace-pre-line">
              {issue.issue || "No description provided"}
            </p>
          </div>
        </div>

        {/* Vendor Information */}
        {issue.vendor && (
          <div className="mb-8">
            <label className="text-sm font-medium text-gray-500 mb-2 block">Vendor Information</label>
            <div className="bg-background p-4 rounded-lg border">
              <p className="text-text">{issue.vendor}</p>
            </div>
          </div>
        )}

        {/* Affected Finished Goods */}
        {issue.issue_type === "Material" && issue.finished_good && issue.finished_good.length > 0 && (
          <div className="mb-8">
            <label className="text-sm font-medium text-gray-500 mb-3 block">Affected Finished Goods</label>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {issue.finished_good.map((fg, index) => (
                  <div key={fg._id || index} className="bg-white p-3 rounded border">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Model:</span>
                        <span className="ml-2 font-semibold text-text">{fg.model}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Type:</span>
                        <span className="ml-2 font-semibold text-text">{fg.type}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Ratio:</span>
                        <span className="ml-2 font-semibold text-text">{fg.ratio}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Power:</span>
                        <span className="ml-2 font-semibold text-text">
                          {typeof fg.power === 'object' && fg.power.$numberDecimal 
                            ? fg.power.$numberDecimal 
                            : fg.power}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action History */}
        <div className="mb-8">
          <label className="text-sm font-medium text-gray-500 mb-3 block">Action History</label>
          <div className="bg-background p-4 rounded-lg border">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-text">Issue Created</p>
                  <p className="text-xs text-gray-500">{formatDateTime(issue.created_at)}</p>
                </div>
              </div>
              {issue.action_taken && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-text">Issue Resolved</p>
                    <p className="text-xs text-gray-500">
                      {issue.updated_at ? formatDateTime(issue.updated_at) : "Recently"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityCard;
