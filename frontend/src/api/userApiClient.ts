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

export interface BitbucketSettingsViewModel {
  username?: string | null;
  appPassword?: string | null;
  workspace?: string | null;
  repositorySlug?: string | null;
}

export interface JiraSettingsViewModel {
  name?: string | null;
  apiToken?: string | null;
  atlassianEmailAddress?: string | null;
  jiraCloudDomain?: string | null;
}

export interface Product {
  /** @format uuid */
  id?: string;
  /** @minLength 1 */
  name: string;
  userProducts?: UserProduct[] | null;
  roles?: Role[] | null;
}

export interface Role {
  /** @format uuid */
  id?: string;
  /** @minLength 1 */
  name: string;
  /** @format uuid */
  productId: string;
  product?: Product;
}

export interface User {
  id?: string | null;
  /** @minLength 1 */
  email: string;
  displayName?: string | null;
  userProducts?: UserProduct[] | null;
  userSettings?: UserSetting[] | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
}

export interface UserProduct {
  /** @format uuid */
  id?: string;
  /** @minLength 1 */
  userId: string;
  user?: User;
  /** @format uuid */
  productId: string;
  product?: Product;
  userRoles?: UserRole[] | null;
}

export interface UserRole {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  userProductId: string;
  userProduct?: UserProduct;
  /** @format uuid */
  roleId: string;
  role?: Role;
}

export interface UserSetting {
  /** @format uuid */
  id?: string;
  /** @minLength 1 */
  userId: string;
  user?: User;
  type: UserSettingType;
  /** @minLength 1 */
  name: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
}

/** @format int32 */
export enum UserSettingType {
  Value100 = 100,
  Value101 = 101,
}

export interface UserSettingsDetailModel {
  /** @format uuid */
  settingId?: string;
  settingName: string;
  settingTypeName: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt?: string | null;
  settingTypeId: UserSettingType;
  
  // Jira specific fields
  atlassianEmailAddress: string;
  jiraCloudDomain: string;
  
  // Bitbucket specific fields
  username: string;
  workspace: string;
  repositorySlug: string;
}

export interface UserSettingsModel {
  /** @format uuid */
  settingId?: string;
  settingName?: string | null;
  settingTypeName?: string | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  settingTypeId?: UserSettingType;
  
  // Jira specific fields
  atlassianEmailAddress?: string | null;
  jiraCloudDomain?: string | null;
  
  // Bitbucket specific fields
  username?: string | null;
  workspace?: string | null;
  repositorySlug?: string | null;
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
 * @title User Service API
 * @version v1
 *
 * API for user authentication
 */
export class Api<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name VerifyUser
     * @request POST:/api/auth/verify-user
     * @secure
     */
    verifyUser: (params: RequestParams = {}) =>
      this.http.request<User, any>({
        path: `/api/auth/verify-user`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
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
  userSettings = {
    /**
     * No description
     *
     * @tags UserSettings
     * @name GetUserSettings
     * @request GET:/api/user-settings
     * @secure
     */
    getUserSettings: (params: RequestParams = {}) =>
      this.http.request<UserSettingsModel[], any>({
        path: `/api/user-settings`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserSettings
     * @name GetUserSettingsById
     * @request GET:/api/user-settings/{settingsId}
     * @secure
     */
    getUserSettingsById: (settingsId: string, params: RequestParams = {}) =>
      this.http.request<UserSettingsDetailModel, any>({
        path: `/api/user-settings/${settingsId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserSettings
     * @name CreateJiraSettings
     * @request POST:/api/user-settings/jira
     * @secure
     */
    createJiraSettings: (data: JiraSettingsViewModel, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/user-settings/jira`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserSettings
     * @name UpdateJiraSettings
     * @request PUT:/api/user-settings/jira/{settingsId}
     * @secure
     */
    updateJiraSettings: (settingsId: string, data: JiraSettingsViewModel, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/user-settings/jira/${settingsId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserSettings
     * @name CreateBitbucketSettings
     * @request POST:/api/user-settings/bitbucket
     * @secure
     */
    createBitbucketSettings: (data: BitbucketSettingsViewModel, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/user-settings/bitbucket`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserSettings
     * @name UpdateBitbucketSettings
     * @request PUT:/api/user-settings/bitbucket/{settingsId}
     * @secure
     */
    updateBitbucketSettings: (settingsId: string, data: BitbucketSettingsViewModel, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/user-settings/bitbucket/${settingsId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
