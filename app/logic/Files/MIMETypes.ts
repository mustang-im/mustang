// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

export class FileType {
  id: string;
  name: string;
  mimeTypes: string[];
}

export const genericFileTypes = [
  {
    id: "text",
    name: "Text document",
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.oasis.opendocument.text",
      "text/html",
      "text/md",
      "text/plain",
      "text/",
    ],
  },
  {
    id: "picture",
    name: "Picture",
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg",
      "image/bmp",
      "image/",
    ],
  },
  {
    id: "video",
    name: "Video",
    mimeTypes: [
      "video/mpeg",
      "video/mp4",
      "video/ogg",
      "video/",
    ],
  },
  {
    id: "audio",
    name: "Audio",
    mimeTypes: [
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "audio/",
    ],
  },
  {
    id: "presentation",
    name: "Presentation",
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
      "application/vnd.openxmlformats-officedocument.presentationml.slide",
      "application/vnd.oasis.opendocument.presentation",
    ],
  },
  {
    id: "spreadsheet",
    name: "Spreadsheet",
    mimeTypes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.oasis.opendocument.spreadsheet",
    ],
  },
];

export const fileExtensions = {
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png",
  "gif": "image/gif",
  "svg": "image/svg",
  "bmp": "image/bmp",
  "mp3": "audio/mpeg",
  "m4a": "audio/mpeg",
  "aac": "audio/aac",
  "wav": "audio/x-wav",
  "mpg": "video/mpeg",
  "mpeg": "video/mpeg",
  "mp4": "video/mp4",
  "txt": "text/plain",
  "md": "text/markdown",
  "html": "text/html",
  "htm": "text/html",
  "doc": "application/msword",
  "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "odt": "application/vnd.oasis.opendocument.text",
  "pdf": "application/pdf",
  "ppt": "application/vnd.ms-powerpoint",
  "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "odp": "application/vnd.oasis.opendocument.presentation",
  "xls": "application/vnd.ms-excel",
  "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "ods": "application/vnd.oasis.opendocument.spreadsheet",
};
