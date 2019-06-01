import axios from "axios";

export const processRemoteResources = (resource: string, baseURL: string) => {
  const config = { baseURL };
  return {
    list: (queryObj = {}) =>
      axios.get(`/${resource}/`, { ...config, params: queryObj }),
    getOne: (id: string | number) => axios.get(`/${resource}/${id}/`, config),
    update: (id: string | number, payload: any) => axios.put(`/${resource}/${id}/`, payload, config),
    create: (payload: any) => axios.post(`/${resource}/`, payload, config),
    destroy: (id: string | number) => axios.delete(`/${resource}/${id}/`, config)
  };
};

export const getResources = (
  resourceNames: string[],
  baseURL: string = "http://localhost:8080/api",
  resourceProcessor: Function = processRemoteResources
) => {
  const resources: any = {};
  resourceNames.forEach((resourceName) => {
    resources[resourceName] = resourceProcessor(resourceName, baseURL);
  });
  return resources;
};

export default getResources;
