import * as React from "react";
const CONNECTOR_CAPABILITIES = {
  workday: {
    connectorName: "Workday Connector",
    schemaAttributes: [
      {
        name: "firstName",
        type: "String",
        description: "Employee first name",
        required: true,
      },
      {
        name: "lastName",
        type: "String",
        description: "Employee last name",
        required: true,
      },
      {
        name: "employeeId",
        type: "String",
        description: "Unique employee identifier",
        required: true,
      },
      {
        name: "department",
        type: "String",
        description: "Organizational department",
        required: false,
      },
      {
        name: "manager",
        type: "String",
        description: "Manager name or reference",
        required: false,
      },
      {
        name: "jobTitle",
        type: "String",
        description: "Employee job title",
        required: false,
      },
      {
        name: "email",
        type: "String",
        description: "Work email address",
        required: true,
      },
      {
        name: "startDate",
        type: "Date",
        description: "Employment start date",
        required: false,
      },
      {
        name: "endDate",
        type: "Date",
        description: "Employment end date (if applicable)",
        required: false,
      },
      {
        name: "location",
        type: "String",
        description: "Work location or site",
        required: false,
      },
      {
        name: "costCenter",
        type: "String",
        description: "Cost center code",
        required: false,
      },
      {
        name: "workerType",
        type: "String",
        description: "Employee, Contractor, Contingent Worker",
        required: false,
      },
      {
        name: "businessTitle",
        type: "String",
        description: "Business-facing job title",
        required: false,
      },
      {
        name: "supervisoryOrg",
        type: "String",
        description: "Supervisory organization reference",
        required: false,
      },
      {
        name: "positionId",
        type: "String",
        description: "Position identifier",
        required: false,
      },
      {
        name: "timeType",
        type: "String",
        description: "Full-time or part-time designation",
        required: false,
      },
      {
        name: "workShift",
        type: "String",
        description: "Assigned work shift",
        required: false,
      },
      {
        name: "payGroup",
        type: "String",
        description: "Payroll group assignment",
        required: false,
      },
      {
        name: "companyCode",
        type: "String",
        description: "Legal entity/company code",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create user account, provision roles, set HCM attributes and org assignments",
      },
      mover: {
        supported: true,
        description:
          "Update department, manager, title, location, and supervisory org on role transfer",
      },
      leaver: {
        supported: true,
        description: "Disable account, revoke access, archive worker record",
      },
    },
  },
  salesforce: {
    connectorName: "Salesforce Connector",
    schemaAttributes: [
      {
        name: "Username",
        type: "String",
        description: "Salesforce login username (email format)",
        required: true,
      },
      {
        name: "Email",
        type: "String",
        description: "User email address",
        required: true,
      },
      {
        name: "FirstName",
        type: "String",
        description: "User first name",
        required: true,
      },
      {
        name: "LastName",
        type: "String",
        description: "User last name",
        required: true,
      },
      {
        name: "ProfileId",
        type: "Reference",
        description: "Assigned Salesforce profile ID",
        required: true,
      },
      {
        name: "RoleId",
        type: "Reference",
        description: "Assigned role in role hierarchy",
        required: false,
      },
      {
        name: "IsActive",
        type: "Boolean",
        description: "Account active/inactive flag",
        required: true,
      },
      {
        name: "LocaleSidKey",
        type: "String",
        description: "Locale for dates and numbers",
        required: false,
      },
      {
        name: "TimeZoneSidKey",
        type: "String",
        description: "User timezone identifier",
        required: false,
      },
      {
        name: "LanguageLocaleKey",
        type: "String",
        description: "Display language",
        required: false,
      },
      {
        name: "UserType",
        type: "String",
        description: "Standard, Partner, Customer, Guest",
        required: false,
      },
      {
        name: "Alias",
        type: "String",
        description: "Short name shown in Salesforce UI",
        required: true,
      },
      {
        name: "FederationIdentifier",
        type: "String",
        description: "SSO federation ID",
        required: false,
      },
      {
        name: "Department",
        type: "String",
        description: "User department",
        required: false,
      },
      {
        name: "Title",
        type: "String",
        description: "Job title",
        required: false,
      },
      {
        name: "CompanyName",
        type: "String",
        description: "Company name",
        required: false,
      },
      {
        name: "Division",
        type: "String",
        description: "Business division",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create user, assign profile and role, set locale and language settings",
      },
      mover: {
        supported: true,
        description: "Update profile, role, department, and other user fields",
      },
      leaver: {
        supported: true,
        description:
          "Deactivate user (Salesforce does not support hard delete of users)",
      },
    },
  },
  sap: {
    connectorName: "SAP GRC Connector",
    schemaAttributes: [
      {
        name: "User ID",
        type: "String",
        description: "SAP user login ID",
        required: true,
      },
      {
        name: "First Name",
        type: "String",
        description: "User first name",
        required: true,
      },
      {
        name: "Last Name",
        type: "String",
        description: "User last name",
        required: true,
      },
      {
        name: "Email",
        type: "String",
        description: "User email address",
        required: false,
      },
      {
        name: "Department",
        type: "String",
        description: "Department assignment",
        required: false,
      },
      {
        name: "Position",
        type: "String",
        description: "HR position key",
        required: false,
      },
      {
        name: "Company Code",
        type: "String",
        description: "Company code (Buchungskreis)",
        required: false,
      },
      {
        name: "Plant",
        type: "String",
        description: "Plant assignment",
        required: false,
      },
      {
        name: "Cost Center",
        type: "String",
        description: "Cost center key",
        required: false,
      },
      {
        name: "Org Unit",
        type: "String",
        description: "Organizational unit",
        required: false,
      },
      {
        name: "Role",
        type: "String",
        description: "Single role assignment",
        required: false,
      },
      {
        name: "Profile",
        type: "String",
        description: "Authorization profile",
        required: false,
      },
      {
        name: "Authorization Group",
        type: "String",
        description: "User authorization group",
        required: false,
      },
      {
        name: "SNC Name",
        type: "String",
        description: "SNC distinguished name for secure comms",
        required: false,
      },
      {
        name: "Communication Type",
        type: "String",
        description: "Communication user type flag",
        required: false,
      },
      {
        name: "Lock Status",
        type: "Boolean",
        description: "User lock/unlock status",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create SAP user via RFC/BAPI, assign roles and authorization profiles",
      },
      mover: {
        supported: true,
        description:
          "Update org unit, cost center, and role assignments on transfer",
      },
      leaver: {
        supported: true,
        description:
          "Lock user account, revoke all role and profile assignments",
      },
    },
  },
  servicenow: {
    connectorName: "ServiceNow Connector",
    schemaAttributes: [
      {
        name: "user_name",
        type: "String",
        description: "Unique login username",
        required: true,
      },
      {
        name: "first_name",
        type: "String",
        description: "User first name",
        required: true,
      },
      {
        name: "last_name",
        type: "String",
        description: "User last name",
        required: true,
      },
      {
        name: "email",
        type: "String",
        description: "User email address",
        required: true,
      },
      {
        name: "department",
        type: "Reference",
        description: "Department reference",
        required: false,
      },
      {
        name: "title",
        type: "String",
        description: "Job title",
        required: false,
      },
      {
        name: "manager",
        type: "Reference",
        description: "Manager user reference",
        required: false,
      },
      {
        name: "active",
        type: "Boolean",
        description: "Account active flag",
        required: true,
      },
      {
        name: "locked_out",
        type: "Boolean",
        description: "Account lockout status",
        required: false,
      },
      {
        name: "vip",
        type: "Boolean",
        description: "VIP user designation",
        required: false,
      },
      {
        name: "roles",
        type: "List<Reference>",
        description: "Assigned system roles",
        required: false,
      },
      {
        name: "groups",
        type: "List<Reference>",
        description: "Group memberships",
        required: false,
      },
      {
        name: "company",
        type: "Reference",
        description: "Company association",
        required: false,
      },
      {
        name: "location",
        type: "Reference",
        description: "Office location reference",
        required: false,
      },
      {
        name: "phone",
        type: "String",
        description: "Business phone number",
        required: false,
      },
      {
        name: "mobile_phone",
        type: "String",
        description: "Mobile phone number",
        required: false,
      },
      {
        name: "source",
        type: "String",
        description: "User source/origin system",
        required: false,
      },
      {
        name: "sys_id",
        type: "GUID",
        description: "ServiceNow system ID",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create user record, assign roles and groups via REST Table API",
      },
      mover: {
        supported: true,
        description: "Update department, manager, title, and group memberships",
      },
      leaver: {
        supported: true,
        description: "Deactivate account, remove role and group assignments",
      },
    },
  },
  aws: {
    connectorName: "AWS Connector",
    schemaAttributes: [
      {
        name: "UserName",
        type: "String",
        description: "IAM username",
        required: true,
      },
      {
        name: "Path",
        type: "String",
        description: "IAM path (namespace)",
        required: false,
      },
      {
        name: "ARN",
        type: "String",
        description: "Amazon Resource Name",
        required: false,
      },
      {
        name: "UserId",
        type: "String",
        description: "Unique IAM user ID",
        required: false,
      },
      {
        name: "Groups[]",
        type: "List<String>",
        description: "IAM group memberships",
        required: false,
      },
      {
        name: "Policies[]",
        type: "List<String>",
        description: "Inline policy names",
        required: false,
      },
      {
        name: "AttachedPolicies[]",
        type: "List<String>",
        description: "Managed policy ARNs",
        required: false,
      },
      {
        name: "Tags[]",
        type: "List<KeyValue>",
        description: "Resource tags",
        required: false,
      },
      {
        name: "AccessKeyIds[]",
        type: "List<String>",
        description: "Access key identifiers",
        required: false,
      },
      {
        name: "MFADevices[]",
        type: "List<String>",
        description: "MFA device serial numbers",
        required: false,
      },
      {
        name: "PermissionsBoundary",
        type: "String",
        description: "Permissions boundary policy ARN",
        required: false,
      },
      {
        name: "PasswordLastUsed",
        type: "DateTime",
        description: "Last password usage timestamp",
        required: false,
      },
      {
        name: "CreateDate",
        type: "DateTime",
        description: "Account creation date",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create IAM user, attach managed/inline policies, add to groups, create access keys",
      },
      mover: {
        supported: true,
        description:
          "Update group memberships, attach or detach policies and permissions boundaries",
      },
      leaver: {
        supported: true,
        description:
          "Disable access keys, detach all policies, remove from groups, delete IAM user",
      },
    },
  },
  okta: {
    connectorName: "Okta Connector",
    schemaAttributes: [
      {
        name: "login",
        type: "String",
        description: "Okta login (usually email)",
        required: true,
      },
      {
        name: "firstName",
        type: "String",
        description: "User first name",
        required: true,
      },
      {
        name: "lastName",
        type: "String",
        description: "User last name",
        required: true,
      },
      {
        name: "email",
        type: "String",
        description: "Primary email address",
        required: true,
      },
      {
        name: "displayName",
        type: "String",
        description: "Display name in Okta",
        required: false,
      },
      {
        name: "mobilePhone",
        type: "String",
        description: "Mobile phone number",
        required: false,
      },
      {
        name: "organization",
        type: "String",
        description: "Organization name",
        required: false,
      },
      {
        name: "division",
        type: "String",
        description: "Division or business unit",
        required: false,
      },
      {
        name: "department",
        type: "String",
        description: "Department name",
        required: false,
      },
      {
        name: "employeeNumber",
        type: "String",
        description: "HR employee number",
        required: false,
      },
      {
        name: "costCenter",
        type: "String",
        description: "Cost center code",
        required: false,
      },
      {
        name: "manager",
        type: "String",
        description: "Manager display name",
        required: false,
      },
      {
        name: "managerId",
        type: "String",
        description: "Manager's Okta ID",
        required: false,
      },
      {
        name: "userType",
        type: "String",
        description: "User type (Employee, Contractor, etc.)",
        required: false,
      },
      {
        name: "title",
        type: "String",
        description: "Job title",
        required: false,
      },
      {
        name: "locale",
        type: "String",
        description: "Locale setting",
        required: false,
      },
      {
        name: "timezone",
        type: "String",
        description: "Timezone setting",
        required: false,
      },
      {
        name: "groups[]",
        type: "List<String>",
        description: "Okta group memberships",
        required: false,
      },
      {
        name: "roles[]",
        type: "List<String>",
        description: "Assigned roles",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create user, activate account, assign groups, roles, and application access",
      },
      mover: {
        supported: true,
        description:
          "Update profile attributes, manage group memberships and app assignments",
      },
      leaver: {
        supported: true,
        description:
          "Deactivate or suspend user, revoke all active sessions and tokens",
      },
    },
  },
  github: {
    connectorName: "GitHub Connector",
    schemaAttributes: [
      {
        name: "login",
        type: "String",
        description: "GitHub username",
        required: true,
      },
      {
        name: "id",
        type: "Integer",
        description: "GitHub user ID",
        required: false,
      },
      {
        name: "email",
        type: "String",
        description: "Primary email address",
        required: false,
      },
      {
        name: "name",
        type: "String",
        description: "Display name",
        required: false,
      },
      {
        name: "company",
        type: "String",
        description: "Company association",
        required: false,
      },
      {
        name: "location",
        type: "String",
        description: "User location",
        required: false,
      },
      {
        name: "bio",
        type: "String",
        description: "Profile bio",
        required: false,
      },
      {
        name: "organizations[]",
        type: "List<String>",
        description: "GitHub organization memberships",
        required: false,
      },
      {
        name: "teams[]",
        type: "List<String>",
        description: "Team memberships within orgs",
        required: false,
      },
      {
        name: "repositories[]",
        type: "List<String>",
        description: "Repository access list",
        required: false,
      },
      {
        name: "role",
        type: "String",
        description: "Organization role (member, owner)",
        required: false,
      },
      {
        name: "created_at",
        type: "DateTime",
        description: "Account creation date",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Invite user to GitHub organization, assign to teams and repositories",
      },
      mover: {
        supported: true,
        description: "Update team memberships and repository permission levels",
      },
      leaver: {
        supported: true,
        description:
          "Remove user from organization (GitHub does not soft-delete org members)",
      },
    },
  },
  jira: {
    connectorName: "Atlassian Connector",
    schemaAttributes: [
      {
        name: "accountId",
        type: "String",
        description: "Atlassian account ID",
        required: true,
      },
      {
        name: "displayName",
        type: "String",
        description: "User display name",
        required: true,
      },
      {
        name: "emailAddress",
        type: "String",
        description: "Email address",
        required: true,
      },
      {
        name: "active",
        type: "Boolean",
        description: "Account active status",
        required: true,
      },
      {
        name: "locale",
        type: "String",
        description: "User locale preference",
        required: false,
      },
      {
        name: "timeZone",
        type: "String",
        description: "User timezone",
        required: false,
      },
      {
        name: "applicationRoles[]",
        type: "List<String>",
        description: "Jira application role keys",
        required: false,
      },
      {
        name: "groups[]",
        type: "List<String>",
        description: "Group memberships",
        required: false,
      },
      {
        name: "accountType",
        type: "String",
        description: "atlassian, app, customer",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create Atlassian account, assign groups and Jira project roles",
      },
      mover: {
        supported: true,
        description: "Update group memberships and project role assignments",
      },
      leaver: {
        supported: true,
        description:
          "Deactivate account, remove from all project roles and groups",
      },
    },
  },
  confluence: {
    connectorName: "Atlassian Connector",
    schemaAttributes: [
      {
        name: "accountId",
        type: "String",
        description: "Atlassian account ID",
        required: true,
      },
      {
        name: "displayName",
        type: "String",
        description: "Display name in Confluence",
        required: true,
      },
      {
        name: "emailAddress",
        type: "String",
        description: "Email address",
        required: true,
      },
      {
        name: "active",
        type: "Boolean",
        description: "Account active status",
        required: true,
      },
      {
        name: "locale",
        type: "String",
        description: "Locale preference",
        required: false,
      },
      {
        name: "timeZone",
        type: "String",
        description: "Timezone setting",
        required: false,
      },
      {
        name: "groups[]",
        type: "List<String>",
        description: "Space and global group memberships",
        required: false,
      },
      {
        name: "spaces[]",
        type: "List<String>",
        description: "Confluence space access list",
        required: false,
      },
      {
        name: "personalSpace",
        type: "String",
        description: "Personal space key",
        required: false,
      },
      {
        name: "operations[]",
        type: "List<String>",
        description: "Permitted space operations",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create Atlassian account, add to Confluence groups and spaces",
      },
      mover: {
        supported: true,
        description: "Update group memberships and space access permissions",
      },
      leaver: {
        supported: true,
        description:
          "Deactivate account, remove from all groups and space access",
      },
    },
  },
  sharepoint: {
    connectorName: "Microsoft 365 Connector",
    schemaAttributes: [
      {
        name: "LoginName",
        type: "String",
        description: "SharePoint login name (UPN)",
        required: true,
      },
      {
        name: "Title",
        type: "String",
        description: "Display name",
        required: true,
      },
      {
        name: "Email",
        type: "String",
        description: "Email address",
        required: true,
      },
      {
        name: "IsSiteAdmin",
        type: "Boolean",
        description: "Site collection admin flag",
        required: false,
      },
      {
        name: "Groups[]",
        type: "List<String>",
        description: "SharePoint group memberships",
        required: false,
      },
      {
        name: "Roles[]",
        type: "List<String>",
        description: "Site role assignments",
        required: false,
      },
      {
        name: "SPGroups[]",
        type: "List<String>",
        description: "SharePoint permission groups",
        required: false,
      },
      {
        name: "PrincipalType",
        type: "String",
        description: "User, Group, or SharePoint Group",
        required: false,
      },
      {
        name: "UserPrincipalName",
        type: "String",
        description: "Azure AD UPN",
        required: false,
      },
      {
        name: "Department",
        type: "String",
        description: "Department from directory",
        required: false,
      },
      {
        name: "JobTitle",
        type: "String",
        description: "Job title from directory",
        required: false,
      },
      {
        name: "MobilePhone",
        type: "String",
        description: "Mobile phone number",
        required: false,
      },
      {
        name: "IsEmailAuthenticationGuestUser",
        type: "Boolean",
        description: "External/guest user flag",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Add user to SharePoint site collection, assign to groups and permission levels",
      },
      mover: {
        supported: true,
        description:
          "Update site group memberships and permission level assignments",
      },
      leaver: {
        supported: true,
        description:
          "Remove user from all SharePoint sites and revoke all permissions",
      },
    },
  },
  oracle: {
    connectorName: "Oracle EBS Connector",
    schemaAttributes: [
      {
        name: "USERNAME",
        type: "String",
        description: "Oracle database username",
        required: true,
      },
      {
        name: "USER_ID",
        type: "Integer",
        description: "Internal Oracle user ID",
        required: false,
      },
      {
        name: "PROFILE",
        type: "String",
        description: "User profile assignment",
        required: false,
      },
      {
        name: "ACCOUNT_STATUS",
        type: "String",
        description: "OPEN, LOCKED, EXPIRED, etc.",
        required: true,
      },
      {
        name: "LOCK_DATE",
        type: "DateTime",
        description: "Date account was locked",
        required: false,
      },
      {
        name: "EXPIRY_DATE",
        type: "DateTime",
        description: "Password expiration date",
        required: false,
      },
      {
        name: "DEFAULT_TABLESPACE",
        type: "String",
        description: "Default tablespace assignment",
        required: false,
      },
      {
        name: "TEMPORARY_TABLESPACE",
        type: "String",
        description: "Temporary tablespace",
        required: false,
      },
      {
        name: "CREATED",
        type: "DateTime",
        description: "Account creation date",
        required: false,
      },
      {
        name: "ROLES[]",
        type: "List<String>",
        description: "Granted database roles",
        required: false,
      },
      {
        name: "SYSTEM_PRIVILEGES[]",
        type: "List<String>",
        description: "System-level privileges",
        required: false,
      },
      {
        name: "OBJECT_PRIVILEGES[]",
        type: "List<String>",
        description: "Object-level privileges",
        required: false,
      },
      {
        name: "AUTHENTICATION_TYPE",
        type: "String",
        description: "PASSWORD, EXTERNAL, GLOBAL, NONE",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create database user, grant roles and system/object privileges",
      },
      mover: {
        supported: true,
        description: "Modify granted roles and privilege assignments",
      },
      leaver: {
        supported: true,
        description: "Lock account, revoke all roles and privileges",
      },
    },
  },
  zoom: {
    connectorName: "Zoom Connector",
    schemaAttributes: [
      {
        name: "id",
        type: "String",
        description: "Zoom user ID",
        required: false,
      },
      {
        name: "first_name",
        type: "String",
        description: "User first name",
        required: true,
      },
      {
        name: "last_name",
        type: "String",
        description: "User last name",
        required: true,
      },
      {
        name: "email",
        type: "String",
        description: "Email address (login)",
        required: true,
      },
      {
        name: "type",
        type: "Integer",
        description: "1=Basic, 2=Licensed, 3=On-Prem",
        required: true,
      },
      {
        name: "pmi",
        type: "Integer",
        description: "Personal meeting ID",
        required: false,
      },
      {
        name: "timezone",
        type: "String",
        description: "Timezone setting",
        required: false,
      },
      {
        name: "dept",
        type: "String",
        description: "Department name",
        required: false,
      },
      {
        name: "status",
        type: "String",
        description: "active, inactive, pending",
        required: false,
      },
      {
        name: "role_name",
        type: "String",
        description: "Zoom role assignment",
        required: false,
      },
      {
        name: "group_ids[]",
        type: "List<String>",
        description: "Zoom group IDs",
        required: false,
      },
      {
        name: "im_group_ids[]",
        type: "List<String>",
        description: "IM group IDs",
        required: false,
      },
      {
        name: "language",
        type: "String",
        description: "Interface language",
        required: false,
      },
      {
        name: "phone_number",
        type: "String",
        description: "Work phone number",
        required: false,
      },
      {
        name: "vanity_name",
        type: "String",
        description: "Zoom vanity URL name",
        required: false,
      },
    ],
    jmlOperations: {
      joiner: {
        supported: true,
        description:
          "Create Zoom user (Basic/Licensed/On-Prem), assign to groups and role",
      },
      mover: {
        supported: true,
        description:
          "Update user type, group memberships, and role assignments",
      },
      leaver: {
        supported: true,
        description: "Deactivate or delete Zoom user account",
      },
    },
  },
};
function getConnectorCapability(appName) {
  const name = appName.toLowerCase();
  for (const [key, cap] of Object.entries(CONNECTOR_CAPABILITIES)) {
    if (name.includes(key)) return cap;
  }
  return null;
}
const P_USERNAME = {
  key: "USERNAME",
  label: "Username",
  type: "text",
  placeholder: {
    "non-prod": "svc_impl_user",
    prod: "svc_prod_user",
  },
};
const P_PASSWORD = {
  key: "PASSWORD",
  label: "Password",
  type: "password",
  placeholder: {
    "non-prod": "••••••••",
    prod: "••••••••",
  },
};
const P_CLIENT_ID = {
  key: "CLIENT_ID",
  label: "Client ID",
  type: "text",
  placeholder: {
    "non-prod": "client-id-staging",
    prod: "client-id-prod",
  },
};
const P_CLIENT_SECRET = {
  key: "CLIENT_SECRET",
  label: "Client Secret",
  type: "password",
  placeholder: {
    "non-prod": "••••••••",
    prod: "••••••••",
  },
};
const P_TENANT_ID = {
  key: "TENANT_ID",
  label: "Tenant ID",
  type: "text",
  placeholder: {
    "non-prod": "sandbox-tenant-guid",
    prod: "prod-tenant-guid",
  },
};
const JDBC_DRIVER_PARAM = {
  key: "JDBC_DRIVER",
  label: "JDBC Driver",
  type: "select",
  defaultValue: "MySQL (com.mysql.cj.jdbc.Driver)",
  options: [
    "MySQL (com.mysql.cj.jdbc.Driver)",
    "PostgreSQL (org.postgresql.Driver)",
    "Microsoft SQL Server (com.microsoft.sqlserver.jdbc.SQLServerDriver)",
    "Oracle DB (oracle.jdbc.OracleDriver)",
    "IBM DB2 (com.ibm.db2.jcc.DB2Driver)",
    "SAP HANA (com.sap.db.jdbc.Driver)",
    "Snowflake (net.snowflake.client.jdbc.SnowflakeDriver)",
    "MariaDB (org.mariadb.jdbc.Driver)",
    "Sybase / SAP ASE (com.sybase.jdbc4.jdbc.SybDriver)",
    "Amazon Redshift (com.amazon.redshift.jdbc.Driver)",
    "Teradata (com.teradata.jdbc.TeraDriver)",
    "SQLite (org.sqlite.JDBC)",
  ],
  placeholder: {
    "non-prod": "Select JDBC driver",
    prod: "Select JDBC driver",
  },
};
const SAVIYNT_EIC_CONNECTOR = {
  id: "saviynt-eic",
  label: "Saviynt EIC (Push & Deploy)",
  params: [
    {
      key: "SAVIYNT_URL",
      label: "Saviynt Instance URL",
      type: "url",
      placeholder: {
        "non-prod": "https://yourcompany-dev.saviyntcloud.com",
        prod: "https://yourcompany.saviyntcloud.com",
      },
    },
    {
      key: "USERNAME",
      label: "Username",
      type: "text",
      placeholder: {
        "non-prod": "saviynt_api_user",
        prod: "saviynt_api_user",
      },
    },
    {
      key: "PASSWORD",
      label: "Password",
      type: "password",
      placeholder: {
        "non-prod": "••••••••",
        prod: "••••••••",
      },
    },
    {
      key: "GRANT_TYPE",
      label: "OAuth Grant Type",
      type: "select",
      defaultValue: "password",
      options: ["password", "client_credentials"],
      placeholder: {
        "non-prod": "password",
        prod: "password",
      },
    },
    {
      key: "CLIENT_ID",
      label: "OAuth Client ID",
      type: "text",
      optional: true,
      placeholder: {
        "non-prod": "saviynt-client-id",
        prod: "saviynt-client-id",
      },
    },
    {
      key: "CLIENT_SECRET",
      label: "OAuth Client Secret",
      type: "password",
      optional: true,
      placeholder: {
        "non-prod": "••••••••",
        prod: "••••••••",
      },
    },
    {
      key: "TOKEN_URL",
      label: "Token Endpoint Path",
      type: "text",
      defaultValue: "/ECM/oauth/token",
      placeholder: {
        "non-prod": "/ECM/oauth/token",
        prod: "/ECM/oauth/token",
      },
    },
    {
      key: "API_VERSION",
      label: "API Version",
      type: "select",
      defaultValue: "v5",
      options: ["v5", "v4", "v3"],
      placeholder: {
        "non-prod": "v5",
        prod: "v5",
      },
    },
    {
      key: "TENANT_ID",
      label: "Tenant ID",
      type: "text",
      optional: true,
      placeholder: {
        "non-prod": "default",
        prod: "default",
      },
    },
    {
      key: "SCOPE",
      label: "OAuth Scope",
      type: "text",
      optional: true,
      placeholder: {
        "non-prod": "openid profile",
        prod: "openid profile",
      },
    },
  ],
};
const ALL_CONNECTORS = [
  {
    id: "active-directory",
    label: "Active Directory (AD)",
    params: [
      {
        key: "AD_HOST",
        label: "AD Host",
        type: "url",
        placeholder: {
          "non-prod": "ldap://ad-dev.company.com",
          prod: "ldap://ad.company.com",
        },
      },
      {
        key: "AD_PORT",
        label: "AD Port",
        type: "text",
        defaultValue: "389",
        placeholder: {
          "non-prod": "389",
          prod: "389",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "BASE_DN",
        label: "Base DN",
        type: "text",
        placeholder: {
          "non-prod": "DC=dev,DC=company,DC=com",
          prod: "DC=company,DC=com",
        },
      },
      {
        key: "SEARCH_FILTER",
        label: "Search Filter (optional)",
        type: "text",
        optional: true,
        placeholder: {
          "non-prod": "(objectClass=user)",
          prod: "(objectClass=user)",
        },
      },
    ],
  },
  {
    id: "adsi",
    label: "ADSI (Active Directory Service Interfaces)",
    params: [
      {
        key: "ADSI_PATH",
        label: "ADSI Path",
        type: "url",
        placeholder: {
          "non-prod": "LDAP://ad-dev.company.com",
          prod: "LDAP://ad.company.com",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "SEARCH_BASE",
        label: "Search Base",
        type: "text",
        placeholder: {
          "non-prod": "OU=Users,DC=dev,DC=company,DC=com",
          prod: "OU=Users,DC=company,DC=com",
        },
      },
    ],
  },
  {
    id: "rest-generic",
    label: "REST (Generic)",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://staging.api.company.com",
          prod: "https://api.company.com",
        },
      },
      {
        key: "AUTH_TYPE",
        label: "Auth Type",
        type: "select",
        defaultValue: "Basic",
        options: ["Basic", "OAuth2", "API Key", "Bearer Token"],
        placeholder: {
          "non-prod": "Basic",
          prod: "Basic",
        },
      },
      {
        ...P_USERNAME,
        optional: true,
      },
      {
        ...P_PASSWORD,
        optional: true,
      },
      {
        key: "API_KEY",
        label: "API Key (optional)",
        type: "password",
        optional: true,
        placeholder: {
          "non-prod": "api-key-staging",
          prod: "api-key-prod",
        },
      },
      {
        key: "BEARER_TOKEN",
        label: "Bearer Token (optional)",
        type: "password",
        optional: true,
        placeholder: {
          "non-prod": "bearer-token-staging",
          prod: "bearer-token-prod",
        },
      },
    ],
  },
  {
    id: "database-jdbc",
    label: "Database / JDBC",
    params: [
      {
        key: "JDBC_URL",
        label: "JDBC URL",
        type: "url",
        placeholder: {
          "non-prod": "jdbc:mysql://dev-db.company.com:3306/mydb",
          prod: "jdbc:mysql://db.company.com:3306/mydb",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "DRIVER_CLASS",
        label: "Driver Class",
        type: "text",
        defaultValue: "com.mysql.cj.jdbc.Driver",
        placeholder: {
          "non-prod": "com.mysql.cj.jdbc.Driver",
          prod: "com.mysql.cj.jdbc.Driver",
        },
      },
      JDBC_DRIVER_PARAM,
    ],
  },
  {
    id: "sap-rfc-bapi",
    label: "SAP RFC/BAPI",
    params: [
      {
        key: "HOSTNAME",
        label: "Hostname",
        type: "text",
        placeholder: {
          "non-prod": "sap-dev.company.com",
          prod: "sap-prod.company.com",
        },
      },
      {
        key: "SYSTEM_NUMBER",
        label: "System Number",
        type: "text",
        placeholder: {
          "non-prod": "00",
          prod: "01",
        },
      },
      {
        key: "CLIENT",
        label: "Client",
        type: "text",
        placeholder: {
          "non-prod": "100",
          prod: "200",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "LANGUAGE",
        label: "Language",
        type: "text",
        defaultValue: "EN",
        placeholder: {
          "non-prod": "EN",
          prod: "EN",
        },
      },
    ],
  },
  {
    id: "sap-hana-jdbc",
    label: "SAP HANA JDBC",
    params: [
      {
        key: "JDBC_URL",
        label: "JDBC URL",
        type: "url",
        placeholder: {
          "non-prod": "jdbc:sap://sap-dev.company.com:30015",
          prod: "jdbc:sap://sap-prod.company.com:30015",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "DRIVER_CLASS",
        label: "Driver Class",
        type: "text",
        defaultValue: "com.sap.db.jdbc.Driver",
        placeholder: {
          "non-prod": "com.sap.db.jdbc.Driver",
          prod: "com.sap.db.jdbc.Driver",
        },
      },
      {
        ...JDBC_DRIVER_PARAM,
        defaultValue: "SAP HANA (com.sap.db.jdbc.Driver)",
      },
    ],
  },
  {
    id: "sap-s4hana-rest",
    label: "SAP S/4HANA REST",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://sap-dev.company.com/api",
          prod: "https://sap-prod.company.com/api",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "GRANT_TYPE",
        label: "Grant Type",
        type: "select",
        defaultValue: "client_credentials",
        options: ["client_credentials", "password"],
        placeholder: {
          "non-prod": "client_credentials",
          prod: "client_credentials",
        },
      },
    ],
  },
  {
    id: "sap-concur-rest",
    label: "SAP Concur REST",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        defaultValue: "https://www.concursolutions.com",
        placeholder: {
          "non-prod": "https://us2.concursolutions.com",
          prod: "https://www.concursolutions.com",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "GRANT_TYPE",
        label: "Grant Type",
        type: "select",
        defaultValue: "client_credentials",
        options: ["client_credentials"],
        placeholder: {
          "non-prod": "client_credentials",
          prod: "client_credentials",
        },
      },
    ],
  },
  {
    id: "sap-successfactors-scim",
    label: "SAP SuccessFactors SCIM",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://api4.successfactors.com",
          prod: "https://api4.successfactors.com",
        },
      },
      {
        key: "COMPANY_ID",
        label: "Company ID",
        type: "text",
        placeholder: {
          "non-prod": "COMPANY_DEV",
          prod: "COMPANY_PROD",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "API_KEY",
        label: "API Key (optional)",
        type: "password",
        optional: true,
        placeholder: {
          "non-prod": "api-key-staging",
          prod: "api-key-prod",
        },
      },
    ],
  },
  {
    id: "sap-ias",
    label: "SAP IAS (Identity Authentication Service)",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://company-dev.accounts400.ondemand.com",
          prod: "https://company.accounts.ondemand.com",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      P_TENANT_ID,
    ],
  },
  {
    id: "salesforce-rest-oauth2",
    label: "Salesforce REST OAuth2",
    params: [
      {
        key: "INSTANCE_URL",
        label: "Instance URL",
        type: "url",
        placeholder: {
          "non-prod": "https://{subdomain}.sandbox.my.salesforce.com",
          prod: "https://{subdomain}.my.salesforce.com",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      P_USERNAME,
      P_PASSWORD,
      {
        key: "SECURITY_TOKEN",
        label: "Security Token",
        type: "password",
        placeholder: {
          "non-prod": "sec-token-sandbox",
          prod: "sec-token-prod",
        },
      },
    ],
  },
  {
    id: "workday-soap",
    label: "Workday SOAP",
    params: [
      {
        key: "SOAP_ENDPOINT",
        label: "SOAP Endpoint",
        type: "url",
        placeholder: {
          "non-prod":
            "https://wd2-impl-services1.workday.com/ccx/service/{tenant}/Human_Resources/v34.0",
          prod: "https://services1.workday.com/ccx/service/{tenant}/Human_Resources/v34.0",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "PASSWORD_TYPE",
        label: "Password Type",
        type: "select",
        defaultValue: "Password",
        options: ["Password", "X509"],
        placeholder: {
          "non-prod": "Password",
          prod: "Password",
        },
      },
    ],
  },
  {
    id: "workday-rest-oauth",
    label: "Workday REST OAuth",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://wd2-impl-services1.workday.com",
          prod: "https://services1.workday.com",
        },
      },
      {
        key: "TENANT_NAME",
        label: "Tenant Name",
        type: "text",
        placeholder: {
          "non-prod": "mycompany_impl",
          prod: "mycompany",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "REFRESH_TOKEN",
        label: "Refresh Token",
        type: "password",
        placeholder: {
          "non-prod": "refresh-token-impl",
          prod: "refresh-token-prod",
        },
      },
    ],
  },
  {
    id: "servicenow-rest",
    label: "ServiceNow REST",
    params: [
      {
        key: "INSTANCE_URL",
        label: "Instance URL",
        type: "url",
        placeholder: {
          "non-prod": "https://{instance}-dev.service-now.com",
          prod: "https://{instance}.service-now.com",
        },
      },
      P_USERNAME,
      P_PASSWORD,
    ],
  },
  {
    id: "github-rest-token",
    label: "GitHub REST Token",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://github-staging.company.com/api/v3",
          prod: "https://api.github.com",
        },
      },
      {
        key: "API_TOKEN",
        label: "API Token",
        type: "password",
        placeholder: {
          "non-prod": "ghp_staging_token",
          prod: "ghp_prod_token",
        },
      },
    ],
  },
  {
    id: "github-rest-oauth",
    label: "GitHub REST OAuth",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://github-staging.company.com/api/v3",
          prod: "https://api.github.com",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
    ],
  },
  {
    id: "okta-scim-oauth2",
    label: "Okta SCIM OAuth2",
    params: [
      {
        key: "DOMAIN",
        label: "Okta Domain",
        type: "url",
        placeholder: {
          "non-prod": "https://{org}.oktapreview.com",
          prod: "https://{org}.okta.com",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "SCOPE",
        label: "Scope",
        type: "text",
        defaultValue: "okta.users.manage",
        placeholder: {
          "non-prod": "okta.users.manage",
          prod: "okta.users.manage",
        },
      },
    ],
  },
  {
    id: "okta-rest-token",
    label: "Okta REST Token",
    params: [
      {
        key: "DOMAIN",
        label: "Okta Domain",
        type: "url",
        placeholder: {
          "non-prod": "https://{org}.oktapreview.com",
          prod: "https://{org}.okta.com",
        },
      },
      {
        key: "API_TOKEN",
        label: "API Token",
        type: "password",
        placeholder: {
          "non-prod": "oktaPreviewToken",
          prod: "oktaProdToken",
        },
      },
    ],
  },
  {
    id: "ldap",
    label: "LDAP",
    params: [
      {
        key: "HOST",
        label: "Host",
        type: "url",
        placeholder: {
          "non-prod": "ldap://ldap-dev.company.com",
          prod: "ldap://ldap.company.com",
        },
      },
      {
        key: "PORT",
        label: "Port",
        type: "text",
        defaultValue: "389",
        placeholder: {
          "non-prod": "389",
          prod: "389",
        },
      },
      {
        key: "BASE_DN",
        label: "Base DN",
        type: "text",
        placeholder: {
          "non-prod": "DC=dev,DC=company,DC=com",
          prod: "DC=company,DC=com",
        },
      },
      {
        key: "BIND_DN",
        label: "Bind DN",
        type: "text",
        placeholder: {
          "non-prod": "CN=svc-dev,DC=dev,DC=company,DC=com",
          prod: "CN=svc,DC=company,DC=com",
        },
      },
      {
        key: "BIND_PASSWORD",
        label: "Bind Password",
        type: "password",
        placeholder: {
          "non-prod": "••••••••",
          prod: "••••••••",
        },
      },
      {
        key: "USE_SSL",
        label: "Use SSL",
        type: "select",
        defaultValue: "No",
        options: ["Yes", "No"],
        placeholder: {
          "non-prod": "No",
          prod: "No",
        },
      },
    ],
  },
  {
    id: "scim-20-generic",
    label: "SCIM 2.0 (Generic)",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://staging.api.company.com/scim/v2",
          prod: "https://api.company.com/scim/v2",
        },
      },
      {
        key: "AUTH_TYPE",
        label: "Auth Type",
        type: "select",
        defaultValue: "OAuth2",
        options: ["OAuth2", "Bearer Token", "Basic"],
        placeholder: {
          "non-prod": "OAuth2",
          prod: "OAuth2",
        },
      },
      {
        ...P_CLIENT_ID,
        optional: true,
      },
      {
        ...P_CLIENT_SECRET,
        optional: true,
      },
      {
        key: "BEARER_TOKEN",
        label: "Bearer Token (optional)",
        type: "password",
        optional: true,
        placeholder: {
          "non-prod": "bearer-token-staging",
          prod: "bearer-token-prod",
        },
      },
    ],
  },
  {
    id: "microsoft-entra-id",
    label: "Microsoft Entra ID (Azure AD)",
    params: [
      P_TENANT_ID,
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "RESOURCE_URL",
        label: "Resource URL",
        type: "url",
        defaultValue: "https://graph.microsoft.com",
        placeholder: {
          "non-prod": "https://graph.microsoft.com",
          prod: "https://graph.microsoft.com",
        },
      },
    ],
  },
  {
    id: "microsoft-teams",
    label: "Microsoft Teams",
    params: [
      P_TENANT_ID,
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "RESOURCE_URL",
        label: "Resource URL",
        type: "url",
        defaultValue: "https://graph.microsoft.com",
        placeholder: {
          "non-prod": "https://graph.microsoft.com",
          prod: "https://graph.microsoft.com",
        },
      },
    ],
  },
  {
    id: "sharepoint-graph-api",
    label: "SharePoint / Graph API",
    params: [
      P_TENANT_ID,
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "RESOURCE_URL",
        label: "Resource URL",
        type: "url",
        placeholder: {
          "non-prod": "https://graph.microsoft.com/ [sandbox]",
          prod: "https://graph.microsoft.com/",
        },
      },
    ],
  },
  {
    id: "oracle-erp-rest",
    label: "Oracle ERP REST",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://oracle-test.company.com/api",
          prod: "https://oracle-prod.company.com/api",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
    ],
  },
  {
    id: "oracle-erp-jdbc",
    label: "Oracle ERP JDBC",
    params: [
      {
        key: "JDBC_URL",
        label: "JDBC URL",
        type: "url",
        placeholder: {
          "non-prod": "jdbc:oracle:thin:@//test-db.company.com:1521/ORCL",
          prod: "jdbc:oracle:thin:@//prod-db.company.com:1521/ORCL",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "DRIVER_CLASS",
        label: "Driver Class",
        type: "text",
        defaultValue: "oracle.jdbc.OracleDriver",
        placeholder: {
          "non-prod": "oracle.jdbc.OracleDriver",
          prod: "oracle.jdbc.OracleDriver",
        },
      },
      {
        ...JDBC_DRIVER_PARAM,
        defaultValue: "Oracle DB (oracle.jdbc.OracleDriver)",
      },
    ],
  },
  {
    id: "oracle-peoplesoft",
    label: "Oracle PeopleSoft",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://psft-dev.company.com/psp",
          prod: "https://psft.company.com/psp",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "DATABASE_NAME",
        label: "Database Name",
        type: "text",
        placeholder: {
          "non-prod": "PSFT_DEV",
          prod: "PSFT_PROD",
        },
      },
    ],
  },
  {
    id: "oracle-identity-manager",
    label: "Oracle Identity Manager",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://oim-dev.company.com:14000/oim",
          prod: "https://oim.company.com:14000/oim",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "SERVER_URL",
        label: "Server URL",
        type: "url",
        placeholder: {
          "non-prod": "t3://oim-dev.company.com:14000",
          prod: "t3://oim.company.com:14000",
        },
      },
    ],
  },
  {
    id: "oracle-unified-directory",
    label: "Oracle Unified Directory",
    params: [
      {
        key: "HOST",
        label: "Host",
        type: "url",
        placeholder: {
          "non-prod": "ldap://oud-dev.company.com",
          prod: "ldap://oud.company.com",
        },
      },
      {
        key: "PORT",
        label: "Port",
        type: "text",
        defaultValue: "389",
        placeholder: {
          "non-prod": "389",
          prod: "389",
        },
      },
      {
        key: "BASE_DN",
        label: "Base DN",
        type: "text",
        placeholder: {
          "non-prod": "DC=dev,DC=company,DC=com",
          prod: "DC=company,DC=com",
        },
      },
      {
        key: "BIND_DN",
        label: "Bind DN",
        type: "text",
        placeholder: {
          "non-prod": "CN=svc-dev,DC=company,DC=com",
          prod: "CN=svc,DC=company,DC=com",
        },
      },
      {
        key: "BIND_PASSWORD",
        label: "Bind Password",
        type: "password",
        placeholder: {
          "non-prod": "••••••••",
          prod: "••••••••",
        },
      },
    ],
  },
  {
    id: "oracle-db-jdbc",
    label: "Oracle Database JDBC",
    params: [
      {
        key: "JDBC_URL",
        label: "JDBC URL",
        type: "url",
        placeholder: {
          "non-prod": "jdbc:oracle:thin:@//test-db.company.com:1521/ORCL",
          prod: "jdbc:oracle:thin:@//db.company.com:1521/ORCL",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "DRIVER_CLASS",
        label: "Driver Class",
        type: "text",
        defaultValue: "oracle.jdbc.OracleDriver",
        placeholder: {
          "non-prod": "oracle.jdbc.OracleDriver",
          prod: "oracle.jdbc.OracleDriver",
        },
      },
      {
        ...JDBC_DRIVER_PARAM,
        defaultValue: "Oracle DB (oracle.jdbc.OracleDriver)",
      },
    ],
  },
  {
    id: "aws-iam-sdk",
    label: "AWS IAM SDK",
    params: [
      {
        key: "ACCESS_KEY_ID",
        label: "Access Key ID",
        type: "text",
        placeholder: {
          "non-prod": "AKIASANDBOX000000001",
          prod: "AKIAPROD0000000001",
        },
      },
      {
        key: "SECRET_ACCESS_KEY",
        label: "Secret Access Key",
        type: "password",
        placeholder: {
          "non-prod": "••••••••",
          prod: "••••••••",
        },
      },
      {
        key: "REGION",
        label: "Region",
        type: "text",
        placeholder: {
          "non-prod": "us-east-1-sandbox",
          prod: "us-east-1",
        },
      },
      {
        key: "SESSION_TOKEN",
        label: "Session Token (optional)",
        type: "password",
        optional: true,
        placeholder: {
          "non-prod": "(leave blank if using IAM user)",
          prod: "(leave blank if using IAM user)",
        },
      },
    ],
  },
  {
    id: "aws-iam-identity-center",
    label: "AWS IAM Identity Center (SSO)",
    params: [
      {
        key: "ACCESS_KEY_ID",
        label: "Access Key ID",
        type: "text",
        placeholder: {
          "non-prod": "AKIASANDBOX000000001",
          prod: "AKIAPROD0000000001",
        },
      },
      {
        key: "SECRET_ACCESS_KEY",
        label: "Secret Access Key",
        type: "password",
        placeholder: {
          "non-prod": "••••••••",
          prod: "••••••••",
        },
      },
      {
        key: "REGION",
        label: "Region",
        type: "text",
        placeholder: {
          "non-prod": "us-east-1",
          prod: "us-east-1",
        },
      },
      {
        key: "INSTANCE_ARN",
        label: "Instance ARN",
        type: "text",
        placeholder: {
          "non-prod": "arn:aws:sso:::instance/ssoins-dev-xxx",
          prod: "arn:aws:sso:::instance/ssoins-xxx",
        },
      },
      {
        key: "IDENTITY_STORE_ID",
        label: "Identity Store ID",
        type: "text",
        placeholder: {
          "non-prod": "d-dev-xxxxxxx",
          prod: "d-xxxxxxx",
        },
      },
    ],
  },
  {
    id: "snowflake-rest-scim",
    label: "Snowflake REST/SCIM",
    params: [
      {
        key: "ACCOUNT_URL",
        label: "Account URL",
        type: "url",
        placeholder: {
          "non-prod": "https://company-dev.snowflakecomputing.com",
          prod: "https://company.snowflakecomputing.com",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "SCIM_BASE_URL",
        label: "SCIM Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://company-dev.snowflakecomputing.com/scim/v2",
          prod: "https://company.snowflakecomputing.com/scim/v2",
        },
      },
    ],
  },
  {
    id: "snowflake-jdbc",
    label: "Snowflake JDBC",
    params: [
      {
        key: "JDBC_URL",
        label: "JDBC URL",
        type: "url",
        placeholder: {
          "non-prod": "jdbc:snowflake://company-dev.snowflakecomputing.com",
          prod: "jdbc:snowflake://company.snowflakecomputing.com",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "DRIVER_CLASS",
        label: "Driver Class",
        type: "text",
        defaultValue: "net.snowflake.client.jdbc.SnowflakeDriver",
        placeholder: {
          "non-prod": "net.snowflake.client.jdbc.SnowflakeDriver",
          prod: "net.snowflake.client.jdbc.SnowflakeDriver",
        },
      },
      {
        ...JDBC_DRIVER_PARAM,
        defaultValue: "Snowflake (net.snowflake.client.jdbc.SnowflakeDriver)",
      },
      {
        key: "WAREHOUSE",
        label: "Warehouse (optional)",
        type: "text",
        optional: true,
        placeholder: {
          "non-prod": "DEV_WH",
          prod: "PROD_WH",
        },
      },
      {
        key: "DATABASE",
        label: "Database (optional)",
        type: "text",
        optional: true,
        placeholder: {
          "non-prod": "DEV_DB",
          prod: "PROD_DB",
        },
      },
    ],
  },
  {
    id: "openldap",
    label: "OpenLDAP",
    params: [
      {
        key: "HOST",
        label: "Host",
        type: "url",
        placeholder: {
          "non-prod": "ldap://ldap-dev.company.com",
          prod: "ldap://ldap.company.com",
        },
      },
      {
        key: "PORT",
        label: "Port",
        type: "text",
        defaultValue: "389",
        placeholder: {
          "non-prod": "389",
          prod: "389",
        },
      },
      {
        key: "BASE_DN",
        label: "Base DN",
        type: "text",
        placeholder: {
          "non-prod": "DC=dev,DC=company,DC=com",
          prod: "DC=company,DC=com",
        },
      },
      {
        key: "BIND_DN",
        label: "Bind DN",
        type: "text",
        placeholder: {
          "non-prod": "CN=svc-dev,DC=company,DC=com",
          prod: "CN=svc,DC=company,DC=com",
        },
      },
      {
        key: "BIND_PASSWORD",
        label: "Bind Password",
        type: "password",
        placeholder: {
          "non-prod": "••••••••",
          prod: "••••••••",
        },
      },
      {
        key: "USE_SSL",
        label: "Use SSL",
        type: "select",
        defaultValue: "No",
        options: ["Yes", "No"],
        placeholder: {
          "non-prod": "No",
          prod: "No",
        },
      },
    ],
  },
  {
    id: "radiant-logic",
    label: "Radiant Logic",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "ldap://radiant-dev.company.com:2389",
          prod: "ldap://radiant.company.com:2389",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "BASE_DN",
        label: "Base DN",
        type: "text",
        placeholder: {
          "non-prod": "DC=dev,DC=company,DC=com",
          prod: "DC=company,DC=com",
        },
      },
    ],
  },
  {
    id: "cyberark-vault",
    label: "CyberArk Vault",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://cyberark-dev.company.com",
          prod: "https://cyberark.company.com",
        },
      },
      {
        key: "APP_ID",
        label: "App ID",
        type: "text",
        placeholder: {
          "non-prod": "SaviyntDev",
          prod: "SaviyntProd",
        },
      },
      {
        key: "SAFE",
        label: "Safe",
        type: "text",
        placeholder: {
          "non-prod": "SaviyntDevSafe",
          prod: "SaviyntProdSafe",
        },
      },
      {
        key: "OBJECT",
        label: "Object",
        type: "text",
        placeholder: {
          "non-prod": "DevServiceAccount",
          prod: "ProdServiceAccount",
        },
      },
      P_USERNAME,
      P_PASSWORD,
    ],
  },
  {
    id: "ping-identity",
    label: "Ping Identity / PingFederate",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://pingfed-dev.company.com:9031",
          prod: "https://pingfed.company.com:9031",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "GRANT_TYPE",
        label: "Grant Type",
        type: "select",
        defaultValue: "client_credentials",
        options: ["client_credentials", "password"],
        placeholder: {
          "non-prod": "client_credentials",
          prod: "client_credentials",
        },
      },
    ],
  },
  {
    id: "forgerock-ciam",
    label: "ForgeRock (CIAM)",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://am-dev.company.com/openam",
          prod: "https://am.company.com/openam",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "REALM",
        label: "Realm",
        type: "text",
        defaultValue: "/",
        placeholder: {
          "non-prod": "/",
          prod: "/",
        },
      },
    ],
  },
  {
    id: "ibm-db2-jdbc",
    label: "IBM DB2 JDBC",
    params: [
      {
        key: "JDBC_URL",
        label: "JDBC URL",
        type: "url",
        placeholder: {
          "non-prod": "jdbc:db2://db2-dev.company.com:50000/DEVDB",
          prod: "jdbc:db2://db2.company.com:50000/PRODDB",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "DRIVER_CLASS",
        label: "Driver Class",
        type: "text",
        defaultValue: "com.ibm.db2.jcc.DB2Driver",
        placeholder: {
          "non-prod": "com.ibm.db2.jcc.DB2Driver",
          prod: "com.ibm.db2.jcc.DB2Driver",
        },
      },
      {
        ...JDBC_DRIVER_PARAM,
        defaultValue: "IBM DB2 (com.ibm.db2.jcc.DB2Driver)",
      },
    ],
  },
  {
    id: "ibm-as400",
    label: "IBM AS400",
    params: [
      {
        key: "HOSTNAME",
        label: "Hostname",
        type: "text",
        placeholder: {
          "non-prod": "as400-dev.company.com",
          prod: "as400.company.com",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "LIBRARY",
        label: "Library",
        type: "text",
        placeholder: {
          "non-prod": "DEVLIB",
          prod: "PRODLIB",
        },
      },
      {
        key: "PORT",
        label: "Port",
        type: "text",
        defaultValue: "449",
        placeholder: {
          "non-prod": "449",
          prod: "449",
        },
      },
    ],
  },
  {
    id: "ibm-racf",
    label: "IBM RACF",
    params: [
      {
        key: "HOST",
        label: "Host",
        type: "url",
        placeholder: {
          "non-prod": "https://racf-dev.company.com",
          prod: "https://racf.company.com",
        },
      },
      {
        key: "PORT",
        label: "Port",
        type: "text",
        defaultValue: "992",
        placeholder: {
          "non-prod": "992",
          prod: "992",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "USE_TLS",
        label: "Use TLS",
        type: "select",
        defaultValue: "Yes",
        options: ["Yes", "No"],
        placeholder: {
          "non-prod": "Yes",
          prod: "Yes",
        },
      },
    ],
  },
  {
    id: "saviynt-scf",
    label: "Saviynt Connector Framework (SCF)",
    params: [
      {
        key: "ENDPOINT_URL",
        label: "Endpoint URL",
        type: "url",
        placeholder: {
          "non-prod": "https://scf-dev.company.com/api",
          prod: "https://scf.company.com/api",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "CONNECTOR_NAME",
        label: "Connector Name",
        type: "text",
        placeholder: {
          "non-prod": "MyConnector_Dev",
          prod: "MyConnector_Prod",
        },
      },
      {
        key: "VERSION",
        label: "Version (optional)",
        type: "text",
        optional: true,
        placeholder: {
          "non-prod": "1.0",
          prod: "1.0",
        },
      },
    ],
  },
  {
    id: "saviynt-jar-connector",
    label: "Saviynt JAR Connector",
    params: [
      {
        key: "JAR_PATH",
        label: "JAR Path",
        type: "text",
        placeholder: {
          "non-prod": "/opt/saviynt/connectors/dev/connector.jar",
          prod: "/opt/saviynt/connectors/connector.jar",
        },
      },
      {
        key: "CLASSNAME",
        label: "Class Name",
        type: "text",
        placeholder: {
          "non-prod": "com.company.connector.MainConnector",
          prod: "com.company.connector.MainConnector",
        },
      },
      {
        key: "ENDPOINT_URL",
        label: "Endpoint URL",
        type: "url",
        placeholder: {
          "non-prod": "https://target-dev.company.com/api",
          prod: "https://target.company.com/api",
        },
      },
      P_USERNAME,
      P_PASSWORD,
    ],
  },
  {
    id: "unix-linux-ssh",
    label: "Unix / Linux (SSH)",
    params: [
      {
        key: "HOST",
        label: "Host",
        type: "url",
        placeholder: {
          "non-prod": "ssh://linux-dev.company.com",
          prod: "ssh://linux.company.com",
        },
      },
      {
        key: "PORT",
        label: "Port",
        type: "text",
        defaultValue: "22",
        placeholder: {
          "non-prod": "22",
          prod: "22",
        },
      },
      P_USERNAME,
      P_PASSWORD,
      {
        key: "SSH_KEY",
        label: "SSH Key (optional)",
        type: "password",
        optional: true,
        placeholder: {
          "non-prod": "-----BEGIN RSA PRIVATE KEY-----",
          prod: "-----BEGIN RSA PRIVATE KEY-----",
        },
      },
      {
        key: "AUTH_TYPE",
        label: "Auth Type",
        type: "select",
        defaultValue: "Password",
        options: ["Password", "SSH Key"],
        placeholder: {
          "non-prod": "Password",
          prod: "Password",
        },
      },
    ],
  },
  {
    id: "jira-rest-basic",
    label: "Jira REST Basic",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://{org}.atlassian.net [staging]",
          prod: "https://{org}.atlassian.net",
        },
      },
      {
        ...P_USERNAME,
        label: "Username / Email",
      },
      {
        key: "API_TOKEN",
        label: "API Token",
        type: "password",
        placeholder: {
          "non-prod": "staging-api-token",
          prod: "prod-api-token",
        },
      },
    ],
  },
  {
    id: "jira-rest-oauth",
    label: "Jira REST OAuth",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://{org}.atlassian.net [staging]",
          prod: "https://{org}.atlassian.net",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
    ],
  },
  {
    id: "confluence-rest-basic",
    label: "Confluence REST Basic",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://{org}.atlassian.net/wiki [staging]",
          prod: "https://{org}.atlassian.net/wiki",
        },
      },
      {
        ...P_USERNAME,
        label: "Username / Email",
      },
      {
        key: "API_TOKEN",
        label: "API Token",
        type: "password",
        placeholder: {
          "non-prod": "staging-api-token",
          prod: "prod-api-token",
        },
      },
    ],
  },
  {
    id: "confluence-rest-oauth",
    label: "Confluence REST OAuth",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://{org}.atlassian.net/wiki [staging]",
          prod: "https://{org}.atlassian.net/wiki",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
    ],
  },
  {
    id: "zoom-rest-oauth2",
    label: "Zoom REST OAuth2",
    params: [
      {
        key: "ACCOUNT_ID",
        label: "Account ID",
        type: "text",
        placeholder: {
          "non-prod": "zoom-sandbox-acct-id",
          prod: "zoom-prod-acct-id",
        },
      },
      P_CLIENT_ID,
      P_CLIENT_SECRET,
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://api.zoom.us/v2 [sandbox]",
          prod: "https://api.zoom.us/v2",
        },
      },
    ],
  },
  {
    id: "custom-rest",
    label: "Custom REST API",
    params: [
      {
        key: "BASE_URL",
        label: "Base URL",
        type: "url",
        placeholder: {
          "non-prod": "https://staging.api.company.com",
          prod: "https://api.company.com",
        },
      },
      {
        key: "AUTH_TYPE",
        label: "Auth Type",
        type: "select",
        defaultValue: "Basic",
        options: ["Basic", "OAuth2", "API Key", "Bearer Token"],
        placeholder: {
          "non-prod": "Basic",
          prod: "Basic",
        },
      },
      {
        ...P_USERNAME,
        optional: true,
      },
      {
        ...P_PASSWORD,
        optional: true,
      },
    ],
  },
];
const SCHEMAS = {
  "Workday HCM": {
    hasOOTB: true,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "workday-soap"),
      ALL_CONNECTORS.find((c) => c.id === "workday-rest-oauth"),
      ALL_CONNECTORS.find((c) => c.id === "scim-20-generic"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  "Salesforce CRM": {
    hasOOTB: true,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "salesforce-rest-oauth2"),
      ALL_CONNECTORS.find((c) => c.id === "scim-20-generic"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  "ServiceNow ITSM": {
    hasOOTB: true,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "servicenow-rest"),
      ALL_CONNECTORS.find((c) => c.id === "scim-20-generic"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  "GitHub Enterprise": {
    hasOOTB: false,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "github-rest-token"),
      ALL_CONNECTORS.find((c) => c.id === "github-rest-oauth"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  "Oracle ERP": {
    hasOOTB: true,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "oracle-erp-rest"),
      ALL_CONNECTORS.find((c) => c.id === "oracle-erp-jdbc"),
      ALL_CONNECTORS.find((c) => c.id === "oracle-db-jdbc"),
      ALL_CONNECTORS.find((c) => c.id === "oracle-peoplesoft"),
      ALL_CONNECTORS.find((c) => c.id === "oracle-identity-manager"),
      ALL_CONNECTORS.find((c) => c.id === "oracle-unified-directory"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  "AWS IAM": {
    hasOOTB: true,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "aws-iam-sdk"),
      ALL_CONNECTORS.find((c) => c.id === "aws-iam-identity-center"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  "Jira Software": {
    hasOOTB: false,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "jira-rest-basic"),
      ALL_CONNECTORS.find((c) => c.id === "jira-rest-oauth"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  "SharePoint Online": {
    hasOOTB: true,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "sharepoint-graph-api"),
      ALL_CONNECTORS.find((c) => c.id === "microsoft-entra-id"),
      ALL_CONNECTORS.find((c) => c.id === "microsoft-teams"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  "Okta SSO": {
    hasOOTB: true,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "okta-scim-oauth2"),
      ALL_CONNECTORS.find((c) => c.id === "okta-rest-token"),
      ALL_CONNECTORS.find((c) => c.id === "scim-20-generic"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  Confluence: {
    hasOOTB: false,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "confluence-rest-basic"),
      ALL_CONNECTORS.find((c) => c.id === "confluence-rest-oauth"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  "SAP S/4HANA": {
    hasOOTB: true,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "sap-rfc-bapi"),
      ALL_CONNECTORS.find((c) => c.id === "sap-hana-jdbc"),
      ALL_CONNECTORS.find((c) => c.id === "sap-s4hana-rest"),
      ALL_CONNECTORS.find((c) => c.id === "sap-concur-rest"),
      ALL_CONNECTORS.find((c) => c.id === "sap-successfactors-scim"),
      ALL_CONNECTORS.find((c) => c.id === "sap-ias"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
  Zoom: {
    hasOOTB: true,
    connectorTypes: [
      ALL_CONNECTORS.find((c) => c.id === "zoom-rest-oauth2"),
      ALL_CONNECTORS.find((c) => c.id === "scim-20-generic"),
      ALL_CONNECTORS.find((c) => c.id === "custom-rest"),
    ],
  },
};
function getConnectorSchema(appName) {
  return (
    SCHEMAS[appName] ?? {
      hasOOTB: false,
      connectorTypes: ALL_CONNECTORS,
    }
  );
}
export {
  CONNECTOR_CAPABILITIES,
  getConnectorCapability,
  P_USERNAME,
  P_PASSWORD,
  P_CLIENT_ID,
  P_CLIENT_SECRET,
  P_TENANT_ID,
  JDBC_DRIVER_PARAM,
  SAVIYNT_EIC_CONNECTOR,
  ALL_CONNECTORS,
  SCHEMAS,
  getConnectorSchema,
};
