/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface MindmapCreateUpdateModel {
  title?: string | null;
  nodes?: MindmapNodeModel[] | null;
  edges?: MindmapEdgeModel[] | null;
}

export interface MindmapEdgeModel {
  id?: string | null;
  source?: string | null;
  target?: string | null;
  type?: string | null;
  style?: any;
}

export interface MindmapNodeModel {
  id?: string | null;
  type?: string | null;
  label?: string | null;
  /** @format double */
  positionX?: number;
  /** @format double */
  positionY?: number;
  style?: any;
}

export interface MindmapResponseModel {
  /** @format uuid */
  id?: string;
  ownerId?: string | null;
  title?: string | null;
  nodes?: MindmapNodeModel[] | null;
  edges?: MindmapEdgeModel[] | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  isArchived?: boolean;
  /** @format int32 */
  order?: number;
}

export interface ProjectCreateModel {
  title?: string | null;
  description?: string | null;
}

export interface ProjectResponseModel {
  /** @format uuid */
  id?: string;
  title?: string | null;
  description?: string | null;
  ownerId?: string | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  isArchived?: boolean;
}

export interface TaskCreateModel {
  title?: string | null;
  description?: string | null;
  /** @format uuid */
  projectId?: string | null;
}

export interface TaskResponseModel {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  projectId?: string | null;
  title?: string | null;
  description?: string | null;
  /** @format date-time */
  dueDate?: string | null;
  status?: string | null;
  ownerId?: string | null;
  isArchived?: boolean;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  project?: ProjectResponseModel;
}

export interface WorkLogCreateUpdateModel {
  /** @format uuid */
  taskItemId?: string | null;
  /** @format date-time */
  fromTime?: string;
  /** @format date-time */
  toTime?: string | null;
  title?: string | null;
  /** @format uuid */
  projectId?: string | null;
}

