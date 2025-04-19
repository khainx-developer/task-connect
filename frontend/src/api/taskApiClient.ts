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

export interface AggregateException {
  targetSite?: MethodBase;
  data?: Record<string, any>;
  innerException?: Exception;
  helpLink?: string | null;
  source?: string | null;
  /** @format int32 */
  hResult?: number;
  stackTrace?: string | null;
  innerExceptions?: Exception[] | null;
  message?: string | null;
}

export interface Assembly {
  definedTypes?: TypeInfo[] | null;
  exportedTypes?: Type[] | null;
  /** @deprecated */
  codeBase?: string | null;
  entryPoint?: MethodInfo;
  fullName?: string | null;
  imageRuntimeVersion?: string | null;
  isDynamic?: boolean;
  location?: string | null;
  reflectionOnly?: boolean;
  isCollectible?: boolean;
  isFullyTrusted?: boolean;
  customAttributes?: CustomAttributeData[] | null;
  /** @deprecated */
  escapedCodeBase?: string | null;
  manifestModule?: Module;
  modules?: Module[] | null;
  /** @deprecated */
  globalAssemblyCache?: boolean;
  /** @format int64 */
  hostContext?: number;
  securityRuleSet?: SecurityRuleSet;
}

/** @format int32 */
export enum CallingConventions {
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value32 = 32,
  Value64 = 64,
}

export interface ConstructorInfo {
  name?: string | null;
  declaringType?: Type;
  reflectedType?: Type;
  module?: Module;
  customAttributes?: CustomAttributeData[] | null;
  isCollectible?: boolean;
  /** @format int32 */
  metadataToken?: number;
  attributes?: MethodAttributes;
  methodImplementationFlags?: MethodImplAttributes;
  callingConvention?: CallingConventions;
  isAbstract?: boolean;
  isConstructor?: boolean;
  isFinal?: boolean;
  isHideBySig?: boolean;
  isSpecialName?: boolean;
  isStatic?: boolean;
  isVirtual?: boolean;
  isAssembly?: boolean;
  isFamily?: boolean;
  isFamilyAndAssembly?: boolean;
  isFamilyOrAssembly?: boolean;
  isPrivate?: boolean;
  isPublic?: boolean;
  isConstructedGenericMethod?: boolean;
  isGenericMethod?: boolean;
  isGenericMethodDefinition?: boolean;
  containsGenericParameters?: boolean;
  methodHandle?: RuntimeMethodHandle;
  isSecurityCritical?: boolean;
  isSecuritySafeCritical?: boolean;
  isSecurityTransparent?: boolean;
  memberType?: MemberTypes;
}

export interface CustomAttributeData {
  attributeType?: Type;
  constructor?: ConstructorInfo;
  constructorArguments?: CustomAttributeTypedArgument[] | null;
  namedArguments?: CustomAttributeNamedArgument[] | null;
}

export interface CustomAttributeNamedArgument {
  memberInfo?: MemberInfo;
  typedValue?: CustomAttributeTypedArgument;
  memberName?: string | null;
  isField?: boolean;
}

export interface CustomAttributeTypedArgument {
  argumentType?: Type;
  value?: any;
}

/** @format int32 */
export enum EventAttributes {
  Value0 = 0,
  Value512 = 512,
  Value1024 = 1024,
}

export interface EventInfo {
  name?: string | null;
  declaringType?: Type;
  reflectedType?: Type;
  module?: Module;
  customAttributes?: CustomAttributeData[] | null;
  isCollectible?: boolean;
  /** @format int32 */
  metadataToken?: number;
  memberType?: MemberTypes;
  attributes?: EventAttributes;
  isSpecialName?: boolean;
  addMethod?: MethodInfo;
  removeMethod?: MethodInfo;
  raiseMethod?: MethodInfo;
  isMulticast?: boolean;
  eventHandlerType?: Type;
}

export interface Exception {
  targetSite?: MethodBase;
  message?: string | null;
  data?: Record<string, any>;
  innerException?: Exception;
  helpLink?: string | null;
  source?: string | null;
  /** @format int32 */
  hResult?: number;
  stackTrace?: string | null;
}

