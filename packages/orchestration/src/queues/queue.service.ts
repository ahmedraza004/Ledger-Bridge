export interface AmlCheckJobData {
  paymentId: string;
  tenantId: string;
  senderName: string;
  recipientName: string;
  senderCountry: string;
  recipientCountry: string;
}

export interface RegulatoryFilingJobData {
  filingType: 'SAR' | 'CTR';
  tenantId: string;
  paymentId: string;
  amountMinor: string;
  currency: string;
  narrative: string;
}

export interface WebhookDispatchJobData {
  tenantId: string;
  event: string;
  payload: Record<string, unknown>;
  webhookUrl: string;
}

export class QueueService {
  private inMemoryQueue: Array<{ queueName: string; jobName: string; data: unknown }> = [];

  public async addJob(queueName: string, jobName: string, data: unknown): Promise<{ id: string }> {
    const job = { queueName, jobName, data };
    this.inMemoryQueue.push(job);
    return { id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
  }

  public getJobs(queueName?: string) {
    if (!queueName) return this.inMemoryQueue;
    return this.inMemoryQueue.filter(j => j.queueName === queueName);
  }

  public clear(): void {
    this.inMemoryQueue = [];
  }
}