export interface WorkLogResponseModel {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  taskItemId?: string;
  /** @format date-time */
  fromTime?: string;
  /** @format date-time */
  toTime?: string;
  /** @format int32 */
  percentCompleteAfter?: number | null;
  taskItem?: TaskResponseModel;
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Task Manager Service API
 * @version v1
 *
 * API for user authentication
 */
export class Api<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  home = {
    /**
     * No description
     *
     * @tags Home
     * @name GetRoot
     * @request GET:/
     * @secure
     */
    getRoot: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  mindmaps = {
    /**
     * No description
     *
     * @tags Mindmaps
     * @name CreateMindmap
     * @request POST:/api/Mindmaps
     * @secure
     */
    createMindmap: (data: MindmapCreateUpdateModel, params: RequestParams = {}) =>
      this.http.request<MindmapResponseModel, any>({
        path: `/api/Mindmaps`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Mindmaps
     * @name GetAllMindmaps
     * @request GET:/api/Mindmaps
     * @secure
     */
    getAllMindmaps: (
      query?: {
        /** @default false */
        isArchived?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<MindmapResponseModel[], any>({
        path: `/api/Mindmaps`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Mindmaps
     * @name GetMindmapById
     * @request GET:/api/Mindmaps/{id}
     * @secure
     */
    getMindmapById: (id: string, params: RequestParams = {}) =>
      this.http.request<MindmapResponseModel, any>({
        path: `/api/Mindmaps/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Mindmaps
     * @name UpdateMindmap
     * @request PUT:/api/Mindmaps/{id}
     * @secure
     */
    updateMindmap: (id: string, data: MindmapCreateUpdateModel, params: RequestParams = {}) =>
      this.http.request<MindmapResponseModel, any>({
        path: `/api/Mindmaps/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Mindmaps
     * @name DeleteMindmapById
     * @request DELETE:/api/Mindmaps/{id}
     * @secure
     */
    deleteMindmapById: (id: string, params: RequestParams = {}) =>
      this.http.request<boolean, any>({
        path: `/api/Mindmaps/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  projects = {
    /**
     * No description
     *
     * @tags Projects
     * @name GetAllProjects
     * @request GET:/api/Projects
     * @secure
     */
    getAllProjects: (
      query?: {
        searchText?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ProjectResponseModel[], any>({
        path: `/api/Projects`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name CreateProject
     * @request POST:/api/Projects
     * @secure
     */
    createProject: (data: ProjectCreateModel, params: RequestParams = {}) =>
      this.http.request<ProjectResponseModel, any>({
        path: `/api/Projects`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name GetProjectById
     * @request GET:/api/Projects/{projectId}
     * @secure
     */
    getProjectById: (projectId: string, params: RequestParams = {}) =>
      this.http.request<ProjectResponseModel, any>({
        path: `/api/Projects/${projectId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name UpdateProject
     * @request PUT:/api/Projects/{projectId}
     * @secure
     */
    updateProject: (projectId: string, data: ProjectCreateModel, params: RequestParams = {}) =>
      this.http.request<ProjectResponseModel, any>({
        path: `/api/Projects/${projectId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ArchiveProject
     * @request PUT:/api/Projects/{projectId}/archive
     * @secure
     */
    archiveProject: (projectId: string, params: RequestParams = {}) =>
      this.http.request<ProjectResponseModel, any>({
        path: `/api/Projects/${projectId}/archive`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  tasks = {
    /**
     * No description
     *
     * @tags Tasks
     * @name GetAllTasks
     * @request GET:/api/Tasks
     * @secure
     */
    getAllTasks: (
      query?: {
        searchText?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<TaskResponseModel[], any>({
        path: `/api/Tasks`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tasks
     * @name CreateTask
     * @request POST:/api/Tasks
     * @secure
     */
    createTask: (data: TaskCreateModel, params: RequestParams = {}) =>
      this.http.request<TaskResponseModel, any>({
        path: `/api/Tasks`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tasks
     * @name GetTaskById
     * @request GET:/api/Tasks/{taskItemId}
     * @secure
     */
    getTaskById: (taskItemId: string, params: RequestParams = {}) =>
      this.http.request<TaskResponseModel, any>({
        path: `/api/Tasks/${taskItemId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tasks
     * @name GetTotalTasksCount
     * @request GET:/api/Tasks/count
     * @secure
     */
    getTotalTasksCount: (params: RequestParams = {}) =>
      this.http.request<number, any>({
        path: `/api/Tasks/count`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  workLogs = {
    /**
     * No description
     *
     * @tags WorkLogs
     * @name GetAllWorkLogs
     * @request GET:/api/WorkLogs
     * @secure
     */
    getAllWorkLogs: (
      query?: {
        /** @format date-time */
        from?: string;
        /** @format date-time */
        to?: string;
        /** @default false */
        isArchived?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<WorkLogResponseModel[], any>({
        path: `/api/WorkLogs`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WorkLogs
     * @name CreateWorkLog
     * @request POST:/api/WorkLogs
     * @secure
     */
    createWorkLog: (data: WorkLogCreateUpdateModel, params: RequestParams = {}) =>
      this.http.request<WorkLogResponseModel, any>({
        path: `/api/WorkLogs`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WorkLogs
     * @name UpdateWorkLog
     * @request PUT:/api/WorkLogs/{workLogId}
     * @secure
     */
    updateWorkLog: (workLogId: string, data: WorkLogCreateUpdateModel, params: RequestParams = {}) =>
      this.http.request<WorkLogResponseModel, any>({
        path: `/api/WorkLogs/${workLogId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WorkLogs
     * @name GetWorkLogById
     * @request GET:/api/WorkLogs/{workLogId}
     * @secure
     */
    getWorkLogById: (workLogId: string, params: RequestParams = {}) =>
      this.http.request<WorkLogResponseModel, any>({
        path: `/api/WorkLogs/${workLogId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WorkLogs
     * @name GetWorkLogSummary
     * @request GET:/api/WorkLogs/summary
     * @secure
     */
    getWorkLogSummary: (
      query?: {
        /** @format date-time */
        from?: string;
        /** @format date-time */
        to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<WorkLogSummaryModel, any>({
        path: `/api/WorkLogs/summary`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
}

export interface WorkLogSummaryModel {
    totalHours?: number;
    // Add other summary properties here, e.g., count of worklogs, average duration, etc.
}