/** @format int32 */
export enum FieldAttributes {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value5 = 5,
  Value6 = 6,
  Value7 = 7,
  Value16 = 16,
  Value32 = 32,
  Value64 = 64,
  Value128 = 128,
  Value256 = 256,
  Value512 = 512,
  Value1024 = 1024,
  Value4096 = 4096,
  Value8192 = 8192,
  Value32768 = 32768,
  Value38144 = 38144,
}

export interface FieldInfo {
  name?: string | null;
  declaringType?: Type;
  reflectedType?: Type;
  module?: Module;
  customAttributes?: CustomAttributeData[] | null;
  isCollectible?: boolean;
  /** @format int32 */
  metadataToken?: number;
  memberType?: MemberTypes;
  attributes?: FieldAttributes;
  fieldType?: Type;
  isInitOnly?: boolean;
  isLiteral?: boolean;
  /** @deprecated */
  isNotSerialized?: boolean;
  isPinvokeImpl?: boolean;
  isSpecialName?: boolean;
  isStatic?: boolean;
  isAssembly?: boolean;
  isFamily?: boolean;
  isFamilyAndAssembly?: boolean;
  isFamilyOrAssembly?: boolean;
  isPrivate?: boolean;
  isPublic?: boolean;
  isSecurityCritical?: boolean;
  isSecuritySafeCritical?: boolean;
  isSecurityTransparent?: boolean;
  fieldHandle?: RuntimeFieldHandle;
}

/** @format int32 */
export enum GenericParameterAttributes {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value8 = 8,
  Value16 = 16,
  Value28 = 28,
}

export type ICustomAttributeProvider = object;

export type IntPtr = object;

/** @format int32 */
export enum LayoutKind {
  Value0 = 0,
  Value2 = 2,
  Value3 = 3,
}

export interface MemberInfo {
  memberType?: MemberTypes;
  name?: string | null;
  declaringType?: Type;
  reflectedType?: Type;
  module?: Module;
  customAttributes?: CustomAttributeData[] | null;
  isCollectible?: boolean;
  /** @format int32 */
  metadataToken?: number;
}

/** @format int32 */
export enum MemberTypes {
  Value1 = 1,
  Value2 = 2,
  Value4 = 4,
  Value8 = 8,
  Value16 = 16,
  Value32 = 32,
  Value64 = 64,
  Value128 = 128,
  Value191 = 191,
}

/** @format int32 */
export enum MethodAttributes {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value5 = 5,
  Value6 = 6,
  Value7 = 7,
  Value8 = 8,
  Value16 = 16,
  Value32 = 32,
  Value64 = 64,
  Value128 = 128,
  Value256 = 256,
  Value512 = 512,
  Value1024 = 1024,
  Value2048 = 2048,
  Value4096 = 4096,
  Value8192 = 8192,
  Value16384 = 16384,
  Value32768 = 32768,
  Value53248 = 53248,
}

export interface MethodBase {
  memberType?: MemberTypes;
  name?: string | null;
  declaringType?: Type;
  reflectedType?: Type;
  module?: Module;
  customAttributes?: CustomAttributeData[] | null;
  isCollectible?: boolean;
  /** @format int32 */
  metadataToken?: number;
  attributes?: MethodAttributes;
  methodImplementationFlags?: MethodImplAttributes;
  callingConvention?: CallingConventions;
  isAbstract?: boolean;
  isConstructor?: boolean;
  isFinal?: boolean;
  isHideBySig?: boolean;
  isSpecialName?: boolean;
  isStatic?: boolean;
  isVirtual?: boolean;
  isAssembly?: boolean;
  isFamily?: boolean;
  isFamilyAndAssembly?: boolean;
  isFamilyOrAssembly?: boolean;
  isPrivate?: boolean;
  isPublic?: boolean;
  isConstructedGenericMethod?: boolean;
  isGenericMethod?: boolean;
  isGenericMethodDefinition?: boolean;
  containsGenericParameters?: boolean;
  methodHandle?: RuntimeMethodHandle;
  isSecurityCritical?: boolean;
  isSecuritySafeCritical?: boolean;
  isSecurityTransparent?: boolean;
}

