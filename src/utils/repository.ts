import axios, { AxiosPromise } from 'axios';

export interface IResource {
  list: (queryObj?: any, headers?: any) => Promise<AxiosPromise<any>>;
  getOne: (id: string | number, headers?: any) => Promise<AxiosPromise<any>>;
  update: (id: string | number, payload: any, headers?: any) => Promise<AxiosPromise<any>>;
  create: (payload: any, headers?: any) => Promise<AxiosPromise<any>>;
  destroy: (id: string | number, headers?: any) => Promise<AxiosPromise<any>>;
}

export interface IResourcesObject {
  [key: string]: IResource;
}

export const processRemoteResources = (resource: string, baseURL: string, commonHeaders: any = {}): IResource => {
  const config = { baseURL };
  return {
    create: (payload: any, headers: any = {}) =>
      axios.post(`/${resource}`, payload, {
        ...config,
        headers: { ...commonHeaders, ...headers },
      }),
    destroy: (id: string | number, headers: any = {}) =>
      axios.delete(`/${resource}/${id}`, {
        ...config,
        headers: { ...commonHeaders, ...headers },
      }),
    getOne: (id: string | number, headers: any = {}) =>
      axios.get(`/${resource}/${id}`, {
        ...config,
        headers: { ...commonHeaders, ...headers },
      }),
    list: (queryObj: any = {}, headers: any = {}) =>
      axios.get(`/${resource}`, {
        ...config,
        headers: { ...commonHeaders, ...headers },
        params: queryObj,
      }),
    update: (id: string | number, payload: any, headers: any = {}) =>
      axios.put(`/${resource}/${id}`, payload, {
        ...config,
        headers: { ...commonHeaders, ...headers },
      }),
  };
};

export const getResources = (
  resourceNames: string[],
  baseURL: string = 'http://localhost:8080/api',
  commonHeaders: any = {},
  resourceProcessor: (resource: string, baseURL: string, commonHeaders?: any) => any = processRemoteResources,
): IResourcesObject => {
  const resources: any = {};
  resourceNames.forEach(resourceName => {
    resources[resourceName] = resourceProcessor(resourceName, baseURL, commonHeaders);
  });
  return resources;
};

export default getResources;
