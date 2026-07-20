export type PostOfficeRecord = readonly [number, number, string, string];

export interface PostOfficeAssets {
  records: PostOfficeRecord[];
  markerImage: HTMLImageElement;
  clusterImage?: HTMLImageElement;
}

export interface PostOfficeDataSource {
  load(includeClusterImage: boolean): Promise<PostOfficeAssets>;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    image.src = url;
  });
}

export function createPostOfficeDataSource(baseUrl: string): PostOfficeDataSource {
  return {
    async load(includeClusterImage) {
      const recordsPromise = fetch(`${baseUrl}postoffice/postoffices.json`).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<PostOfficeRecord[]>;
      });
      const markerImagePromise = loadImage(`${baseUrl}postoffice/postoffice.webp`);
      const clusterImagePromise = includeClusterImage
        ? loadImage(`${baseUrl}postoffice/cluster_red.png`)
        : Promise.resolve(undefined);
      const [records, markerImage, clusterImage] = await Promise.all([
        recordsPromise,
        markerImagePromise,
        clusterImagePromise,
      ]);
      return { records, markerImage, clusterImage };
    },
  };
}

export const browserPostOfficeDataSource = createPostOfficeDataSource(import.meta.env.BASE_URL);