/** @format int32 */
export enum MethodImplAttributes {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value8 = 8,
  Value16 = 16,
  Value32 = 32,
  Value64 = 64,
  Value128 = 128,
  Value256 = 256,
  Value512 = 512,
  Value4096 = 4096,
  Value65535 = 65535,
}

export interface MethodInfo {
  name?: string | null;
  declaringType?: Type;
  reflectedType?: Type;
  module?: Module;
  customAttributes?: CustomAttributeData[] | null;
  isCollectible?: boolean;
  /** @format int32 */
  metadataToken?: number;
  attributes?: MethodAttributes;
  methodImplementationFlags?: MethodImplAttributes;
  callingConvention?: CallingConventions;
  isAbstract?: boolean;
  isConstructor?: boolean;
  isFinal?: boolean;
  isHideBySig?: boolean;
  isSpecialName?: boolean;
  isStatic?: boolean;
  isVirtual?: boolean;
  isAssembly?: boolean;
  isFamily?: boolean;
  isFamilyAndAssembly?: boolean;
  isFamilyOrAssembly?: boolean;
  isPrivate?: boolean;
  isPublic?: boolean;
  isConstructedGenericMethod?: boolean;
  isGenericMethod?: boolean;
  isGenericMethodDefinition?: boolean;
  containsGenericParameters?: boolean;
  methodHandle?: RuntimeMethodHandle;
  isSecurityCritical?: boolean;
  isSecuritySafeCritical?: boolean;
  isSecurityTransparent?: boolean;
  memberType?: MemberTypes;
  returnParameter?: ParameterInfo;
  returnType?: Type;
  returnTypeCustomAttributes?: ICustomAttributeProvider;
}

export interface Module {
  assembly?: Assembly;
  fullyQualifiedName?: string | null;
  name?: string | null;
  /** @format int32 */
  mdStreamVersion?: number;
  /** @format uuid */
  moduleVersionId?: string;
  scopeName?: string | null;
  moduleHandle?: ModuleHandle;
  customAttributes?: CustomAttributeData[] | null;
  /** @format int32 */
  metadataToken?: number;
}

export interface ModuleHandle {
  /** @format int32 */
  mdStreamVersion?: number;
}

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
  updatedAt?: string | null;
}

/** @format int32 */
export enum ParameterAttributes {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value4 = 4,
  Value8 = 8,
  Value16 = 16,
  Value4096 = 4096,
  Value8192 = 8192,
  Value16384 = 16384,
  Value32768 = 32768,
  Value61440 = 61440,
}

export interface ParameterInfo {
  attributes?: ParameterAttributes;
  member?: MemberInfo;
  name?: string | null;
  parameterType?: Type;
  /** @format int32 */
  position?: number;
  isIn?: boolean;
  isLcid?: boolean;
  isOptional?: boolean;
  isOut?: boolean;
  isRetval?: boolean;
  defaultValue?: any;
  rawDefaultValue?: any;
  hasDefaultValue?: boolean;
  customAttributes?: CustomAttributeData[] | null;
  /** @format int32 */
  metadataToken?: number;
}

export interface ProjectCreateModel {
  title?: string | null;
  description?: string | null;
}

export interface ProjectResponseModel {
  /** @format uuid */
  id?: string;
  name?: string | null;
  description?: string | null;
  ownerId?: string | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string | null;
  tasks?: Task[] | null;
  isArchived?: boolean;
}

/** @format int32 */
export enum PropertyAttributes {
  Value0 = 0,
  Value512 = 512,
  Value1024 = 1024,
  Value4096 = 4096,
  Value8192 = 8192,
  Value16384 = 16384,
  Value32768 = 32768,
  Value62464 = 62464,
}

export interface PropertyInfo {
  name?: string | null;
  declaringType?: Type;
  reflectedType?: Type;
  module?: Module;
  customAttributes?: CustomAttributeData[] | null;
  isCollectible?: boolean;
  /** @format int32 */
  metadataToken?: number;
  memberType?: MemberTypes;
  propertyType?: Type;
  attributes?: PropertyAttributes;
  isSpecialName?: boolean;
  canRead?: boolean;
  canWrite?: boolean;
  getMethod?: MethodInfo;
  setMethod?: MethodInfo;
}

