export interface CustomAttribute {
  // Fill in with actual fields from TeamDynamix.Api.CustomAttributes.CustomAttribute
  // Example:
  id: number
  name: string
  value: string
}

export interface Attachment {
  // Fill in with actual fields from TeamDynamix.Api.Attachments.Attachment
  id: number
  fileName: string
  url: string
}

export enum ArticleStatus {
  Draft = 'Draft',
  Published = 'Published',
  Archived = 'Archived'
  // Add other statuses if needed
}

export enum DraftStatus {
  None = 'None',
  Draft = 'Draft',
  Pending = 'Pending'
  // Add other draft statuses
}

export interface Article {
  ID: number
  AppID: number
  AppName: string
  CategoryID: number
  CategoryName: string
  Subject: string
  Body: string
  Summary?: string | null
  Status: ArticleStatus
  StatusName: string
  Attributes?: CustomAttribute[] | null
  ReviewDateUtc?: string | null // ISO date string
  Order: number
  IsPublished: boolean
  IsPublic: boolean
  WhitelistGroups: boolean
  InheritPermissions: boolean
  NotifyOwner: boolean
  NotifyOwnerOfReviewDate: boolean
  RevisionID: number
  RevisionNumber: number
  DraftStatus?: DraftStatus | null
  CreatedDate: string // ISO date string
  CreatedUid: string // GUID
  CreatedFullName: string
  ModifiedDate: string // ISO date string
  ModifiedUid: string // GUID
  ModifiedFullName: string
  OwnerUid?: string | null // GUID
  OwnerFullName: string
  OwningGroupID?: number | null
  OwningGroupName: string
  Tags?: string[] | null
  Attachments?: Attachment[] | null
  Uri: string
}
