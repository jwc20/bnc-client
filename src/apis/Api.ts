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

import { BncapiUrlsAddData, BncapiUrlsAddParams } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name BncapiUrlsAdd
   * @summary Add
   * @request GET:/api/add
   * @response `200` `BncapiUrlsAddData` OK
   */
  bncapiUrlsAdd = (query: BncapiUrlsAddParams, params: RequestParams = {}) =>
    this.request<BncapiUrlsAddData, any>({
      path: `/api/add`,
      method: "GET",
      query: query,
      ...params,
    });
}
