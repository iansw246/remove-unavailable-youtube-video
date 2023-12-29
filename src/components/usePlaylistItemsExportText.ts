import { useMemo } from "react";
import { PlaylistItem } from "../utils/requestHelpers";

export enum DataFormat {
  PlainText = "plaintext",
  JSON = "json",
}

const dataFormatToFileExtensionMap = new Map<DataFormat, string>([
  [DataFormat.PlainText, "txt"],
  [DataFormat.JSON, "json"],
]);

export function dataFormatToFileExtension(
  format: DataFormat,
): string | undefined {
  return dataFormatToFileExtensionMap.get(format);
}

export function isDataFormat(obj: any): obj is DataFormat {
  return Object.values(DataFormat).includes(obj);
}

export default function usePlaylistItemsExportText(
  playlistItems: PlaylistItem[],
  playlistDataFormat: DataFormat,
): string {
  return useMemo(() => {
    if (playlistDataFormat === DataFormat.JSON) {
      return JSON.stringify(playlistItems, null, 2);
    } else if (playlistDataFormat === DataFormat.PlainText) {
      const dataLines: string[] = playlistItems.map(
        (item) =>
          `${
            item.snippet?.videoOwnerChannelTitle || "[Unknown channel]"
          } - ${item.snippet?.title}`,
      );
      return dataLines.join("\n");
    } else {
      return "Invalid data format. Please report this error.";
    }
  }, [playlistItems, playlistDataFormat]);
}
