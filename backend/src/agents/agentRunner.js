import { adkWorkflowAgent } from '../ai/adk/core/ADKWorkflowAgent.js';

/**
 * Runs the Google ADK Autonomous Multi-Agent Pipeline via ADKWorkflowAgent
 */
export async function executeMultiAgentPipeline(complaint) {
  console.log(`\n======================================================`);
  console.log(`🚀 [Google ADK v2.5.0 Engine] Initiating ADK Workflow for Ticket #${complaint.ticketId || complaint.id}`);
  console.log(`======================================================\n`);

  try {
    const context = await adkWorkflowAgent.executeWorkflow(complaint);

    // Map ADK context results back to complaint object for DB update & persistence
    complaint.category = context.complaintAnalysis?.category || complaint.category;
    complaint.severity = context.complaintAnalysis?.severity || complaint.severity;
    complaint.priorityScore = context.priorityAssessment?.priorityScore || 50;
    complaint.priorityLevel = context.priorityAssessment?.priorityLevel || 'Medium';
    complaint.ward = context.locationAnalysis?.ward || complaint.ward;
    complaint.agentResults = {
      understanding: context.complaintAnalysis,
      vision: context.visionAnalysis,
      location: context.locationAnalysis,
      duplicate: context.duplicateAnalysis,
      community: context.communityValidation,
      priority: context.priorityAssessment,
      department: context.departmentRecommendation,
    };

    return context;
  } catch (error) {
    console.error('[Google ADK Workflow Execution Failure]:', error.message);
    throw error;
  }
}

export default executeMultiAgentPipeline;
