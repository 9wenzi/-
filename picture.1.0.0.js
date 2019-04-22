// 依赖 hammer.js

// exif.js
(function() {

    var debug = false;

    var root = this;

    var EXIF = function(obj) {
        if (obj instanceof EXIF) return obj;
        if (!(this instanceof EXIF)) return new EXIF(obj);
        this.EXIFwrapped = obj;
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = EXIF;
        }
        exports.EXIF = EXIF;
    } else {
        root.EXIF = EXIF;
    }

    var ExifTags = EXIF.Tags = {

        // version tags
        0x9000 : "ExifVersion",             // EXIF version
        0xA000 : "FlashpixVersion",         // Flashpix format version

        // colorspace tags
        0xA001 : "ColorSpace",              // Color space information tag

        // image configuration
        0xA002 : "PixelXDimension",         // Valid width of meaningful image
        0xA003 : "PixelYDimension",         // Valid height of meaningful image
        0x9101 : "ComponentsConfiguration", // Information about channels
        0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

        // user information
        0x927C : "MakerNote",               // Any desired information written by the manufacturer
        0x9286 : "UserComment",             // Comments by user

        // related file
        0xA004 : "RelatedSoundFile",        // Name of related sound file

        // date and time
        0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
        0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
        0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
        0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
        0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

        // picture-taking conditions
        0x829A : "ExposureTime",            // Exposure time (in seconds)
        0x829D : "FNumber",                 // F number
        0x8822 : "ExposureProgram",         // Exposure program
        0x8824 : "SpectralSensitivity",     // Spectral sensitivity
        0x8827 : "ISOSpeedRatings",         // ISO speed rating
        0x8828 : "OECF",                    // Optoelectric conversion factor
        0x9201 : "ShutterSpeedValue",       // Shutter speed
        0x9202 : "ApertureValue",           // Lens aperture
        0x9203 : "BrightnessValue",         // Value of brightness
        0x9204 : "ExposureBias",            // Exposure bias
        0x9205 : "MaxApertureValue",        // Smallest F number of lens
        0x9206 : "SubjectDistance",         // Distance to subject in meters
        0x9207 : "MeteringMode",            // Metering mode
        0x9208 : "LightSource",             // Kind of light source
        0x9209 : "Flash",                   // Flash status
        0x9214 : "SubjectArea",             // Location and area of main subject
        0x920A : "FocalLength",             // Focal length of the lens in mm
        0xA20B : "FlashEnergy",             // Strobe energy in BCPS
        0xA20C : "SpatialFrequencyResponse",    //
        0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
        0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
        0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        0xA214 : "SubjectLocation",         // Location of subject in image
        0xA215 : "ExposureIndex",           // Exposure index selected on camera
        0xA217 : "SensingMethod",           // Image sensor type
        0xA300 : "FileSource",              // Image source (3 == DSC)
        0xA301 : "SceneType",               // Scene type (1 == directly photographed)
        0xA302 : "CFAPattern",              // Color filter array geometric pattern
        0xA401 : "CustomRendered",          // Special processing
        0xA402 : "ExposureMode",            // Exposure mode
        0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
        0xA404 : "DigitalZoomRation",       // Digital zoom ratio
        0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
        0xA406 : "SceneCaptureType",        // Type of scene
        0xA407 : "GainControl",             // Degree of overall image gain adjustment
        0xA408 : "Contrast",                // Direction of contrast processing applied by camera
        0xA409 : "Saturation",              // Direction of saturation processing applied by camera
        0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
        0xA40B : "DeviceSettingDescription",    //
        0xA40C : "SubjectDistanceRange",    // Distance to subject

        // other tags
        0xA005 : "InteroperabilityIFDPointer",
        0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
    };

    var TiffTags = EXIF.TiffTags = {
        0x0100 : "ImageWidth",
        0x0101 : "ImageHeight",
        0x8769 : "ExifIFDPointer",
        0x8825 : "GPSInfoIFDPointer",
        0xA005 : "InteroperabilityIFDPointer",
        0x0102 : "BitsPerSample",
        0x0103 : "Compression",
        0x0106 : "PhotometricInterpretation",
        0x0112 : "Orientation",
        0x0115 : "SamplesPerPixel",
        0x011C : "PlanarConfiguration",
        0x0212 : "YCbCrSubSampling",
        0x0213 : "YCbCrPositioning",
        0x011A : "XResolution",
        0x011B : "YResolution",
        0x0128 : "ResolutionUnit",
        0x0111 : "StripOffsets",
        0x0116 : "RowsPerStrip",
        0x0117 : "StripByteCounts",
        0x0201 : "JPEGInterchangeFormat",
        0x0202 : "JPEGInterchangeFormatLength",
        0x012D : "TransferFunction",
        0x013E : "WhitePoint",
        0x013F : "PrimaryChromaticities",
        0x0211 : "YCbCrCoefficients",
        0x0214 : "ReferenceBlackWhite",
        0x0132 : "DateTime",
        0x010E : "ImageDescription",
        0x010F : "Make",
        0x0110 : "Model",
        0x0131 : "Software",
        0x013B : "Artist",
        0x8298 : "Copyright"
    };

    var GPSTags = EXIF.GPSTags = {
        0x0000 : "GPSVersionID",
        0x0001 : "GPSLatitudeRef",
        0x0002 : "GPSLatitude",
        0x0003 : "GPSLongitudeRef",
        0x0004 : "GPSLongitude",
        0x0005 : "GPSAltitudeRef",
        0x0006 : "GPSAltitude",
        0x0007 : "GPSTimeStamp",
        0x0008 : "GPSSatellites",
        0x0009 : "GPSStatus",
        0x000A : "GPSMeasureMode",
        0x000B : "GPSDOP",
        0x000C : "GPSSpeedRef",
        0x000D : "GPSSpeed",
        0x000E : "GPSTrackRef",
        0x000F : "GPSTrack",
        0x0010 : "GPSImgDirectionRef",
        0x0011 : "GPSImgDirection",
        0x0012 : "GPSMapDatum",
        0x0013 : "GPSDestLatitudeRef",
        0x0014 : "GPSDestLatitude",
        0x0015 : "GPSDestLongitudeRef",
        0x0016 : "GPSDestLongitude",
        0x0017 : "GPSDestBearingRef",
        0x0018 : "GPSDestBearing",
        0x0019 : "GPSDestDistanceRef",
        0x001A : "GPSDestDistance",
        0x001B : "GPSProcessingMethod",
        0x001C : "GPSAreaInformation",
        0x001D : "GPSDateStamp",
        0x001E : "GPSDifferential"
    };

    var StringValues = EXIF.StringValues = {
        ExposureProgram : {
            0 : "Not defined",
            1 : "Manual",
            2 : "Normal program",
            3 : "Aperture priority",
            4 : "Shutter priority",
            5 : "Creative program",
            6 : "Action program",
            7 : "Portrait mode",
            8 : "Landscape mode"
        },
        MeteringMode : {
            0 : "Unknown",
            1 : "Average",
            2 : "CenterWeightedAverage",
            3 : "Spot",
            4 : "MultiSpot",
            5 : "Pattern",
            6 : "Partial",
            255 : "Other"
        },
        LightSource : {
            0 : "Unknown",
            1 : "Daylight",
            2 : "Fluorescent",
            3 : "Tungsten (incandescent light)",
            4 : "Flash",
            9 : "Fine weather",
            10 : "Cloudy weather",
            11 : "Shade",
            12 : "Daylight fluorescent (D 5700 - 7100K)",
            13 : "Day white fluorescent (N 4600 - 5400K)",
            14 : "Cool white fluorescent (W 3900 - 4500K)",
            15 : "White fluorescent (WW 3200 - 3700K)",
            17 : "Standard light A",
            18 : "Standard light B",
            19 : "Standard light C",
            20 : "D55",
            21 : "D65",
            22 : "D75",
            23 : "D50",
            24 : "ISO studio tungsten",
            255 : "Other"
        },
        Flash : {
            0x0000 : "Flash did not fire",
            0x0001 : "Flash fired",
            0x0005 : "Strobe return light not detected",
            0x0007 : "Strobe return light detected",
            0x0009 : "Flash fired, compulsory flash mode",
            0x000D : "Flash fired, compulsory flash mode, return light not detected",
            0x000F : "Flash fired, compulsory flash mode, return light detected",
            0x0010 : "Flash did not fire, compulsory flash mode",
            0x0018 : "Flash did not fire, auto mode",
            0x0019 : "Flash fired, auto mode",
            0x001D : "Flash fired, auto mode, return light not detected",
            0x001F : "Flash fired, auto mode, return light detected",
            0x0020 : "No flash function",
            0x0041 : "Flash fired, red-eye reduction mode",
            0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
            0x0047 : "Flash fired, red-eye reduction mode, return light detected",
            0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059 : "Flash fired, auto mode, red-eye reduction mode",
            0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod : {
            1 : "Not defined",
            2 : "One-chip color area sensor",
            3 : "Two-chip color area sensor",
            4 : "Three-chip color area sensor",
            5 : "Color sequential area sensor",
            7 : "Trilinear sensor",
            8 : "Color sequential linear sensor"
        },
        SceneCaptureType : {
            0 : "Standard",
            1 : "Landscape",
            2 : "Portrait",
            3 : "Night scene"
        },
        SceneType : {
            1 : "Directly photographed"
        },
        CustomRendered : {
            0 : "Normal process",
            1 : "Custom process"
        },
        WhiteBalance : {
            0 : "Auto white balance",
            1 : "Manual white balance"
        },
        GainControl : {
            0 : "None",
            1 : "Low gain up",
            2 : "High gain up",
            3 : "Low gain down",
            4 : "High gain down"
        },
        Contrast : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        Saturation : {
            0 : "Normal",
            1 : "Low saturation",
            2 : "High saturation"
        },
        Sharpness : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        SubjectDistanceRange : {
            0 : "Unknown",
            1 : "Macro",
            2 : "Close view",
            3 : "Distant view"
        },
        FileSource : {
            3 : "DSC"
        },

        Components : {
            0 : "",
            1 : "Y",
            2 : "Cb",
            3 : "Cr",
            4 : "R",
            5 : "G",
            6 : "B"
        }
    };

    function addEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    }

    function imageHasData(img) {
        return !!(img.exifdata);
    }


    function base64ToArrayBuffer(base64, contentType) {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        var binary = atob(base64);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    function objectURLToBlob(url, callback) {
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = "blob";
        http.onload = function(e) {
            if (this.status == 200 || this.status === 0) {
                callback(this.response);
            }
        };
        http.send();
    }

    function getImageData(img, callback) {
        function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            var iptcdata = findIPTCinJPEG(binFile);
            img.exifdata = data || {};
            img.iptcdata = iptcdata || {};
            if (callback) {
                callback.call(img);
            }
        }

        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                var arrayBuffer = base64ToArrayBuffer(img.src);
                handleBinaryFile(arrayBuffer);

            } else if (/^blob\:/i.test(img.src)) { // Object URL
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    handleBinaryFile(e.target.result);
                };
                objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            } else {
                var http = new XMLHttpRequest();
                http.onload = function() {
                    if (this.status == 200 || this.status === 0) {
                        handleBinaryFile(http.response);
                    } else {
                        throw "Could not load image";
                    }
                    http = null;
                };
                http.open("GET", img.src, true);
                http.responseType = "arraybuffer";
                http.send(null);
            }
        } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                if (debug) console.log("Got file of length " + e.target.result.byteLength);
                handleBinaryFile(e.target.result);
            };

            fileReader.readAsArrayBuffer(img);
        }
    }

    function findEXIFinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            marker;

        while (offset < length) {
            if (dataView.getUint8(offset) != 0xFF) {
                if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
                return false; // not a valid marker, something is wrong
            }

            marker = dataView.getUint8(offset + 1);
            if (debug) console.log(marker);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 225) {
                if (debug) console.log("Found 0xFFE1 marker");

                return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

                // offset += 2 + file.getShortAt(offset+2, true);

            } else {
                offset += 2 + dataView.getUint16(offset+2);
            }

        }

    }

    function findIPTCinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength;


        var isFieldSegmentStart = function(dataView, offset){
            return (
                dataView.getUint8(offset) === 0x38 &&
                dataView.getUint8(offset+1) === 0x42 &&
                dataView.getUint8(offset+2) === 0x49 &&
                dataView.getUint8(offset+3) === 0x4D &&
                dataView.getUint8(offset+4) === 0x04 &&
                dataView.getUint8(offset+5) === 0x04
            );
        };

        while (offset < length) {

            if ( isFieldSegmentStart(dataView, offset )){

                // Get the length of the name header (which is padded to an even number of bytes)
                var nameHeaderLength = dataView.getUint8(offset+7);
                if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
                // Check for pre photoshop 6 format
                if(nameHeaderLength === 0) {
                    // Always 4
                    nameHeaderLength = 4;
                }

                var startOffset = offset + 8 + nameHeaderLength;
                var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

                return readIPTCData(file, startOffset, sectionLength);

                break;

            }


            // Not the marker, continue searching
            offset++;

        }

    }
    var IptcFieldMap = {
        0x78 : 'caption',
        0x6E : 'credit',
        0x19 : 'keywords',
        0x37 : 'dateCreated',
        0x50 : 'byline',
        0x55 : 'bylineTitle',
        0x7A : 'captionWriter',
        0x69 : 'headline',
        0x74 : 'copyright',
        0x0F : 'category'
    };
    function readIPTCData(file, startOffset, sectionLength){
        var dataView = new DataView(file);
        var data = {};
        var fieldValue, fieldName, dataSize, segmentType, segmentSize;
        var segmentStartPos = startOffset;
        while(segmentStartPos < startOffset+sectionLength) {
            if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
                segmentType = dataView.getUint8(segmentStartPos+2);
                if(segmentType in IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos+3);
                    segmentSize = dataSize + 5;
                    fieldName = IptcFieldMap[segmentType];
                    fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                    // Check if we already stored a value with this name
                    if(data.hasOwnProperty(fieldName)) {
                        // Value already stored with this name, create multivalue field
                        if(data[fieldName] instanceof Array) {
                            data[fieldName].push(fieldValue);
                        }
                        else {
                            data[fieldName] = [data[fieldName], fieldValue];
                        }
                    }
                    else {
                        data[fieldName] = fieldValue;
                    }
                }

            }
            segmentStartPos++;
        }
        return data;
    }



    function readTags(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    }


    function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getUint16(entryOffset+2, !bigEnd),
            numValues = file.getUint32(entryOffset+4, !bigEnd),
            valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return getStringFromDB(file, offset, numValues-1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 5:    // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset+4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                        denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                    }
                    return vals;
                }
        }
    }

    function getStringFromDB(buffer, start, length) {
        var outstr = "";
        for (n = start; n < start+length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    }

    function readEXIFData(file, start) {
        if (getStringFromDB(file, start, 4) != "Exif") {
            if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
            return false;
        }

        var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
        } else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        } else {
            if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }

        if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
            if (debug) console.log("Not valid TIFF data! (no 0x002A)");
            return false;
        }

        var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

        if (firstIFDOffset < 0x00000008) {
            if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
            return false;
        }

        tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

        if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource" :
                    case "Flash" :
                    case "MeteringMode" :
                    case "ExposureProgram" :
                    case "SensingMethod" :
                    case "SceneCaptureType" :
                    case "SceneType" :
                    case "CustomRendered" :
                    case "WhiteBalance" :
                    case "GainControl" :
                    case "Contrast" :
                    case "Saturation" :
                    case "Sharpness" :
                    case "SubjectDistanceRange" :
                    case "FileSource" :
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;

                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;

                    case "ComponentsConfiguration" :
                        exifData[tag] =
                            StringValues.Components[exifData[tag][0]] +
                            StringValues.Components[exifData[tag][1]] +
                            StringValues.Components[exifData[tag][2]] +
                            StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }

        if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID" :
                        gpsData[tag] = gpsData[tag][0] +
                            "." + gpsData[tag][1] +
                            "." + gpsData[tag][2] +
                            "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }

        return tags;
    }

    EXIF.getData = function(img, callback) {
        if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;

        if (!imageHasData(img)) {
            getImageData(img, callback);
        } else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    }

    EXIF.getTag = function(img, tag) {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }

    EXIF.getAllTags = function(img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    EXIF.pretty = function(img) {
        if (!imageHasData(img)) return "";
        var a,
            data = img.exifdata,
            strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    } else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                } else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    }

    EXIF.readFromBinaryFile = function(file) {
        return findEXIFinJPEG(file);
    }

    if (typeof define === 'function' && define.amd) {
        define('exif-js', [], function() {
            return EXIF;
        });
    }
}.call(this));

