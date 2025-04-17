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

export interface NoteCreateUpdateModel {
  /** @format uuid */
  id?: string;
  title?: string | null;
  content?: string | null;
}

export interface NoteResponseModel {
  /** @format uuid */
  id?: string;
  title?: string | null;
  content?: string | null;
  color?: string | null;
  pinned?: boolean;
  /** @format int32 */
  order?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface UpdateNoteOrderModel {
  order?: string[] | null;
  pinned?: boolean;
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
 * API for user authentication using Firebase and JWT
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
  notes = {
    /**
     * No description
     *
     * @tags Notes
     * @name CreateNote
     * @request POST:/api/Notes
     * @secure
     */
    createNote: (data: NoteCreateUpdateModel, params: RequestParams = {}) =>
      this.http.request<NoteResponseModel, any>({
        path: `/api/Notes`,
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
     * @tags Notes
     * @name GetAllNotes
     * @request GET:/api/Notes
     * @secure
     */
    getAllNotes: (
      query?: {
        /** @default false */
        isArchived?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<NoteResponseModel[], any>({
        path: `/api/Notes`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notes
     * @name UpdateNoteOrder
     * @request PUT:/api/Notes
     * @secure
     */
    updateNoteOrder: (data: UpdateNoteOrderModel, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/api/Notes`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notes
     * @name GetNoteById
     * @request GET:/api/Notes/{id}
     * @secure
     */
    getNoteById: (id: string, params: RequestParams = {}) =>
      this.http.request<NoteResponseModel, any>({
        path: `/api/Notes/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notes
     * @name DeleteNoteById
     * @request DELETE:/api/Notes/{id}
     * @secure
     */
    deleteNoteById: (id: string, params: RequestParams = {}) =>
      this.http.request<boolean, any>({
        path: `/api/Notes/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notes
     * @name UpdateNote
     * @request PUT:/api/Notes/{id}
     * @secure
     */
    updateNote: (id: string, data: NoteCreateUpdateModel, params: RequestParams = {}) =>
      this.http.request<NoteResponseModel, any>({
        path: `/api/Notes/${id}`,
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
     * @tags Notes
     * @name PinOrUnpinNote
     * @request PATCH:/api/Notes/{id}/pin
     * @secure
     */
    pinOrUnpinNote: (id: string, data: boolean, params: RequestParams = {}) =>
      this.http.request<NoteResponseModel, any>({
        path: `/api/Notes/${id}/pin`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notes
     * @name UpdateNoteColor
     * @request PATCH:/api/Notes/{id}/color
     * @secure
     */
    updateNoteColor: (id: string, data: string, params: RequestParams = {}) =>
      this.http.request<NoteResponseModel, any>({
        path: `/api/Notes/${id}/color`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
