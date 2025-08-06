/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  UserCreate,
  UserLogin,
  UserapiLoginEmail78908Aa9Data,
  UserapiMe35509697Data,
  UserapiSignup02308B8FData,
  UserapiUser99C6D643Data,
  UserapiUsers647A14F4Data,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags userapi
   * @name UserapiMe35509697
   * @summary Me
   * @request GET:/api/me
   * @response `200` `UserapiMe35509697Data` OK
   */
  userapiMe35509697 = (params: RequestParams = {}) =>
    this.request<UserapiMe35509697Data, any>({
      path: `/api/me`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags userapi
   * @name UserapiUsers647A14F4
   * @summary Users
   * @request GET:/api/users
   * @response `200` `UserapiUsers647A14F4Data` OK
   */
  userapiUsers647A14F4 = (params: RequestParams = {}) =>
    this.request<UserapiUsers647A14F4Data, any>({
      path: `/api/users`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags userapi
   * @name UserapiUser99C6D643
   * @summary User
   * @request GET:/api/users/{user_id}
   * @response `200` `UserapiUser99C6D643Data` OK
   */
  userapiUser99C6D643 = (userId: string, params: RequestParams = {}) =>
    this.request<UserapiUser99C6D643Data, any>({
      path: `/api/users/${userId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags userapi
   * @name UserapiLoginEmail78908Aa9
   * @summary Login Email
   * @request POST:/api/user/login
   * @response `200` `UserapiLoginEmail78908Aa9Data` OK
   */
  userapiLoginEmail78908Aa9 = (data: UserLogin, params: RequestParams = {}) =>
    this.request<UserapiLoginEmail78908Aa9Data, any>({
      path: `/api/user/login`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags userapi
   * @name UserapiSignup02308B8F
   * @summary Signup
   * @request POST:/api/user/signup
   * @response `200` `UserapiSignup02308B8FData` OK
   */
  userapiSignup02308B8F = (data: UserCreate, params: RequestParams = {}) =>
    this.request<UserapiSignup02308B8FData, any>({
      path: `/api/user/signup`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