export interface RuntimeFieldHandle {
  value?: IntPtr;
}

export interface RuntimeMethodHandle {
  value?: IntPtr;
}

export interface RuntimeTypeHandle {
  value?: IntPtr;
}

/** @format int32 */
export enum SecurityRuleSet {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
}

export interface StructLayoutAttribute {
  typeId?: any;
  value?: LayoutKind;
}

export interface Task {
  /** @format int32 */
  id?: number;
  exception?: AggregateException;
  status?: TaskStatus;
  isCanceled?: boolean;
  isCompleted?: boolean;
  isCompletedSuccessfully?: boolean;
  creationOptions?: TaskCreationOptions;
  asyncState?: any;
  isFaulted?: boolean;
}

export interface TaskCreateModel {
  title?: string | null;
  description?: string | null;
  /** @format uuid */
  projectId?: string | null;
}

/** @format int32 */
export enum TaskCreationOptions {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value4 = 4,
  Value8 = 8,
  Value16 = 16,
  Value64 = 64,
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

/** @format int32 */
export enum TaskStatus {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value5 = 5,
  Value6 = 6,
  Value7 = 7,
}

export interface Type {
  name?: string | null;
  customAttributes?: CustomAttributeData[] | null;
  isCollectible?: boolean;
  /** @format int32 */
  metadataToken?: number;
  isInterface?: boolean;
  memberType?: MemberTypes;
  namespace?: string | null;
  assemblyQualifiedName?: string | null;
  fullName?: string | null;
  assembly?: Assembly;
  module?: Module;
  isNested?: boolean;
  declaringType?: Type;
  declaringMethod?: MethodBase;
  reflectedType?: Type;
  underlyingSystemType?: Type;
  isTypeDefinition?: boolean;
  isArray?: boolean;
  isByRef?: boolean;
  isPointer?: boolean;
  isConstructedGenericType?: boolean;
  isGenericParameter?: boolean;
  isGenericTypeParameter?: boolean;
  isGenericMethodParameter?: boolean;
  isGenericType?: boolean;
  isGenericTypeDefinition?: boolean;
  isSZArray?: boolean;
  isVariableBoundArray?: boolean;
  isByRefLike?: boolean;
  isFunctionPointer?: boolean;
  isUnmanagedFunctionPointer?: boolean;
  hasElementType?: boolean;
  genericTypeArguments?: Type[] | null;
  /** @format int32 */
  genericParameterPosition?: number;
  genericParameterAttributes?: GenericParameterAttributes;
  attributes?: TypeAttributes;
  isAbstract?: boolean;
  isImport?: boolean;
  isSealed?: boolean;
  isSpecialName?: boolean;
  isClass?: boolean;
  isNestedAssembly?: boolean;
  isNestedFamANDAssem?: boolean;
  isNestedFamily?: boolean;
  isNestedFamORAssem?: boolean;
  isNestedPrivate?: boolean;
  isNestedPublic?: boolean;
  isNotPublic?: boolean;
  isPublic?: boolean;
  isAutoLayout?: boolean;
  isExplicitLayout?: boolean;
  isLayoutSequential?: boolean;
  isAnsiClass?: boolean;
  isAutoClass?: boolean;
  isUnicodeClass?: boolean;
  isCOMObject?: boolean;
  isContextful?: boolean;
  isEnum?: boolean;
  isMarshalByRef?: boolean;
  isPrimitive?: boolean;
  isValueType?: boolean;
  isSignatureType?: boolean;
  isSecurityCritical?: boolean;
  isSecuritySafeCritical?: boolean;
  isSecurityTransparent?: boolean;
  structLayoutAttribute?: StructLayoutAttribute;
  typeInitializer?: ConstructorInfo;
  typeHandle?: RuntimeTypeHandle;
  /** @format uuid */
  guid?: string;
  baseType?: Type;
  /** @deprecated */
  isSerializable?: boolean;
  containsGenericParameters?: boolean;
  isVisible?: boolean;
}

/** @format int32 */
export enum TypeAttributes {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value5 = 5,
  Value6 = 6,
  Value7 = 7,
  Value8 = 8,
  Value16 = 16,
  Value24 = 24,
  Value32 = 32,
  Value128 = 128,
  Value256 = 256,
  Value1024 = 1024,
  Value2048 = 2048,
  Value4096 = 4096,
  Value8192 = 8192,
  Value16384 = 16384,
  Value65536 = 65536,
  Value131072 = 131072,
  Value196608 = 196608,
  Value262144 = 262144,
  Value264192 = 264192,
  Value1048576 = 1048576,
  Value12582912 = 12582912,
}

export interface TypeInfo {
  name?: string | null;
  customAttributes?: CustomAttributeData[] | null;
  isCollectible?: boolean;
  /** @format int32 */
  metadataToken?: number;
  isInterface?: boolean;
  memberType?: MemberTypes;
  namespace?: string | null;
  assemblyQualifiedName?: string | null;
  fullName?: string | null;
  assembly?: Assembly;
  module?: Module;
  isNested?: boolean;
  declaringType?: Type;
  declaringMethod?: MethodBase;
  reflectedType?: Type;
  underlyingSystemType?: Type;
  isTypeDefinition?: boolean;
  isArray?: boolean;
  isByRef?: boolean;
  isPointer?: boolean;
  isConstructedGenericType?: boolean;
  isGenericParameter?: boolean;
  isGenericTypeParameter?: boolean;
  isGenericMethodParameter?: boolean;
  isGenericType?: boolean;
  isGenericTypeDefinition?: boolean;
  isSZArray?: boolean;
  isVariableBoundArray?: boolean;
  isByRefLike?: boolean;
  isFunctionPointer?: boolean;
  isUnmanagedFunctionPointer?: boolean;
  hasElementType?: boolean;
  genericTypeArguments?: Type[] | null;
  /** @format int32 */
  genericParameterPosition?: number;
  genericParameterAttributes?: GenericParameterAttributes;
  attributes?: TypeAttributes;
  isAbstract?: boolean;
  isImport?: boolean;
  isSealed?: boolean;
  isSpecialName?: boolean;
  isClass?: boolean;
  isNestedAssembly?: boolean;
  isNestedFamANDAssem?: boolean;
  isNestedFamily?: boolean;
  isNestedFamORAssem?: boolean;
  isNestedPrivate?: boolean;
  isNestedPublic?: boolean;
  isNotPublic?: boolean;
  isPublic?: boolean;
  isAutoLayout?: boolean;
  isExplicitLayout?: boolean;
  isLayoutSequential?: boolean;
  isAnsiClass?: boolean;
  isAutoClass?: boolean;
  isUnicodeClass?: boolean;
  isCOMObject?: boolean;
  isContextful?: boolean;
  isEnum?: boolean;
  isMarshalByRef?: boolean;
  isPrimitive?: boolean;
  isValueType?: boolean;
  isSignatureType?: boolean;
  isSecurityCritical?: boolean;
  isSecuritySafeCritical?: boolean;
  isSecurityTransparent?: boolean;
  structLayoutAttribute?: StructLayoutAttribute;
  typeInitializer?: ConstructorInfo;
  typeHandle?: RuntimeTypeHandle;
  /** @format uuid */
  guid?: string;
  baseType?: Type;
  /** @deprecated */
  isSerializable?: boolean;
  containsGenericParameters?: boolean;
  isVisible?: boolean;
  genericTypeParameters?: Type[] | null;
  declaredConstructors?: ConstructorInfo[] | null;
  declaredEvents?: EventInfo[] | null;
  declaredFields?: FieldInfo[] | null;
  declaredMembers?: MemberInfo[] | null;
  declaredMethods?: MethodInfo[] | null;
  declaredNestedTypes?: TypeInfo[] | null;
  declaredProperties?: PropertyInfo[] | null;
  implementedInterfaces?: Type[] | null;
}

export interface UpdateNoteOrderModel {
  order?: string[] | null;
  pinned?: boolean;
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
  taskId?: string;
  /** @format date-time */
  fromTime?: string;
  /** @format date-time */
  toTime?: string;
  /** @format int32 */
  percentCompleteAfter?: number | null;
  note?: string | null;
  task?: TaskResponseModel;
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
      this.http.request<WorkLogResponseModel[], any>({
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
  };
}