//图片编辑本体
;(function(window, document) {
	var body = document.body;

	/**
	 * settings {
	 * 	id: element, 上传按钮
	 * 	size: [300,  150], 剪裁尺寸
	 * 	onInit: function () {}, 钩子函数
	 * 	onLoadDataStart: function() {} 钩子函数
	 * 	onLoadDataEnd: function() {} 钩子函数
	 * 	onShow: function () {}, 钩子函数
	 * 	onClose: function () {}, 钩子函数
	 * 	onCancle: function () {}, 钩子函数
	 * 	onConfirm: function (imgURL, imgBlob) {} 钩子函数
	 * 	onDestroy; function() {}
	 * }
	 */

	function ImgEdit(settings) {
		this.settings = settings;
		this.view = new ImgEditView(settings);
		return this.init();
	}

	ImgEdit.prototype.init = function() {
		var that = this;
		var target = this.settings.id;
		var fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = "image/*";
		
		target.onclick = function() {
            fileInput.click();
        };

		var reader = new FileReader();
		var img = new Image();
		var imgDataURL;

		fileInput.onchange = function(e) {
            var imgTypes = "png,jpg,jpeg,bmp,gif,svg,webp";
            var type = e.target.files[0].type;
            type = type.substring(type.indexOf("/") + 1);
            type = type.toLowerCase();
            if (imgTypes.indexOf(type) < 0) {
                alert("该文件不是图片！");
                return;
            }
			typeof that.settings.onLoadDataStart === "function" && that.settings.onLoadDataStart();
            // reader.readAsDataURL(e.target.files[0]);
			reader.readAsArrayBuffer(e.target.files[0]);
			fileInput.value = "";
		}

		reader.onload = function(e) {
            // var _blob = dataURLtoBlob(reader.result);
			var _blob = new Blob([reader.result]);
			var _url = URL.createObjectURL(_blob);

			img.onload = function () {
				URL.revokeObjectURL(_url);
				EXIF.getData(_blob, function() {
					var orentation = EXIF.getTag(this, 'Orientation');
                    switch(orentation) {
                        case 6:
                            imgDataURL = rotateImage(img, 90);
                            break;
                        case 3:
                            imgDataURL = rotateImage(img, 180);
                            break;
                        case 8:
                            imgDataURL = rotateImage(img, 270);
                            break;
                        default:
                            imgDataURL = rotateImage(img, 0);
                            break; 
                    }
                    
					_blob = dataURLtoBlob(imgDataURL);

					_url = URL.createObjectURL(_blob);

					that.view.show(_url);

					typeof that.settings.onLoadDataEnd === "function" && that.settings.onLoadDataEnd();
				});
			}
            img.src = _url;
		}
		typeof this.settings.onInit === "function" &&  this.settings.onInit();

		return this;
	}


	function ImgEditView(settings) {
		this.settings = settings;
		this.imgEdit = document.createElement("div");
		this.imgEditHd = document.createElement("div");
		this.imgEditCancle = document.createElement("span");
		this.imgEditConfirm = document.createElement("span");

		this.imgEditBd = document.createElement("div");

		//背景画布
		this.canvasMask = document.createElement("canvas");
		this.maskCtx = this.canvasMask.getContext("2d");

		this.imgEditZoom = document.createElement("div");
		this.imgEditImg = document.createElement("img");

		this.imgEditFt = document.createElement("div");
		this.imgEditRotate = document.createElement("span");

		this.imgEditPreview = document.createElement("div");
		this.imgEditPreviewHd = document.createElement("div");
		this.imgEditPreviewCancle = document.createElement("span");
		this.imgEditPreviewConfirm = document.createElement("span");
		this.imgEditPreviewImg = document.createElement("img");

		// 隐藏画布
		this.canvas;
		this.ctx;
		this.canvasW = 0;
		this.canvasH = 0;

		//导出预览画布
		this.preCanvas = document.createElement("canvas");
		this.preCtx = this.preCanvas.getContext("2d");

		//图片的位移
		this.translateX = 0;
		this.translateY = 0;

		//旋转方向
		// 0: 0|360度  1: 90度  2: 180度 3： 270 度
		this.rotateDirection = 0; 

		this.scaleValue = 1; // 初始缩放系数

		this.scaleMax = 1; // todo 缩放最大值
		this.scaleMin = 0; // todo 缩放最小值
		this.scaleStep = 0.5; // todo 固定倍数缩小

		//图片与剪辑框 框的 比率
		this.ratio = 1;

        //屏幕的 dpr
        this.dpr = window.devicePixelRatio;

        //图片源
        this.imgSource = "";

		this.init();
		return this;
	}

	ImgEditView.prototype.init = function () {
		this.draw();
		this.bindEvents();
	}

	ImgEditView.prototype.draw = function() {
		this.imgEdit.className = "img-edit";
		
		this.imgEditHd.className = "img-edit__hd";
		this.imgEditCancle.className = "img-edit__cancle";
		this.imgEditCancle.innerText = "取消";
		this.imgEditConfirm.className = "img-edit__confirm";
		this.imgEditConfirm.innerText = "选取";

		this.imgEditBd.className = "img-edit__bd";
		this.canvasMask.className = "img-edit__mask";
		this.imgEditZoom.className = "img-edit__zoom";
		this.imgEditImg.className = "img-edit__img";

		this.imgEditFt.className = "img-edit__ft";
		this.imgEditRotate.className = "img-edit__rotate";
		this.imgEditRotate.innerText = "旋转";

		//预览部分 todo
		this.imgEditPreview.className = "img-edit__preview";
		this.imgEditPreviewHd.className = "img-edit__preview-hd";
		this.imgEditPreviewCancle.className = "img-edit__preview-cancle";
		this.imgEditPreviewCancle.innerText = "放弃编辑";
		this.imgEditPreviewConfirm.className = "img-edit__preview-confirm";
		this.imgEditPreviewCancle.innerText = "确定编辑";
		this.imgEditPreviewImg.className = "img-edit__preview-img";

		this.imgEditPreviewHd.appendChild(this.imgEditPreviewCancle);
		this.imgEditPreviewHd.appendChild(this.imgEditPreviewConfirm);
		this.imgEditPreview.appendChild(this.imgEditPreviewHd);
		this.imgEditPreview.appendChild(this.imgEditPreviewImg);

		this.imgEditHd.appendChild(this.imgEditCancle);
		this.imgEditHd.appendChild(this.imgEditConfirm);

		this.imgEditBd.appendChild(this.canvasMask);
		this.imgEditBd.appendChild(this.imgEditZoom);
		// this.imgEditBd.appendChild(this.imgEditImg);

		this.imgEditFt.appendChild(this.imgEditRotate);

		this.imgEdit.appendChild(this.imgEditHd);
		this.imgEdit.appendChild(this.imgEditBd);
		this.imgEdit.appendChild(this.imgEditFt);

		body.appendChild(this.imgEdit);
		var maskBound = this.canvasMask.getBoundingClientRect();
		this.canvasMask.width = maskBound.width;
		this.canvasMask.height = maskBound.height;
		this.imgEdit.style.display = "none";

		this.settings.size = this.settings.size || [this.canvasMask.width, 200];

        //若果设置尺寸比屏幕还大 则按比例重置为屏幕 
		if (this.settings.size[0] > screen.width) {
			var _r = screen.width / this.settings.size[0];
			this.settings.size[0] = screen.width;
			this.settings.size[1] = this.settings.size[1] * _r;
		}
		var _size = this.settings.size;
		
		//背景蒙层 合成
		this.maskCtx.globalAlpha = 0.85;
		this.maskCtx.save();
		this.maskCtx.fillRect(0, 0, this.canvasMask.width, this.canvasMask.height);
		this.maskCtx.fillStyle = "rgba(0, 0, 0, .3)";
		this.maskCtx.restore();
		
		this.maskCtx.globalCompositeOperation = "destination-out";

		this.maskCtx.save();
		this.maskCtx.fillRect((this.canvasMask.width - _size[0]) / 2, (this.canvasMask.height - _size[1]) / 2, _size[0], _size[1]);
		this.maskCtx.fillStyle = "rgba(255, 255, 255, 0)";
		this.maskCtx.restore();		

		//手指操作蒙层 定位在 剪裁窗口上
		/*this.imgEditZoom.style.width = _size[0] + "px";
		this.imgEditZoom.style.height = _size[1] + "px";
		this.imgEditZoom.style.top = 0;
		this.imgEditZoom.style.top = (this.canvasMask.height - _size[1]) / 2 + "px";
		this.imgEditZoom.style.left = (this.canvasMask.width - _size[0]) / 2 + "px";*/

        this.imgEditZoom.style.width = 100 + "%";
        this.imgEditZoom.style.height = 100 + "%";
        this.imgEditZoom.style.top = 0;
        this.imgEditZoom.style.top = 0;
        this.imgEditZoom.style.left = 0;
        this.imgEditZoom.style.right = 0;
	}

	ImgEditView.prototype.bindEvents = function() {
		var that = this;
		var imgEditImg = this.imgEditImg;
		var imgEditImgStyle = imgEditImg.style;
		var settings = that.settings;
		var size = settings.size;
		var _scaleValue;
		var _translateX;
		var _translateY;
		
		//手势
		var hammerTime = new Hammer(this.imgEditZoom);

		//缩放 
		hammerTime.get("pinch").set({enable: true});
		hammerTime.on("pinchmove", function(e) {
			that.clearCanvas();

			that.ctx.save();	
			that.ctx.scale(e.scale, e.scale);
			that.ctx.drawImage(imgEditImg, -imgEditImg.width / 2, -imgEditImg.height / 2);
			that.ctx.restore();
			
			// _scaleValue = that.scaleValue * e.scale;
			// imgEditImgStyle.transform = "translate(" + that.translateX + "px, " + that.translateY + "px)" + "scale(" + _scaleValue +", " + _scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
			// imgEditImgStyle.webkitTransform = "translate(" + that.translateX + "px, " + that.translateY + "px)" + "scale(" + _scaleValue +", " + _scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
		});

		hammerTime.on("pinchend", function(e) {
			that.scaleValue *= e.scale;
			that.ctx.scale(e.scale, e.scale);
		});

		//移动
		hammerTime.on("panmove", function(e) {
			that.clearCanvas();

			that.ctx.save();
			if (!that.rotateDirection) {
                that.ctx.translate(e.deltaX / that.scaleValue, e.deltaY / that.scaleValue);
            }
            if (that.rotateDirection == 1) {
                that.ctx.translate(e.deltaY / that.scaleValue, -e.deltaX / that.scaleValue);
            }
            if (that.rotateDirection == 2) {
                that.ctx.translate(-e.deltaX / that.scaleValue, -e.deltaY / that.scaleValue);
            }
            if (that.rotateDirection == 3) {
                that.ctx.translate(-e.deltaY / that.scaleValue, e.deltaX / that.scaleValue);
            }
            that.ctx.drawImage(imgEditImg, -imgEditImg.width / 2, -imgEditImg.height / 2);
			that.ctx.restore();

			// _translateX = that.translateX + e.deltaX;
			// _translateY = that.translateY + e.deltaY;

			// imgEditImgStyle.transform = "translate(" + _translateX + "px, " + _translateY + "px)" + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
			// imgEditImgStyle.webkitTransform = "translate(" + _translateX + "px, " + _translateY + "px)" + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)"; 
		});

		hammerTime.on("panend", function(e) {
			that.translateX += e.deltaX;
			that.translateY += e.deltaY;
            if (!that.rotateDirection) {
                that.ctx.translate(e.deltaX / that.scaleValue, e.deltaY / that.scaleValue);
            }
            if (that.rotateDirection == 1) {
                that.ctx.translate(e.deltaY / that.scaleValue, -e.deltaX / that.scaleValue);
            }
            if (that.rotateDirection == 2) {
                that.ctx.translate(-e.deltaX / that.scaleValue, -e.deltaY / that.scaleValue);
            }
            if (that.rotateDirection == 3) {
                that.ctx.translate(-e.deltaY / that.scaleValue, e.deltaX / that.scaleValue);
            }
		});

		//旋转
		this.imgEditRotate.onclick = function() {
			that.clearCanvas();
			that.ctx.rotate(90 * Math.PI / 180);
			that.ctx.drawImage(imgEditImg, -imgEditImg.width / 2, -imgEditImg.height / 2);
			that.rotateDirection++;
			that.rotateDirection %= 4;

			// imgEditImgStyle.transform = "translate(" + that.translateX + "px, " + that.translateY + "px)" + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
			// imgEditImgStyle.webkitTransform = "translate(" + that.translateX + "px, " + that.translateY + "px)" + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
		}

		//取消
		this.imgEditCancle.onclick = function() {
			that.imgEdit.style.display = "none";

            that.imgEditBd.removeChild(that.canvas)

			typeof settings.onCancle === "function" && settings.onCancle();
		}

		//确定 
		this.imgEditConfirm.onclick = function() {
            var imgData = that.ctx.getImageData((that.canvasW / that.dpr - size[0]) / 2, (that.canvasH / that.dpr - size[1]) / 2, size[0], size[1]);
			that.preCtx.putImageData(imgData, 0, 0);

			imgData = that.preCanvas.toDataURL("image/png", 1);
			typeof settings.onConfirm === "function" && settings.onConfirm(imgData, dataURLtoBlob(imgData));
			that.imgEdit.style.display = "none";

            that.imgEditBd.removeChild(that.canvas)
		}
	}

	ImgEditView.prototype.show = function(imgSource) {
		var that = this;
		
		//剪裁尺寸
		var _size = this.settings.size;

		//新建隐藏画布 和 新的画布上下文 并初始化
        //针对高清屏幕需要 根据 dpr 等比例放大画布
		this.canvas = document.createElement("canvas");
		this.canvasW = this.canvas.width = this.canvasMask.width * this.dpr;
		this.canvasH = this.canvas.height = this.canvasMask.height * this.dpr;
        this.ctx = this.canvas.getContext("2d");

        this.canvas.className = "img-edit__img";
        
		//导出预览画布尺寸初始化
		this.preCanvas.width = _size[0];
		this.preCanvas.height = _size[1];

		//图片的位移 初始化
		this.translateX = 0;
		this.translateY = 0;

		// 旋转方向 初始化
		// 0: 0|360度  1: 90度  2: 180度 3： 270 度
		this.rotateDirection = 0; 

		// 用户缩放系数 初始化
		this.scaleValue = 1;

        // 操作替身图片 初始化
        this.imgEditImg.style.transform = "translate(" + that.translateX + "px, " + that.translateY + "px)"  + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
        this.imgEditImg.style.webkitTransform = "translate(" + that.translateX + "px, " + that.translateY + "px)"  + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
        
		this.imgEditImg.onload = function() {

			//图源载入后打开编辑层  
			that.imgEdit.style.display = "block";
            that.ratio = that.canvasMask.width / this.naturalWidth;

            //隐藏编辑画布
            // that.ctx.translate(that.canvasW / 2, that.canvasH / 2);
            that.ctx.translate(that.canvasMask.width / 2, that.canvasMask.height / 2);
            that.ctx.scale(that.ratio, that.ratio);
            that.ctx.drawImage(this, -this.naturalWidth / 2, -this.naturalHeight / 2);

            //替身图片
            // that.translateX = -(this.naturalWidth - that.canvasW) / 2;
            // that.translateY = -(this.naturalHeight - that.canvasH) / 2;
            that.scaleValue *= that.ratio;

            // bug fix ios 中 图片要显示在style 设置宽高
            // bug 在 iphone X 中使用 该替身图片导致 getImageData 数据不完全 先注释掉
            // this.style.width = this.naturalWidth + "px";
            // this.style.height = this.naturalHeight + "px";

            // this.style.transform = "translate(" + that.translateX + "px, " + that.translateY + "px)"  + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
            // this.style.webkitTransform = "translate(" + that.translateX + "px, " + that.translateY + "px)"  + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
            // that.imgEditBd.appendChild(that.imgEditImg);

            that.imgEditBd.appendChild(that.canvas);
        }

        //操作替身图片
        this.imgEditImg.src = imgSource;

        this.imgSource = imgSource;
	}

	ImgEditView.prototype.clearCanvas = function() {
		this.ctx.save();
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.restore();
	}

	window.ImgEdit = ImgEdit;

	//ios img 与 canvas显示方向不同 需要提前旋转
	function rotateImage(img, degree) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        // var encoder = new JPEGEncoder();
        var ratio = 1;
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        var pxRatio = window.devicePixelRatio;

        if (w > 1365 || h > 1365) {
            w = document.body.getBoundingClientRect().width;
            ratio = w / img.naturalWidth;
            h = img.naturalHeight * ratio;
        }

        if (!degree) {
            canvas = createHDPICanvas(canvas, w, h);
            ctx.scale(pxRatio, pxRatio);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.drawImage(img, 0, 0, img.naturalWidth * ratio, img.naturalHeight * ratio);
            ctx.restore();
        }

        if (degree == 90) {
            canvas = createHDPICanvas(canvas, h, w);
            ctx.scale(pxRatio, pxRatio);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.rotate(degree * Math.PI / 180);
            ctx.translate(0, -img.naturalHeight * ratio);
            ctx.drawImage(img, 0, 0, img.naturalWidth * ratio, img.naturalHeight * ratio);
            ctx.restore();
        }

        if (degree == 180) {
            canvas = createHDPICanvas(canvas, w, h);
            ctx.scale(pxRatio, pxRatio);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.rotate(degree * Math.PI / 180);
            ctx.translate(-img.naturalWidth * ratio, -img.naturalHeight * ratio);
            ctx.drawImage(img, 0, 0, img.naturalWidth * ratio, img.naturalHeight * ratio);
            ctx.restore();
        }

        if (degree == 270) {
            canvas = createHDPICanvas(canvas, h, w);
            ctx.scale(pxRatio, pxRatio);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.translate(-img.naturalHeight * ratio, 0);
            ctx.drawImage(img, 0, 0, img.naturalWidth * ratio, img.naturalHeight * ratio);
            ctx.restore();
        }

        var imgDataURL = canvas.toDataURL("image/jepg", 0.8);
        return imgDataURL;
    }

	//base64转二进制
	function dataURLtoBlob(dataurl) {
	 	var arr = dataurl.split(',');
		var mime = arr[0].match(/:(.*?);/)[1];
	    var bstr = atob(arr[1]);
	    var n = bstr.length;
	    var u8arr = new Uint8Array(n);
	    while (n--) {
	        u8arr[n] = bstr.charCodeAt(n);
	    }
	    return new Blob([u8arr], {type: mime});
	}

    function createHDPICanvas(canvas, width, height) {
        var ratio = window.devicePixelRatio;
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        return canvas;
    }

})(window, document);



