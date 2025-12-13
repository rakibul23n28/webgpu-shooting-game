export class Texture {
  constructor(
    public texture: GPUTexture,
    public sampler: GPUSampler,
    public id: string,
    public width: number,
    public height: number
  ) {}

  public static async createTextureFromURL(
    device: GPUDevice,
    url: string
  ): Promise<Texture> {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image ${url}`));
    });

    const texture = device.createTexture({
      size: { width: img.width, height: img.height },
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const bitmap = await createImageBitmap(img);

    device.queue.copyExternalImageToTexture(
      { source: bitmap },
      { texture },
      { width: img.width, height: img.height }
    );

    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });

    return new Texture(texture, sampler, img.src, img.width, img.height);
  }
}
