import axios from "axios";

import getResources, {
  processRemoteResources
} from "../../utils/repository";

jest.mock("axios");

describe('repository', () => {
  const resourceNames = ["books", "tables", "pens"];
  const baseURL = "http://localhost";

  describe("processRemoteResources", () => {
    const mockBooks = [
      { id: "bib", name: "Bible" },
      { id: "abb", name: "Abbort" },
      { id: "tod", name: "Today in Science" }
    ];
    const mockResourceName = "books";

    it("Returns an object with list, getOne, destroy, update and create properties", () => {
      expect(
        Object.keys(processRemoteResources(mockResourceName, baseURL)).sort()
      ).toMatchObject(["list", "getOne", "destroy", "update", "create"].sort());
    });

    describe("list", () => {
      it('Returns the result of a call to the Axios get method at \
          url "baseURL/resourceName"', async () => {
          // @ts-ignore
          await axios.get.mockImplementation((url: string, config: any) =>
            Promise.resolve({
              request: {
                url,
                config
              },
              data: mockBooks
            })
          );

          await processRemoteResources(mockResourceName, baseURL)
            .list()
            .then(resp =>
              expect(resp).toMatchObject({
                request: {
                  url: `/${mockResourceName}/`,
                  config: { baseURL, params: {} }
                },
                data: mockBooks
              })
            );
        });

      it('Returns the result of a call to the Axios get method at url \
         "baseURL/resourceName" and queryparams coming from the payload optional parameter', async () => {
          // @ts-ignore        
          await axios.get.mockImplementation((url: string, config: any) =>
            Promise.resolve({
              request: {
                url,
                config
              },
              data: mockBooks
            })
          );
          const queryParams = { name: "Bible" };

          await processRemoteResources(mockResourceName, baseURL)
            .list(queryParams)
            .then(resp =>
              expect(resp).toMatchObject({
                request: {
                  url: `/${mockResourceName}/`,
                  config: { baseURL, params: queryParams }
                },
                data: mockBooks
              })
            );
        });
    });

    describe("getOne", () => {

      it('Returns the result of a call to the Axios get method at url \
          "baseURL/resourceName/{id}"', async () => {
          for (let book of mockBooks) {
            // @ts-ignore
            await axios.get.mockImplementation((url: string, config: any) =>
              Promise.resolve({
                request: {
                  url,
                  config
                },
                data: book
              })
            );

            await processRemoteResources(mockResourceName, baseURL)
              .getOne(book.id)
              .then(resp =>
                expect(resp).toMatchObject({
                  request: {
                    url: `/${mockResourceName}/${book.id}/`,
                    config: { baseURL }
                  },
                  data: book
                })
              );
          }
        });
    });

    describe("update", () => {

      it('Returns the result of a call to the the Axios put method \
          at url "baseURL/resourceName/{id}" with supplied payload', async () => {
          for (let book of mockBooks) {
            const timeNow = new Date();
            const new_update = { last_modified: timeNow };
            const updatedBook = { ...book, ...new_update };
            // @ts-ignore
            await axios.put.mockImplementation((url: string, payload: any, config: any) =>
              Promise.resolve({
                request: {
                  url,
                  payload,
                  config
                },
                data: updatedBook
              })
            );

            await processRemoteResources(mockResourceName, baseURL)
              .update(book.id, new_update)
              .then(resp =>
                expect(resp).toMatchObject({
                  request: {
                    url: `/${mockResourceName}/${book.id}/`,
                    payload: new_update,
                    config: { baseURL }
                  },
                  data: updatedBook
                })
              );
          }
        });
    });

    describe("destroy", () => {

      it('Returns the result of a call to the Axios destroy method \
          at url "baseURL/resourceName/{id}"', async () => {
          for (let book of mockBooks) {
            const mockedResponse = { data: { message: "success" }, status: 200 };
            // @ts-ignore
            await axios.delete.mockImplementation((url: string, config: any) =>
              Promise.resolve({
                ...mockedResponse,
                request: {
                  url,
                  config
                }
              })
            );

            await processRemoteResources(mockResourceName, baseURL)
              .destroy(book.id)
              .then(resp =>
                expect(resp).toMatchObject({
                  ...mockedResponse,
                  request: {
                    url: `/${mockResourceName}/${book.id}/`,
                    config: { baseURL }
                  }
                })
              );
          }
        });
    });

    describe("create", () => {

      it('Returns the result of a call to the Axios post method at \
          url "baseURL/resourceName" with supplied payload', async () => {
          const newBook = { id: "ytb", name: "Why Today?" };
          // @ts-ignore
          await axios.post.mockImplementation((url: string, payload: any, config: any) =>
            Promise.resolve({
              request: {
                url,
                payload,
                config
              },
              data: newBook
            })
          );

          const postPayload = { name: newBook.name };

          await processRemoteResources(mockResourceName, baseURL)
            .create(postPayload)
            .then(resp =>
              expect(resp).toMatchObject({
                request: {
                  url: `/${mockResourceName}/`,
                  payload: postPayload,
                  config: { baseURL }
                },
                data: newBook
              })
            );
        });
    });
  });

  describe("defaultImport", () => {

    it("Returns an object with keys as resource names and values\
        as results of the processRemoteResources", () => {
        expect(Object.keys(getResources(resourceNames))).toMatchObject(
          resourceNames
        );
      });

    it("Calls the resourceProcessor function for each\
        resourceName supplied with the given baseURL", () => {
        const processRemoteResourcesMock = jest.fn((data, url) => ({
          resourceName: data,
          baseURL: url
        }));

        getResources(resourceNames, baseURL, processRemoteResourcesMock);

        expect(processRemoteResourcesMock.mock.calls.length).toBe(
          resourceNames.length
        );
        for (let index = 0; index < resourceNames.length; index++) {
          expect(
            processRemoteResourcesMock.mock.results[index].value
          ).toMatchObject({
            resourceName: resourceNames[index],
            baseURL
          });
        }
      });
  });
});
