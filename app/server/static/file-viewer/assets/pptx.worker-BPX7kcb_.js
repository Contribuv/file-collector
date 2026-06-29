(function() {
	var Tf = Object.create, W0 = Object.defineProperty, wf = Object.getOwnPropertyDescriptor, _f = Object.getOwnPropertyNames, Mf = Object.getPrototypeOf, Ff = Object.prototype.hasOwnProperty, Hc = ((e) => typeof require != "undefined" ? require : typeof Proxy != "undefined" ? new Proxy(e, { get: (i, a) => (typeof require != "undefined" ? require : i)[a] }) : e)(function(e) {
		if (typeof require != "undefined") return require.apply(this, arguments);
		throw Error("Dynamic require of \"" + e + "\" is not supported");
	}), n1 = (e, i) => () => (i || e((i = { exports: {} }).exports, i), i.exports), If = (e, i, a, h) => {
		if (i && typeof i == "object" || typeof i == "function") for (let o of _f(i)) !Ff.call(e, o) && o !== a && W0(e, o, {
			get: () => i[o],
			enumerable: !(h = wf(i, o)) || h.enumerable
		});
		return e;
	}, B0 = (e, i, a) => (a = e != null ? Tf(Mf(e)) : {}, If(i || !e || !e.__esModule ? W0(a, "default", {
		value: e,
		enumerable: !0
	}) : a, e)), Cf = n1((e, i) => {
		(function(a) {
			typeof e == "object" && typeof i != "undefined" ? i.exports = a() : typeof define == "function" && define.amd ? define([], a) : (typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this).JSZip = a();
		})(function() {
			return (function a(h, o, r) {
				function d(f, D) {
					if (!o[f]) {
						if (!h[f]) {
							var T = typeof Hc == "function" && Hc;
							if (!D && T) return T(f, !0);
							if (s) return s(f, !0);
							var w = /* @__PURE__ */ new Error("Cannot find module '" + f + "'");
							throw w.code = "MODULE_NOT_FOUND", w;
						}
						var m = o[f] = { exports: {} };
						h[f][0].call(m.exports, function(x) {
							var b = h[f][1][x];
							return d(b || x);
						}, m, m.exports, a, h, o, r);
					}
					return o[f].exports;
				}
				for (var s = typeof Hc == "function" && Hc, g = 0; g < r.length; g++) d(r[g]);
				return d;
			})({
				1: [function(a, h, o) {
					"use strict";
					var r = a("./utils"), d = a("./support"), s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
					o.encode = function(g) {
						for (var f, D, T, w, m, x, b, L = [], v = 0, p = g.length, l = p, M = r.getTypeOf(g) !== "string"; v < g.length;) l = p - v, T = M ? (f = g[v++], D = v < p ? g[v++] : 0, v < p ? g[v++] : 0) : (f = g.charCodeAt(v++), D = v < p ? g.charCodeAt(v++) : 0, v < p ? g.charCodeAt(v++) : 0), w = f >> 2, m = (3 & f) << 4 | D >> 4, x = 1 < l ? (15 & D) << 2 | T >> 6 : 64, b = 2 < l ? 63 & T : 64, L.push(s.charAt(w) + s.charAt(m) + s.charAt(x) + s.charAt(b));
						return L.join("");
					}, o.decode = function(g) {
						var f, D, T, w, m, x, b = 0, L = 0, v = "data:";
						if (g.substr(0, v.length) === v) throw new Error("Invalid base64 input, it looks like a data url.");
						var p, l = 3 * (g = g.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
						if (g.charAt(g.length - 1) === s.charAt(64) && l--, g.charAt(g.length - 2) === s.charAt(64) && l--, l % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
						for (p = d.uint8array ? new Uint8Array(0 | l) : new Array(0 | l); b < g.length;) f = s.indexOf(g.charAt(b++)) << 2 | (w = s.indexOf(g.charAt(b++))) >> 4, D = (15 & w) << 4 | (m = s.indexOf(g.charAt(b++))) >> 2, T = (3 & m) << 6 | (x = s.indexOf(g.charAt(b++))), p[L++] = f, m !== 64 && (p[L++] = D), x !== 64 && (p[L++] = T);
						return p;
					};
				}, {
					"./support": 30,
					"./utils": 32
				}],
				2: [function(a, h, o) {
					"use strict";
					var r = a("./external"), d = a("./stream/DataWorker"), s = a("./stream/Crc32Probe"), g = a("./stream/DataLengthProbe");
					function f(D, T, w, m, x) {
						this.compressedSize = D, this.uncompressedSize = T, this.crc32 = w, this.compression = m, this.compressedContent = x;
					}
					f.prototype = {
						getContentWorker: function() {
							var D = new d(r.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new g("data_length")), T = this;
							return D.on("end", function() {
								if (this.streamInfo.data_length !== T.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
							}), D;
						},
						getCompressedWorker: function() {
							return new d(r.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
						}
					}, f.createWorkerFrom = function(D, T, w) {
						return D.pipe(new s()).pipe(new g("uncompressedSize")).pipe(T.compressWorker(w)).pipe(new g("compressedSize")).withStreamInfo("compression", T);
					}, h.exports = f;
				}, {
					"./external": 6,
					"./stream/Crc32Probe": 25,
					"./stream/DataLengthProbe": 26,
					"./stream/DataWorker": 27
				}],
				3: [function(a, h, o) {
					"use strict";
					var r = a("./stream/GenericWorker");
					o.STORE = {
						magic: "\0\0",
						compressWorker: function() {
							return new r("STORE compression");
						},
						uncompressWorker: function() {
							return new r("STORE decompression");
						}
					}, o.DEFLATE = a("./flate");
				}, {
					"./flate": 7,
					"./stream/GenericWorker": 28
				}],
				4: [function(a, h, o) {
					"use strict";
					var r = a("./utils"), d = (function() {
						for (var s, g = [], f = 0; f < 256; f++) {
							s = f;
							for (var D = 0; D < 8; D++) s = 1 & s ? 3988292384 ^ s >>> 1 : s >>> 1;
							g[f] = s;
						}
						return g;
					})();
					h.exports = function(s, g) {
						return s !== void 0 && s.length ? r.getTypeOf(s) !== "string" ? (function(f, D, T, w) {
							var m = d, x = w + T;
							f ^= -1;
							for (var b = w; b < x; b++) f = f >>> 8 ^ m[255 & (f ^ D[b])];
							return -1 ^ f;
						})(0 | g, s, s.length, 0) : (function(f, D, T, w) {
							var m = d, x = w + T;
							f ^= -1;
							for (var b = w; b < x; b++) f = f >>> 8 ^ m[255 & (f ^ D.charCodeAt(b))];
							return -1 ^ f;
						})(0 | g, s, s.length, 0) : 0;
					};
				}, { "./utils": 32 }],
				5: [function(a, h, o) {
					"use strict";
					o.base64 = !1, o.binary = !1, o.dir = !1, o.createFolders = !0, o.date = null, o.compression = null, o.compressionOptions = null, o.comment = null, o.unixPermissions = null, o.dosPermissions = null;
				}, {}],
				6: [function(a, h, o) {
					"use strict";
					var r = null;
					r = typeof Promise != "undefined" ? Promise : a("lie"), h.exports = { Promise: r };
				}, { lie: 37 }],
				7: [function(a, h, o) {
					"use strict";
					var r = typeof Uint8Array != "undefined" && typeof Uint16Array != "undefined" && typeof Uint32Array != "undefined", d = a("pako"), s = a("./utils"), g = a("./stream/GenericWorker"), f = r ? "uint8array" : "array";
					function D(T, w) {
						g.call(this, "FlateWorker/" + T), this._pako = null, this._pakoAction = T, this._pakoOptions = w, this.meta = {};
					}
					o.magic = "\b\0", s.inherits(D, g), D.prototype.processChunk = function(T) {
						this.meta = T.meta, this._pako === null && this._createPako(), this._pako.push(s.transformTo(f, T.data), !1);
					}, D.prototype.flush = function() {
						g.prototype.flush.call(this), this._pako === null && this._createPako(), this._pako.push([], !0);
					}, D.prototype.cleanUp = function() {
						g.prototype.cleanUp.call(this), this._pako = null;
					}, D.prototype._createPako = function() {
						this._pako = new d[this._pakoAction]({
							raw: !0,
							level: this._pakoOptions.level || -1
						});
						var T = this;
						this._pako.onData = function(w) {
							T.push({
								data: w,
								meta: T.meta
							});
						};
					}, o.compressWorker = function(T) {
						return new D("Deflate", T);
					}, o.uncompressWorker = function() {
						return new D("Inflate", {});
					};
				}, {
					"./stream/GenericWorker": 28,
					"./utils": 32,
					pako: 38
				}],
				8: [function(a, h, o) {
					"use strict";
					function r(m, x) {
						var b, L = "";
						for (b = 0; b < x; b++) L += String.fromCharCode(255 & m), m >>>= 8;
						return L;
					}
					function d(m, x, b, L, v, p) {
						var l, M, J = m.file, se = m.compression, ne = p !== f.utf8encode, ce = s.transformTo("string", p(J.name)), N = s.transformTo("string", f.utf8encode(J.name)), ke = J.comment, ve = s.transformTo("string", p(ke)), S = s.transformTo("string", f.utf8encode(ke)), K = N.length !== J.name.length, y = S.length !== ke.length, X = "", le = "", t = "", n = J.dir, pe = J.date, Be = {
							crc32: 0,
							compressedSize: 0,
							uncompressedSize: 0
						};
						x && !b || (Be.crc32 = m.crc32, Be.compressedSize = m.compressedSize, Be.uncompressedSize = m.uncompressedSize);
						var W = 0;
						x && (W |= 8), ne || !K && !y || (W |= 2048);
						var _ = 0, H = 0;
						n && (_ |= 16), v === "UNIX" ? (H = 798, _ |= (function(Te, Ua) {
							var ya = Te;
							return Te || (ya = Ua ? 16893 : 33204), (65535 & ya) << 16;
						})(J.unixPermissions, n)) : (H = 20, _ |= (function(Te) {
							return 63 & (Te || 0);
						})(J.dosPermissions)), l = pe.getUTCHours(), l <<= 6, l |= pe.getUTCMinutes(), l <<= 5, l |= pe.getUTCSeconds() / 2, M = pe.getUTCFullYear() - 1980, M <<= 4, M |= pe.getUTCMonth() + 1, M <<= 5, M |= pe.getUTCDate(), K && (le = r(1, 1) + r(D(ce), 4) + N, X += "up" + r(le.length, 2) + le), y && (t = r(1, 1) + r(D(ve), 4) + S, X += "uc" + r(t.length, 2) + t);
						var Le = "";
						return Le += `
\0`, Le += r(W, 2), Le += se.magic, Le += r(l, 2), Le += r(M, 2), Le += r(Be.crc32, 4), Le += r(Be.compressedSize, 4), Le += r(Be.uncompressedSize, 4), Le += r(ce.length, 2), Le += r(X.length, 2), {
							fileRecord: T.LOCAL_FILE_HEADER + Le + ce + X,
							dirRecord: T.CENTRAL_FILE_HEADER + r(H, 2) + Le + r(ve.length, 2) + "\0\0\0\0" + r(_, 4) + r(L, 4) + ce + X + ve
						};
					}
					var s = a("../utils"), g = a("../stream/GenericWorker"), f = a("../utf8"), D = a("../crc32"), T = a("../signature");
					function w(m, x, b, L) {
						g.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = x, this.zipPlatform = b, this.encodeFileName = L, this.streamFiles = m, this.accumulate = !1, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
					}
					s.inherits(w, g), w.prototype.push = function(m) {
						var x = m.meta.percent || 0, b = this.entriesCount, L = this._sources.length;
						this.accumulate ? this.contentBuffer.push(m) : (this.bytesWritten += m.data.length, g.prototype.push.call(this, {
							data: m.data,
							meta: {
								currentFile: this.currentFile,
								percent: b ? (x + 100 * (b - L - 1)) / b : 100
							}
						}));
					}, w.prototype.openedSource = function(m) {
						this.currentSourceOffset = this.bytesWritten, this.currentFile = m.file.name;
						var x = this.streamFiles && !m.file.dir;
						if (x) {
							var b = d(m, x, !1, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
							this.push({
								data: b.fileRecord,
								meta: { percent: 0 }
							});
						} else this.accumulate = !0;
					}, w.prototype.closedSource = function(m) {
						this.accumulate = !1;
						var x = this.streamFiles && !m.file.dir, b = d(m, x, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
						if (this.dirRecords.push(b.dirRecord), x) this.push({
							data: (function(L) {
								return T.DATA_DESCRIPTOR + r(L.crc32, 4) + r(L.compressedSize, 4) + r(L.uncompressedSize, 4);
							})(m),
							meta: { percent: 100 }
						});
						else for (this.push({
							data: b.fileRecord,
							meta: { percent: 0 }
						}); this.contentBuffer.length;) this.push(this.contentBuffer.shift());
						this.currentFile = null;
					}, w.prototype.flush = function() {
						for (var m = this.bytesWritten, x = 0; x < this.dirRecords.length; x++) this.push({
							data: this.dirRecords[x],
							meta: { percent: 100 }
						});
						var b = this.bytesWritten - m, L = (function(v, p, l, M, J) {
							var se = s.transformTo("string", J(M));
							return T.CENTRAL_DIRECTORY_END + "\0\0\0\0" + r(v, 2) + r(v, 2) + r(p, 4) + r(l, 4) + r(se.length, 2) + se;
						})(this.dirRecords.length, b, m, this.zipComment, this.encodeFileName);
						this.push({
							data: L,
							meta: { percent: 100 }
						});
					}, w.prototype.prepareNextSource = function() {
						this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
					}, w.prototype.registerPrevious = function(m) {
						this._sources.push(m);
						var x = this;
						return m.on("data", function(b) {
							x.processChunk(b);
						}), m.on("end", function() {
							x.closedSource(x.previous.streamInfo), x._sources.length ? x.prepareNextSource() : x.end();
						}), m.on("error", function(b) {
							x.error(b);
						}), this;
					}, w.prototype.resume = function() {
						return !!g.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), !0) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), !0));
					}, w.prototype.error = function(m) {
						var x = this._sources;
						if (!g.prototype.error.call(this, m)) return !1;
						for (var b = 0; b < x.length; b++) try {
							x[b].error(m);
						} catch {}
						return !0;
					}, w.prototype.lock = function() {
						g.prototype.lock.call(this);
						for (var m = this._sources, x = 0; x < m.length; x++) m[x].lock();
					}, h.exports = w;
				}, {
					"../crc32": 4,
					"../signature": 23,
					"../stream/GenericWorker": 28,
					"../utf8": 31,
					"../utils": 32
				}],
				9: [function(a, h, o) {
					"use strict";
					var r = a("../compressions"), d = a("./ZipFileWorker");
					o.generateWorker = function(s, g, f) {
						var D = new d(g.streamFiles, f, g.platform, g.encodeFileName), T = 0;
						try {
							s.forEach(function(w, m) {
								T++;
								var x = (function(p, l) {
									var M = p || l, J = r[M];
									if (!J) throw new Error(M + " is not a valid compression method !");
									return J;
								})(m.options.compression, g.compression), b = m.options.compressionOptions || g.compressionOptions || {}, L = m.dir, v = m.date;
								m._compressWorker(x, b).withStreamInfo("file", {
									name: w,
									dir: L,
									date: v,
									comment: m.comment || "",
									unixPermissions: m.unixPermissions,
									dosPermissions: m.dosPermissions
								}).pipe(D);
							}), D.entriesCount = T;
						} catch (w) {
							D.error(w);
						}
						return D;
					};
				}, {
					"../compressions": 3,
					"./ZipFileWorker": 8
				}],
				10: [function(a, h, o) {
					"use strict";
					function r() {
						if (!(this instanceof r)) return new r();
						if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
						this.files = Object.create(null), this.comment = null, this.root = "", this.clone = function() {
							var d = new r();
							for (var s in this) typeof this[s] != "function" && (d[s] = this[s]);
							return d;
						};
					}
					(r.prototype = a("./object")).loadAsync = a("./load"), r.support = a("./support"), r.defaults = a("./defaults"), r.version = "3.10.1", r.loadAsync = function(d, s) {
						return new r().loadAsync(d, s);
					}, r.external = a("./external"), h.exports = r;
				}, {
					"./defaults": 5,
					"./external": 6,
					"./load": 11,
					"./object": 15,
					"./support": 30
				}],
				11: [function(a, h, o) {
					"use strict";
					var r = a("./utils"), d = a("./external"), s = a("./utf8"), g = a("./zipEntries"), f = a("./stream/Crc32Probe"), D = a("./nodejsUtils");
					function T(w) {
						return new d.Promise(function(m, x) {
							var b = w.decompressed.getContentWorker().pipe(new f());
							b.on("error", function(L) {
								x(L);
							}).on("end", function() {
								b.streamInfo.crc32 !== w.decompressed.crc32 ? x(/* @__PURE__ */ new Error("Corrupted zip : CRC32 mismatch")) : m();
							}).resume();
						});
					}
					h.exports = function(w, m) {
						var x = this;
						return m = r.extend(m || {}, {
							base64: !1,
							checkCRC32: !1,
							optimizedBinaryString: !1,
							createFolders: !1,
							decodeFileName: s.utf8decode
						}), D.isNode && D.isStream(w) ? d.Promise.reject(/* @__PURE__ */ new Error("JSZip can't accept a stream when loading a zip file.")) : r.prepareContent("the loaded zip file", w, !0, m.optimizedBinaryString, m.base64).then(function(b) {
							var L = new g(m);
							return L.load(b), L;
						}).then(function(b) {
							var L = [d.Promise.resolve(b)], v = b.files;
							if (m.checkCRC32) for (var p = 0; p < v.length; p++) L.push(T(v[p]));
							return d.Promise.all(L);
						}).then(function(b) {
							for (var L = b.shift(), v = L.files, p = 0; p < v.length; p++) {
								var l = v[p], M = l.fileNameStr, J = r.resolve(l.fileNameStr);
								x.file(J, l.decompressed, {
									binary: !0,
									optimizedBinaryString: !0,
									date: l.date,
									dir: l.dir,
									comment: l.fileCommentStr.length ? l.fileCommentStr : null,
									unixPermissions: l.unixPermissions,
									dosPermissions: l.dosPermissions,
									createFolders: m.createFolders
								}), l.dir || (x.file(J).unsafeOriginalName = M);
							}
							return L.zipComment.length && (x.comment = L.zipComment), x;
						});
					};
				}, {
					"./external": 6,
					"./nodejsUtils": 14,
					"./stream/Crc32Probe": 25,
					"./utf8": 31,
					"./utils": 32,
					"./zipEntries": 33
				}],
				12: [function(a, h, o) {
					"use strict";
					var r = a("../utils"), d = a("../stream/GenericWorker");
					function s(g, f) {
						d.call(this, "Nodejs stream input adapter for " + g), this._upstreamEnded = !1, this._bindStream(f);
					}
					r.inherits(s, d), s.prototype._bindStream = function(g) {
						var f = this;
						(this._stream = g).pause(), g.on("data", function(D) {
							f.push({
								data: D,
								meta: { percent: 0 }
							});
						}).on("error", function(D) {
							f.isPaused ? this.generatedError = D : f.error(D);
						}).on("end", function() {
							f.isPaused ? f._upstreamEnded = !0 : f.end();
						});
					}, s.prototype.pause = function() {
						return !!d.prototype.pause.call(this) && (this._stream.pause(), !0);
					}, s.prototype.resume = function() {
						return !!d.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), !0);
					}, h.exports = s;
				}, {
					"../stream/GenericWorker": 28,
					"../utils": 32
				}],
				13: [function(a, h, o) {
					"use strict";
					var r = a("readable-stream").Readable;
					function d(s, g, f) {
						r.call(this, g), this._helper = s;
						var D = this;
						s.on("data", function(T, w) {
							D.push(T) || D._helper.pause(), f && f(w);
						}).on("error", function(T) {
							D.emit("error", T);
						}).on("end", function() {
							D.push(null);
						});
					}
					a("../utils").inherits(d, r), d.prototype._read = function() {
						this._helper.resume();
					}, h.exports = d;
				}, {
					"../utils": 32,
					"readable-stream": 16
				}],
				14: [function(a, h, o) {
					"use strict";
					h.exports = {
						isNode: typeof Buffer != "undefined",
						newBufferFrom: function(r, d) {
							if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(r, d);
							if (typeof r == "number") throw new Error("The \"data\" argument must not be a number");
							return new Buffer(r, d);
						},
						allocBuffer: function(r) {
							if (Buffer.alloc) return Buffer.alloc(r);
							var d = new Buffer(r);
							return d.fill(0), d;
						},
						isBuffer: function(r) {
							return Buffer.isBuffer(r);
						},
						isStream: function(r) {
							return r && typeof r.on == "function" && typeof r.pause == "function" && typeof r.resume == "function";
						}
					};
				}, {}],
				15: [function(a, h, o) {
					"use strict";
					function r(M, J, se) {
						var ne, ce = s.getTypeOf(J), N = s.extend(se || {}, D);
						N.date = N.date || /* @__PURE__ */ new Date(), N.compression !== null && (N.compression = N.compression.toUpperCase()), typeof N.unixPermissions == "string" && (N.unixPermissions = parseInt(N.unixPermissions, 8)), N.unixPermissions && 16384 & N.unixPermissions && (N.dir = !0), N.dosPermissions && 16 & N.dosPermissions && (N.dir = !0), N.dir && (M = v(M)), N.createFolders && (ne = L(M)) && p.call(this, ne, !0);
						var ke = ce === "string" && N.binary === !1 && N.base64 === !1;
						se && se.binary !== void 0 || (N.binary = !ke), (J instanceof T && J.uncompressedSize === 0 || N.dir || !J || J.length === 0) && (N.base64 = !1, N.binary = !0, J = "", N.compression = "STORE", ce = "string");
						var ve = null;
						ve = J instanceof T || J instanceof g ? J : x.isNode && x.isStream(J) ? new b(M, J) : s.prepareContent(M, J, N.binary, N.optimizedBinaryString, N.base64);
						var S = new w(M, ve, N);
						this.files[M] = S;
					}
					var d = a("./utf8"), s = a("./utils"), g = a("./stream/GenericWorker"), f = a("./stream/StreamHelper"), D = a("./defaults"), T = a("./compressedObject"), w = a("./zipObject"), m = a("./generate"), x = a("./nodejsUtils"), b = a("./nodejs/NodejsStreamInputAdapter"), L = function(M) {
						M.slice(-1) === "/" && (M = M.substring(0, M.length - 1));
						var J = M.lastIndexOf("/");
						return 0 < J ? M.substring(0, J) : "";
					}, v = function(M) {
						return M.slice(-1) !== "/" && (M += "/"), M;
					}, p = function(M, J) {
						return J = J !== void 0 ? J : D.createFolders, M = v(M), this.files[M] || r.call(this, M, null, {
							dir: !0,
							createFolders: J
						}), this.files[M];
					};
					function l(M) {
						return Object.prototype.toString.call(M) === "[object RegExp]";
					}
					h.exports = {
						load: function() {
							throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
						},
						forEach: function(M) {
							var J, se, ne;
							for (J in this.files) ne = this.files[J], (se = J.slice(this.root.length, J.length)) && J.slice(0, this.root.length) === this.root && M(se, ne);
						},
						filter: function(M) {
							var J = [];
							return this.forEach(function(se, ne) {
								M(se, ne) && J.push(ne);
							}), J;
						},
						file: function(M, J, se) {
							if (arguments.length !== 1) return M = this.root + M, r.call(this, M, J, se), this;
							if (l(M)) {
								var ne = M;
								return this.filter(function(N, ke) {
									return !ke.dir && ne.test(N);
								});
							}
							var ce = this.files[this.root + M];
							return ce && !ce.dir ? ce : null;
						},
						folder: function(M) {
							if (!M) return this;
							if (l(M)) return this.filter(function(ce, N) {
								return N.dir && M.test(ce);
							});
							var J = this.root + M, se = p.call(this, J), ne = this.clone();
							return ne.root = se.name, ne;
						},
						remove: function(M) {
							M = this.root + M;
							var J = this.files[M];
							if (J || (M.slice(-1) !== "/" && (M += "/"), J = this.files[M]), J && !J.dir) delete this.files[M];
							else for (var se = this.filter(function(ce, N) {
								return N.name.slice(0, M.length) === M;
							}), ne = 0; ne < se.length; ne++) delete this.files[se[ne].name];
							return this;
						},
						generate: function() {
							throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
						},
						generateInternalStream: function(M) {
							var J, se = {};
							try {
								if ((se = s.extend(M || {}, {
									streamFiles: !1,
									compression: "STORE",
									compressionOptions: null,
									type: "",
									platform: "DOS",
									comment: null,
									mimeType: "application/zip",
									encodeFileName: d.utf8encode
								})).type = se.type.toLowerCase(), se.compression = se.compression.toUpperCase(), se.type === "binarystring" && (se.type = "string"), !se.type) throw new Error("No output type specified.");
								s.checkSupport(se.type), se.platform !== "darwin" && se.platform !== "freebsd" && se.platform !== "linux" && se.platform !== "sunos" || (se.platform = "UNIX"), se.platform === "win32" && (se.platform = "DOS");
								var ne = se.comment || this.comment || "";
								J = m.generateWorker(this, se, ne);
							} catch (ce) {
								(J = new g("error")).error(ce);
							}
							return new f(J, se.type || "string", se.mimeType);
						},
						generateAsync: function(M, J) {
							return this.generateInternalStream(M).accumulate(J);
						},
						generateNodeStream: function(M, J) {
							return (M = M || {}).type || (M.type = "nodebuffer"), this.generateInternalStream(M).toNodejsStream(J);
						}
					};
				}, {
					"./compressedObject": 2,
					"./defaults": 5,
					"./generate": 9,
					"./nodejs/NodejsStreamInputAdapter": 12,
					"./nodejsUtils": 14,
					"./stream/GenericWorker": 28,
					"./stream/StreamHelper": 29,
					"./utf8": 31,
					"./utils": 32,
					"./zipObject": 35
				}],
				16: [function(a, h, o) {
					"use strict";
					h.exports = a("stream");
				}, { stream: void 0 }],
				17: [function(a, h, o) {
					"use strict";
					var r = a("./DataReader");
					function d(s) {
						r.call(this, s);
						for (var g = 0; g < this.data.length; g++) s[g] = 255 & s[g];
					}
					a("../utils").inherits(d, r), d.prototype.byteAt = function(s) {
						return this.data[this.zero + s];
					}, d.prototype.lastIndexOfSignature = function(s) {
						for (var g = s.charCodeAt(0), f = s.charCodeAt(1), D = s.charCodeAt(2), T = s.charCodeAt(3), w = this.length - 4; 0 <= w; --w) if (this.data[w] === g && this.data[w + 1] === f && this.data[w + 2] === D && this.data[w + 3] === T) return w - this.zero;
						return -1;
					}, d.prototype.readAndCheckSignature = function(s) {
						var g = s.charCodeAt(0), f = s.charCodeAt(1), D = s.charCodeAt(2), T = s.charCodeAt(3), w = this.readData(4);
						return g === w[0] && f === w[1] && D === w[2] && T === w[3];
					}, d.prototype.readData = function(s) {
						if (this.checkOffset(s), s === 0) return [];
						var g = this.data.slice(this.zero + this.index, this.zero + this.index + s);
						return this.index += s, g;
					}, h.exports = d;
				}, {
					"../utils": 32,
					"./DataReader": 18
				}],
				18: [function(a, h, o) {
					"use strict";
					var r = a("../utils");
					function d(s) {
						this.data = s, this.length = s.length, this.index = 0, this.zero = 0;
					}
					d.prototype = {
						checkOffset: function(s) {
							this.checkIndex(this.index + s);
						},
						checkIndex: function(s) {
							if (this.length < this.zero + s || s < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + s + "). Corrupted zip ?");
						},
						setIndex: function(s) {
							this.checkIndex(s), this.index = s;
						},
						skip: function(s) {
							this.setIndex(this.index + s);
						},
						byteAt: function() {},
						readInt: function(s) {
							var g, f = 0;
							for (this.checkOffset(s), g = this.index + s - 1; g >= this.index; g--) f = (f << 8) + this.byteAt(g);
							return this.index += s, f;
						},
						readString: function(s) {
							return r.transformTo("string", this.readData(s));
						},
						readData: function() {},
						lastIndexOfSignature: function() {},
						readAndCheckSignature: function() {},
						readDate: function() {
							var s = this.readInt(4);
							return new Date(Date.UTC(1980 + (s >> 25 & 127), (s >> 21 & 15) - 1, s >> 16 & 31, s >> 11 & 31, s >> 5 & 63, (31 & s) << 1));
						}
					}, h.exports = d;
				}, { "../utils": 32 }],
				19: [function(a, h, o) {
					"use strict";
					var r = a("./Uint8ArrayReader");
					function d(s) {
						r.call(this, s);
					}
					a("../utils").inherits(d, r), d.prototype.readData = function(s) {
						this.checkOffset(s);
						var g = this.data.slice(this.zero + this.index, this.zero + this.index + s);
						return this.index += s, g;
					}, h.exports = d;
				}, {
					"../utils": 32,
					"./Uint8ArrayReader": 21
				}],
				20: [function(a, h, o) {
					"use strict";
					var r = a("./DataReader");
					function d(s) {
						r.call(this, s);
					}
					a("../utils").inherits(d, r), d.prototype.byteAt = function(s) {
						return this.data.charCodeAt(this.zero + s);
					}, d.prototype.lastIndexOfSignature = function(s) {
						return this.data.lastIndexOf(s) - this.zero;
					}, d.prototype.readAndCheckSignature = function(s) {
						return s === this.readData(4);
					}, d.prototype.readData = function(s) {
						this.checkOffset(s);
						var g = this.data.slice(this.zero + this.index, this.zero + this.index + s);
						return this.index += s, g;
					}, h.exports = d;
				}, {
					"../utils": 32,
					"./DataReader": 18
				}],
				21: [function(a, h, o) {
					"use strict";
					var r = a("./ArrayReader");
					function d(s) {
						r.call(this, s);
					}
					a("../utils").inherits(d, r), d.prototype.readData = function(s) {
						if (this.checkOffset(s), s === 0) return new Uint8Array(0);
						var g = this.data.subarray(this.zero + this.index, this.zero + this.index + s);
						return this.index += s, g;
					}, h.exports = d;
				}, {
					"../utils": 32,
					"./ArrayReader": 17
				}],
				22: [function(a, h, o) {
					"use strict";
					var r = a("../utils"), d = a("../support"), s = a("./ArrayReader"), g = a("./StringReader"), f = a("./NodeBufferReader"), D = a("./Uint8ArrayReader");
					h.exports = function(T) {
						var w = r.getTypeOf(T);
						return r.checkSupport(w), w !== "string" || d.uint8array ? w === "nodebuffer" ? new f(T) : d.uint8array ? new D(r.transformTo("uint8array", T)) : new s(r.transformTo("array", T)) : new g(T);
					};
				}, {
					"../support": 30,
					"../utils": 32,
					"./ArrayReader": 17,
					"./NodeBufferReader": 19,
					"./StringReader": 20,
					"./Uint8ArrayReader": 21
				}],
				23: [function(a, h, o) {
					"use strict";
					o.LOCAL_FILE_HEADER = "PK", o.CENTRAL_FILE_HEADER = "PK", o.CENTRAL_DIRECTORY_END = "PK", o.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", o.ZIP64_CENTRAL_DIRECTORY_END = "PK", o.DATA_DESCRIPTOR = "PK\x07\b";
				}, {}],
				24: [function(a, h, o) {
					"use strict";
					var r = a("./GenericWorker"), d = a("../utils");
					function s(g) {
						r.call(this, "ConvertWorker to " + g), this.destType = g;
					}
					d.inherits(s, r), s.prototype.processChunk = function(g) {
						this.push({
							data: d.transformTo(this.destType, g.data),
							meta: g.meta
						});
					}, h.exports = s;
				}, {
					"../utils": 32,
					"./GenericWorker": 28
				}],
				25: [function(a, h, o) {
					"use strict";
					var r = a("./GenericWorker"), d = a("../crc32");
					function s() {
						r.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
					}
					a("../utils").inherits(s, r), s.prototype.processChunk = function(g) {
						this.streamInfo.crc32 = d(g.data, this.streamInfo.crc32 || 0), this.push(g);
					}, h.exports = s;
				}, {
					"../crc32": 4,
					"../utils": 32,
					"./GenericWorker": 28
				}],
				26: [function(a, h, o) {
					"use strict";
					var r = a("../utils"), d = a("./GenericWorker");
					function s(g) {
						d.call(this, "DataLengthProbe for " + g), this.propName = g, this.withStreamInfo(g, 0);
					}
					r.inherits(s, d), s.prototype.processChunk = function(g) {
						if (g) {
							var f = this.streamInfo[this.propName] || 0;
							this.streamInfo[this.propName] = f + g.data.length;
						}
						d.prototype.processChunk.call(this, g);
					}, h.exports = s;
				}, {
					"../utils": 32,
					"./GenericWorker": 28
				}],
				27: [function(a, h, o) {
					"use strict";
					var r = a("../utils"), d = a("./GenericWorker");
					function s(g) {
						d.call(this, "DataWorker");
						var f = this;
						this.dataIsReady = !1, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = !1, g.then(function(D) {
							f.dataIsReady = !0, f.data = D, f.max = D && D.length || 0, f.type = r.getTypeOf(D), f.isPaused || f._tickAndRepeat();
						}, function(D) {
							f.error(D);
						});
					}
					r.inherits(s, d), s.prototype.cleanUp = function() {
						d.prototype.cleanUp.call(this), this.data = null;
					}, s.prototype.resume = function() {
						return !!d.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = !0, r.delay(this._tickAndRepeat, [], this)), !0);
					}, s.prototype._tickAndRepeat = function() {
						this._tickScheduled = !1, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (r.delay(this._tickAndRepeat, [], this), this._tickScheduled = !0));
					}, s.prototype._tick = function() {
						if (this.isPaused || this.isFinished) return !1;
						var g = null, f = Math.min(this.max, this.index + 16384);
						if (this.index >= this.max) return this.end();
						switch (this.type) {
							case "string":
								g = this.data.substring(this.index, f);
								break;
							case "uint8array":
								g = this.data.subarray(this.index, f);
								break;
							case "array":
							case "nodebuffer": g = this.data.slice(this.index, f);
						}
						return this.index = f, this.push({
							data: g,
							meta: { percent: this.max ? this.index / this.max * 100 : 0 }
						});
					}, h.exports = s;
				}, {
					"../utils": 32,
					"./GenericWorker": 28
				}],
				28: [function(a, h, o) {
					"use strict";
					function r(d) {
						this.name = d || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = !0, this.isFinished = !1, this.isLocked = !1, this._listeners = {
							data: [],
							end: [],
							error: []
						}, this.previous = null;
					}
					r.prototype = {
						push: function(d) {
							this.emit("data", d);
						},
						end: function() {
							if (this.isFinished) return !1;
							this.flush();
							try {
								this.emit("end"), this.cleanUp(), this.isFinished = !0;
							} catch (d) {
								this.emit("error", d);
							}
							return !0;
						},
						error: function(d) {
							return !this.isFinished && (this.isPaused ? this.generatedError = d : (this.isFinished = !0, this.emit("error", d), this.previous && this.previous.error(d), this.cleanUp()), !0);
						},
						on: function(d, s) {
							return this._listeners[d].push(s), this;
						},
						cleanUp: function() {
							this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
						},
						emit: function(d, s) {
							if (this._listeners[d]) for (var g = 0; g < this._listeners[d].length; g++) this._listeners[d][g].call(this, s);
						},
						pipe: function(d) {
							return d.registerPrevious(this);
						},
						registerPrevious: function(d) {
							if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
							this.streamInfo = d.streamInfo, this.mergeStreamInfo(), this.previous = d;
							var s = this;
							return d.on("data", function(g) {
								s.processChunk(g);
							}), d.on("end", function() {
								s.end();
							}), d.on("error", function(g) {
								s.error(g);
							}), this;
						},
						pause: function() {
							return !this.isPaused && !this.isFinished && (this.isPaused = !0, this.previous && this.previous.pause(), !0);
						},
						resume: function() {
							if (!this.isPaused || this.isFinished) return !1;
							var d = this.isPaused = !1;
							return this.generatedError && (this.error(this.generatedError), d = !0), this.previous && this.previous.resume(), !d;
						},
						flush: function() {},
						processChunk: function(d) {
							this.push(d);
						},
						withStreamInfo: function(d, s) {
							return this.extraStreamInfo[d] = s, this.mergeStreamInfo(), this;
						},
						mergeStreamInfo: function() {
							for (var d in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, d) && (this.streamInfo[d] = this.extraStreamInfo[d]);
						},
						lock: function() {
							if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
							this.isLocked = !0, this.previous && this.previous.lock();
						},
						toString: function() {
							var d = "Worker " + this.name;
							return this.previous ? this.previous + " -> " + d : d;
						}
					}, h.exports = r;
				}, {}],
				29: [function(a, h, o) {
					"use strict";
					var r = a("../utils"), d = a("./ConvertWorker"), s = a("./GenericWorker"), g = a("../base64"), f = a("../support"), D = a("../external"), T = null;
					if (f.nodestream) try {
						T = a("../nodejs/NodejsStreamOutputAdapter");
					} catch {}
					function w(x, b) {
						return new D.Promise(function(L, v) {
							var p = [], l = x._internalType, M = x._outputType, J = x._mimeType;
							x.on("data", function(se, ne) {
								p.push(se), b && b(ne);
							}).on("error", function(se) {
								p = [], v(se);
							}).on("end", function() {
								try {
									L((function(se, ne, ce) {
										switch (se) {
											case "blob": return r.newBlob(r.transformTo("arraybuffer", ne), ce);
											case "base64": return g.encode(ne);
											default: return r.transformTo(se, ne);
										}
									})(M, (function(se, ne) {
										var ce, N = 0, ke = null, ve = 0;
										for (ce = 0; ce < ne.length; ce++) ve += ne[ce].length;
										switch (se) {
											case "string": return ne.join("");
											case "array": return Array.prototype.concat.apply([], ne);
											case "uint8array":
												for (ke = new Uint8Array(ve), ce = 0; ce < ne.length; ce++) ke.set(ne[ce], N), N += ne[ce].length;
												return ke;
											case "nodebuffer": return Buffer.concat(ne);
											default: throw new Error("concat : unsupported type '" + se + "'");
										}
									})(l, p), J));
								} catch (se) {
									v(se);
								}
								p = [];
							}).resume();
						});
					}
					function m(x, b, L) {
						var v = b;
						switch (b) {
							case "blob":
							case "arraybuffer":
								v = "uint8array";
								break;
							case "base64": v = "string";
						}
						try {
							this._internalType = v, this._outputType = b, this._mimeType = L, r.checkSupport(v), this._worker = x.pipe(new d(v)), x.lock();
						} catch (p) {
							this._worker = new s("error"), this._worker.error(p);
						}
					}
					m.prototype = {
						accumulate: function(x) {
							return w(this, x);
						},
						on: function(x, b) {
							var L = this;
							return x === "data" ? this._worker.on(x, function(v) {
								b.call(L, v.data, v.meta);
							}) : this._worker.on(x, function() {
								r.delay(b, arguments, L);
							}), this;
						},
						resume: function() {
							return r.delay(this._worker.resume, [], this._worker), this;
						},
						pause: function() {
							return this._worker.pause(), this;
						},
						toNodejsStream: function(x) {
							if (r.checkSupport("nodestream"), this._outputType !== "nodebuffer") throw new Error(this._outputType + " is not supported by this method");
							return new T(this, { objectMode: this._outputType !== "nodebuffer" }, x);
						}
					}, h.exports = m;
				}, {
					"../base64": 1,
					"../external": 6,
					"../nodejs/NodejsStreamOutputAdapter": 13,
					"../support": 30,
					"../utils": 32,
					"./ConvertWorker": 24,
					"./GenericWorker": 28
				}],
				30: [function(a, h, o) {
					"use strict";
					if (o.base64 = !0, o.array = !0, o.string = !0, o.arraybuffer = typeof ArrayBuffer != "undefined" && typeof Uint8Array != "undefined", o.nodebuffer = typeof Buffer != "undefined", o.uint8array = typeof Uint8Array != "undefined", typeof ArrayBuffer == "undefined") o.blob = !1;
					else {
						var r = /* @__PURE__ */ new ArrayBuffer(0);
						try {
							o.blob = new Blob([r], { type: "application/zip" }).size === 0;
						} catch {
							try {
								var d = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
								d.append(r), o.blob = d.getBlob("application/zip").size === 0;
							} catch {
								o.blob = !1;
							}
						}
					}
					try {
						o.nodestream = !!a("readable-stream").Readable;
					} catch {
						o.nodestream = !1;
					}
				}, { "readable-stream": 16 }],
				31: [function(a, h, o) {
					"use strict";
					for (var r = a("./utils"), d = a("./support"), s = a("./nodejsUtils"), g = a("./stream/GenericWorker"), f = new Array(256), D = 0; D < 256; D++) f[D] = 252 <= D ? 6 : 248 <= D ? 5 : 240 <= D ? 4 : 224 <= D ? 3 : 192 <= D ? 2 : 1;
					f[254] = f[254] = 1;
					function T() {
						g.call(this, "utf-8 decode"), this.leftOver = null;
					}
					function w() {
						g.call(this, "utf-8 encode");
					}
					o.utf8encode = function(m) {
						return d.nodebuffer ? s.newBufferFrom(m, "utf-8") : (function(x) {
							var b, L, v, p, l, M = x.length, J = 0;
							for (p = 0; p < M; p++) (64512 & (L = x.charCodeAt(p))) == 55296 && p + 1 < M && (64512 & (v = x.charCodeAt(p + 1))) == 56320 && (L = 65536 + (L - 55296 << 10) + (v - 56320), p++), J += L < 128 ? 1 : L < 2048 ? 2 : L < 65536 ? 3 : 4;
							for (b = d.uint8array ? new Uint8Array(J) : new Array(J), p = l = 0; l < J; p++) (64512 & (L = x.charCodeAt(p))) == 55296 && p + 1 < M && (64512 & (v = x.charCodeAt(p + 1))) == 56320 && (L = 65536 + (L - 55296 << 10) + (v - 56320), p++), L < 128 ? b[l++] = L : (L < 2048 ? b[l++] = 192 | L >>> 6 : (L < 65536 ? b[l++] = 224 | L >>> 12 : (b[l++] = 240 | L >>> 18, b[l++] = 128 | L >>> 12 & 63), b[l++] = 128 | L >>> 6 & 63), b[l++] = 128 | 63 & L);
							return b;
						})(m);
					}, o.utf8decode = function(m) {
						return d.nodebuffer ? r.transformTo("nodebuffer", m).toString("utf-8") : (function(x) {
							var b, L, v, p, l = x.length, M = new Array(2 * l);
							for (b = L = 0; b < l;) if ((v = x[b++]) < 128) M[L++] = v;
							else if (4 < (p = f[v])) M[L++] = 65533, b += p - 1;
							else {
								for (v &= p === 2 ? 31 : p === 3 ? 15 : 7; 1 < p && b < l;) v = v << 6 | 63 & x[b++], p--;
								1 < p ? M[L++] = 65533 : v < 65536 ? M[L++] = v : (v -= 65536, M[L++] = 55296 | v >> 10 & 1023, M[L++] = 56320 | 1023 & v);
							}
							return M.length !== L && (M.subarray ? M = M.subarray(0, L) : M.length = L), r.applyFromCharCode(M);
						})(m = r.transformTo(d.uint8array ? "uint8array" : "array", m));
					}, r.inherits(T, g), T.prototype.processChunk = function(m) {
						var x = r.transformTo(d.uint8array ? "uint8array" : "array", m.data);
						if (this.leftOver && this.leftOver.length) {
							if (d.uint8array) {
								var b = x;
								(x = new Uint8Array(b.length + this.leftOver.length)).set(this.leftOver, 0), x.set(b, this.leftOver.length);
							} else x = this.leftOver.concat(x);
							this.leftOver = null;
						}
						var L = (function(p, l) {
							var M;
							for ((l = l || p.length) > p.length && (l = p.length), M = l - 1; 0 <= M && (192 & p[M]) == 128;) M--;
							return M < 0 || M === 0 ? l : M + f[p[M]] > l ? M : l;
						})(x), v = x;
						L !== x.length && (d.uint8array ? (v = x.subarray(0, L), this.leftOver = x.subarray(L, x.length)) : (v = x.slice(0, L), this.leftOver = x.slice(L, x.length))), this.push({
							data: o.utf8decode(v),
							meta: m.meta
						});
					}, T.prototype.flush = function() {
						this.leftOver && this.leftOver.length && (this.push({
							data: o.utf8decode(this.leftOver),
							meta: {}
						}), this.leftOver = null);
					}, o.Utf8DecodeWorker = T, r.inherits(w, g), w.prototype.processChunk = function(m) {
						this.push({
							data: o.utf8encode(m.data),
							meta: m.meta
						});
					}, o.Utf8EncodeWorker = w;
				}, {
					"./nodejsUtils": 14,
					"./stream/GenericWorker": 28,
					"./support": 30,
					"./utils": 32
				}],
				32: [function(a, h, o) {
					"use strict";
					var r = a("./support"), d = a("./base64"), s = a("./nodejsUtils"), g = a("./external");
					function f(b) {
						return b;
					}
					function D(b, L) {
						for (var v = 0; v < b.length; ++v) L[v] = 255 & b.charCodeAt(v);
						return L;
					}
					a("setimmediate"), o.newBlob = function(b, L) {
						o.checkSupport("blob");
						try {
							return new Blob([b], { type: L });
						} catch {
							try {
								var v = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
								return v.append(b), v.getBlob(L);
							} catch {
								throw new Error("Bug : can't construct the Blob.");
							}
						}
					};
					var T = {
						stringifyByChunk: function(b, L, v) {
							var p = [], l = 0, M = b.length;
							if (M <= v) return String.fromCharCode.apply(null, b);
							for (; l < M;) L === "array" || L === "nodebuffer" ? p.push(String.fromCharCode.apply(null, b.slice(l, Math.min(l + v, M)))) : p.push(String.fromCharCode.apply(null, b.subarray(l, Math.min(l + v, M)))), l += v;
							return p.join("");
						},
						stringifyByChar: function(b) {
							for (var L = "", v = 0; v < b.length; v++) L += String.fromCharCode(b[v]);
							return L;
						},
						applyCanBeUsed: {
							uint8array: (function() {
								try {
									return r.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
								} catch {
									return !1;
								}
							})(),
							nodebuffer: (function() {
								try {
									return r.nodebuffer && String.fromCharCode.apply(null, s.allocBuffer(1)).length === 1;
								} catch {
									return !1;
								}
							})()
						}
					};
					function w(b) {
						var L = 65536, v = o.getTypeOf(b), p = !0;
						if (v === "uint8array" ? p = T.applyCanBeUsed.uint8array : v === "nodebuffer" && (p = T.applyCanBeUsed.nodebuffer), p) for (; 1 < L;) try {
							return T.stringifyByChunk(b, v, L);
						} catch {
							L = Math.floor(L / 2);
						}
						return T.stringifyByChar(b);
					}
					function m(b, L) {
						for (var v = 0; v < b.length; v++) L[v] = b[v];
						return L;
					}
					o.applyFromCharCode = w;
					var x = {};
					x.string = {
						string: f,
						array: function(b) {
							return D(b, new Array(b.length));
						},
						arraybuffer: function(b) {
							return x.string.uint8array(b).buffer;
						},
						uint8array: function(b) {
							return D(b, new Uint8Array(b.length));
						},
						nodebuffer: function(b) {
							return D(b, s.allocBuffer(b.length));
						}
					}, x.array = {
						string: w,
						array: f,
						arraybuffer: function(b) {
							return new Uint8Array(b).buffer;
						},
						uint8array: function(b) {
							return new Uint8Array(b);
						},
						nodebuffer: function(b) {
							return s.newBufferFrom(b);
						}
					}, x.arraybuffer = {
						string: function(b) {
							return w(new Uint8Array(b));
						},
						array: function(b) {
							return m(new Uint8Array(b), new Array(b.byteLength));
						},
						arraybuffer: f,
						uint8array: function(b) {
							return new Uint8Array(b);
						},
						nodebuffer: function(b) {
							return s.newBufferFrom(new Uint8Array(b));
						}
					}, x.uint8array = {
						string: w,
						array: function(b) {
							return m(b, new Array(b.length));
						},
						arraybuffer: function(b) {
							return b.buffer;
						},
						uint8array: f,
						nodebuffer: function(b) {
							return s.newBufferFrom(b);
						}
					}, x.nodebuffer = {
						string: w,
						array: function(b) {
							return m(b, new Array(b.length));
						},
						arraybuffer: function(b) {
							return x.nodebuffer.uint8array(b).buffer;
						},
						uint8array: function(b) {
							return m(b, new Uint8Array(b.length));
						},
						nodebuffer: f
					}, o.transformTo = function(b, L) {
						return L = L || "", b ? (o.checkSupport(b), x[o.getTypeOf(L)][b](L)) : L;
					}, o.resolve = function(b) {
						for (var L = b.split("/"), v = [], p = 0; p < L.length; p++) {
							var l = L[p];
							l === "." || l === "" && p !== 0 && p !== L.length - 1 || (l === ".." ? v.pop() : v.push(l));
						}
						return v.join("/");
					}, o.getTypeOf = function(b) {
						return typeof b == "string" ? "string" : Object.prototype.toString.call(b) === "[object Array]" ? "array" : r.nodebuffer && s.isBuffer(b) ? "nodebuffer" : r.uint8array && b instanceof Uint8Array ? "uint8array" : r.arraybuffer && b instanceof ArrayBuffer ? "arraybuffer" : void 0;
					}, o.checkSupport = function(b) {
						if (!r[b.toLowerCase()]) throw new Error(b + " is not supported by this platform");
					}, o.MAX_VALUE_16BITS = 65535, o.MAX_VALUE_32BITS = -1, o.pretty = function(b) {
						var L, v, p = "";
						for (v = 0; v < (b || "").length; v++) p += "\\x" + ((L = b.charCodeAt(v)) < 16 ? "0" : "") + L.toString(16).toUpperCase();
						return p;
					}, o.delay = function(b, L, v) {
						setImmediate(function() {
							b.apply(v || null, L || []);
						});
					}, o.inherits = function(b, L) {
						function v() {}
						v.prototype = L.prototype, b.prototype = new v();
					}, o.extend = function() {
						var b, L, v = {};
						for (b = 0; b < arguments.length; b++) for (L in arguments[b]) Object.prototype.hasOwnProperty.call(arguments[b], L) && v[L] === void 0 && (v[L] = arguments[b][L]);
						return v;
					}, o.prepareContent = function(b, L, v, p, l) {
						return g.Promise.resolve(L).then(function(M) {
							return r.blob && (M instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(M)) !== -1) && typeof FileReader != "undefined" ? new g.Promise(function(J, se) {
								var ne = new FileReader();
								ne.onload = function(ce) {
									J(ce.target.result);
								}, ne.onerror = function(ce) {
									se(ce.target.error);
								}, ne.readAsArrayBuffer(M);
							}) : M;
						}).then(function(M) {
							var J = o.getTypeOf(M);
							return J ? (J === "arraybuffer" ? M = o.transformTo("uint8array", M) : J === "string" && (l ? M = d.decode(M) : v && p !== !0 && (M = (function(se) {
								return D(se, r.uint8array ? new Uint8Array(se.length) : new Array(se.length));
							})(M))), M) : g.Promise.reject(/* @__PURE__ */ new Error("Can't read the data of '" + b + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
						});
					};
				}, {
					"./base64": 1,
					"./external": 6,
					"./nodejsUtils": 14,
					"./support": 30,
					setimmediate: 54
				}],
				33: [function(a, h, o) {
					"use strict";
					var r = a("./reader/readerFor"), d = a("./utils"), s = a("./signature"), g = a("./zipEntry"), f = a("./support");
					function D(T) {
						this.files = [], this.loadOptions = T;
					}
					D.prototype = {
						checkSignature: function(T) {
							if (!this.reader.readAndCheckSignature(T)) {
								this.reader.index -= 4;
								var w = this.reader.readString(4);
								throw new Error("Corrupted zip or bug: unexpected signature (" + d.pretty(w) + ", expected " + d.pretty(T) + ")");
							}
						},
						isSignature: function(T, w) {
							var m = this.reader.index;
							this.reader.setIndex(T);
							var x = this.reader.readString(4) === w;
							return this.reader.setIndex(m), x;
						},
						readBlockEndOfCentral: function() {
							this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
							var T = this.reader.readData(this.zipCommentLength), w = f.uint8array ? "uint8array" : "array", m = d.transformTo(w, T);
							this.zipComment = this.loadOptions.decodeFileName(m);
						},
						readBlockZip64EndOfCentral: function() {
							this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
							for (var T, w, m, x = this.zip64EndOfCentralSize - 44; 0 < x;) T = this.reader.readInt(2), w = this.reader.readInt(4), m = this.reader.readData(w), this.zip64ExtensibleData[T] = {
								id: T,
								length: w,
								value: m
							};
						},
						readBlockZip64EndOfCentralLocator: function() {
							if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
						},
						readLocalFiles: function() {
							var T, w;
							for (T = 0; T < this.files.length; T++) w = this.files[T], this.reader.setIndex(w.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), w.readLocalPart(this.reader), w.handleUTF8(), w.processAttributes();
						},
						readCentralDir: function() {
							var T;
							for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);) (T = new g({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(T);
							if (this.centralDirRecords !== this.files.length && this.centralDirRecords !== 0 && this.files.length === 0) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
						},
						readEndOfCentral: function() {
							var T = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
							if (T < 0) throw this.isSignature(0, s.LOCAL_FILE_HEADER) ? /* @__PURE__ */ new Error("Corrupted zip: can't find end of central directory") : /* @__PURE__ */ new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
							this.reader.setIndex(T);
							var w = T;
							if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === d.MAX_VALUE_16BITS || this.diskWithCentralDirStart === d.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === d.MAX_VALUE_16BITS || this.centralDirRecords === d.MAX_VALUE_16BITS || this.centralDirSize === d.MAX_VALUE_32BITS || this.centralDirOffset === d.MAX_VALUE_32BITS) {
								if (this.zip64 = !0, (T = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
								if (this.reader.setIndex(T), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
								this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
							}
							var m = this.centralDirOffset + this.centralDirSize;
							this.zip64 && (m += 20, m += 12 + this.zip64EndOfCentralSize);
							var x = w - m;
							if (0 < x) this.isSignature(w, s.CENTRAL_FILE_HEADER) || (this.reader.zero = x);
							else if (x < 0) throw new Error("Corrupted zip: missing " + Math.abs(x) + " bytes.");
						},
						prepareReader: function(T) {
							this.reader = r(T);
						},
						load: function(T) {
							this.prepareReader(T), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
						}
					}, h.exports = D;
				}, {
					"./reader/readerFor": 22,
					"./signature": 23,
					"./support": 30,
					"./utils": 32,
					"./zipEntry": 34
				}],
				34: [function(a, h, o) {
					"use strict";
					var r = a("./reader/readerFor"), d = a("./utils"), s = a("./compressedObject"), g = a("./crc32"), f = a("./utf8"), D = a("./compressions"), T = a("./support");
					function w(m, x) {
						this.options = m, this.loadOptions = x;
					}
					w.prototype = {
						isEncrypted: function() {
							return (1 & this.bitFlag) == 1;
						},
						useUTF8: function() {
							return (2048 & this.bitFlag) == 2048;
						},
						readLocalPart: function(m) {
							var x, b;
							if (m.skip(22), this.fileNameLength = m.readInt(2), b = m.readInt(2), this.fileName = m.readData(this.fileNameLength), m.skip(b), this.compressedSize === -1 || this.uncompressedSize === -1) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
							if ((x = (function(L) {
								for (var v in D) if (Object.prototype.hasOwnProperty.call(D, v) && D[v].magic === L) return D[v];
								return null;
							})(this.compressionMethod)) === null) throw new Error("Corrupted zip : compression " + d.pretty(this.compressionMethod) + " unknown (inner file : " + d.transformTo("string", this.fileName) + ")");
							this.decompressed = new s(this.compressedSize, this.uncompressedSize, this.crc32, x, m.readData(this.compressedSize));
						},
						readCentralPart: function(m) {
							this.versionMadeBy = m.readInt(2), m.skip(2), this.bitFlag = m.readInt(2), this.compressionMethod = m.readString(2), this.date = m.readDate(), this.crc32 = m.readInt(4), this.compressedSize = m.readInt(4), this.uncompressedSize = m.readInt(4);
							var x = m.readInt(2);
							if (this.extraFieldsLength = m.readInt(2), this.fileCommentLength = m.readInt(2), this.diskNumberStart = m.readInt(2), this.internalFileAttributes = m.readInt(2), this.externalFileAttributes = m.readInt(4), this.localHeaderOffset = m.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
							m.skip(x), this.readExtraFields(m), this.parseZIP64ExtraField(m), this.fileComment = m.readData(this.fileCommentLength);
						},
						processAttributes: function() {
							this.unixPermissions = null, this.dosPermissions = null;
							var m = this.versionMadeBy >> 8;
							this.dir = !!(16 & this.externalFileAttributes), m == 0 && (this.dosPermissions = 63 & this.externalFileAttributes), m == 3 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || this.fileNameStr.slice(-1) !== "/" || (this.dir = !0);
						},
						parseZIP64ExtraField: function() {
							if (this.extraFields[1]) {
								var m = r(this.extraFields[1].value);
								this.uncompressedSize === d.MAX_VALUE_32BITS && (this.uncompressedSize = m.readInt(8)), this.compressedSize === d.MAX_VALUE_32BITS && (this.compressedSize = m.readInt(8)), this.localHeaderOffset === d.MAX_VALUE_32BITS && (this.localHeaderOffset = m.readInt(8)), this.diskNumberStart === d.MAX_VALUE_32BITS && (this.diskNumberStart = m.readInt(4));
							}
						},
						readExtraFields: function(m) {
							var x, b, L, v = m.index + this.extraFieldsLength;
							for (this.extraFields || (this.extraFields = {}); m.index + 4 < v;) x = m.readInt(2), b = m.readInt(2), L = m.readData(b), this.extraFields[x] = {
								id: x,
								length: b,
								value: L
							};
							m.setIndex(v);
						},
						handleUTF8: function() {
							var m = T.uint8array ? "uint8array" : "array";
							if (this.useUTF8()) this.fileNameStr = f.utf8decode(this.fileName), this.fileCommentStr = f.utf8decode(this.fileComment);
							else {
								var x = this.findExtraFieldUnicodePath();
								if (x !== null) this.fileNameStr = x;
								else {
									var b = d.transformTo(m, this.fileName);
									this.fileNameStr = this.loadOptions.decodeFileName(b);
								}
								var L = this.findExtraFieldUnicodeComment();
								if (L !== null) this.fileCommentStr = L;
								else {
									var v = d.transformTo(m, this.fileComment);
									this.fileCommentStr = this.loadOptions.decodeFileName(v);
								}
							}
						},
						findExtraFieldUnicodePath: function() {
							var m = this.extraFields[28789];
							if (m) {
								var x = r(m.value);
								return x.readInt(1) !== 1 || g(this.fileName) !== x.readInt(4) ? null : f.utf8decode(x.readData(m.length - 5));
							}
							return null;
						},
						findExtraFieldUnicodeComment: function() {
							var m = this.extraFields[25461];
							if (m) {
								var x = r(m.value);
								return x.readInt(1) !== 1 || g(this.fileComment) !== x.readInt(4) ? null : f.utf8decode(x.readData(m.length - 5));
							}
							return null;
						}
					}, h.exports = w;
				}, {
					"./compressedObject": 2,
					"./compressions": 3,
					"./crc32": 4,
					"./reader/readerFor": 22,
					"./support": 30,
					"./utf8": 31,
					"./utils": 32
				}],
				35: [function(a, h, o) {
					"use strict";
					function r(x, b, L) {
						this.name = x, this.dir = L.dir, this.date = L.date, this.comment = L.comment, this.unixPermissions = L.unixPermissions, this.dosPermissions = L.dosPermissions, this._data = b, this._dataBinary = L.binary, this.options = {
							compression: L.compression,
							compressionOptions: L.compressionOptions
						};
					}
					var d = a("./stream/StreamHelper"), s = a("./stream/DataWorker"), g = a("./utf8"), f = a("./compressedObject"), D = a("./stream/GenericWorker");
					r.prototype = {
						internalStream: function(x) {
							var b = null, L = "string";
							try {
								if (!x) throw new Error("No output type specified.");
								var v = (L = x.toLowerCase()) === "string" || L === "text";
								L !== "binarystring" && L !== "text" || (L = "string"), b = this._decompressWorker();
								var p = !this._dataBinary;
								p && !v && (b = b.pipe(new g.Utf8EncodeWorker())), !p && v && (b = b.pipe(new g.Utf8DecodeWorker()));
							} catch (l) {
								(b = new D("error")).error(l);
							}
							return new d(b, L, "");
						},
						async: function(x, b) {
							return this.internalStream(x).accumulate(b);
						},
						nodeStream: function(x, b) {
							return this.internalStream(x || "nodebuffer").toNodejsStream(b);
						},
						_compressWorker: function(x, b) {
							if (this._data instanceof f && this._data.compression.magic === x.magic) return this._data.getCompressedWorker();
							var L = this._decompressWorker();
							return this._dataBinary || (L = L.pipe(new g.Utf8EncodeWorker())), f.createWorkerFrom(L, x, b);
						},
						_decompressWorker: function() {
							return this._data instanceof f ? this._data.getContentWorker() : this._data instanceof D ? this._data : new s(this._data);
						}
					};
					for (var T = [
						"asText",
						"asBinary",
						"asNodeBuffer",
						"asUint8Array",
						"asArrayBuffer"
					], w = function() {
						throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
					}, m = 0; m < T.length; m++) r.prototype[T[m]] = w;
					h.exports = r;
				}, {
					"./compressedObject": 2,
					"./stream/DataWorker": 27,
					"./stream/GenericWorker": 28,
					"./stream/StreamHelper": 29,
					"./utf8": 31
				}],
				36: [function(a, h, o) {
					(function(r) {
						"use strict";
						var d, s, g = r.MutationObserver || r.WebKitMutationObserver;
						if (g) {
							var f = 0, D = new g(x), T = r.document.createTextNode("");
							D.observe(T, { characterData: !0 }), d = function() {
								T.data = f = ++f % 2;
							};
						} else if (r.setImmediate || r.MessageChannel === void 0) d = "document" in r && "onreadystatechange" in r.document.createElement("script") ? function() {
							var b = r.document.createElement("script");
							b.onreadystatechange = function() {
								x(), b.onreadystatechange = null, b.parentNode.removeChild(b), b = null;
							}, r.document.documentElement.appendChild(b);
						} : function() {
							setTimeout(x, 0);
						};
						else {
							var w = new r.MessageChannel();
							w.port1.onmessage = x, d = function() {
								w.port2.postMessage(0);
							};
						}
						var m = [];
						function x() {
							var b, L;
							s = !0;
							for (var v = m.length; v;) {
								for (L = m, m = [], b = -1; ++b < v;) L[b]();
								v = m.length;
							}
							s = !1;
						}
						h.exports = function(b) {
							m.push(b) !== 1 || s || d();
						};
					}).call(this, typeof global != "undefined" ? global : typeof self != "undefined" ? self : typeof window != "undefined" ? window : {});
				}, {}],
				37: [function(a, h, o) {
					"use strict";
					var r = a("immediate");
					function d() {}
					var s = {}, g = ["REJECTED"], f = ["FULFILLED"], D = ["PENDING"];
					function T(v) {
						if (typeof v != "function") throw new TypeError("resolver must be a function");
						this.state = D, this.queue = [], this.outcome = void 0, v !== d && b(this, v);
					}
					function w(v, p, l) {
						this.promise = v, typeof p == "function" && (this.onFulfilled = p, this.callFulfilled = this.otherCallFulfilled), typeof l == "function" && (this.onRejected = l, this.callRejected = this.otherCallRejected);
					}
					function m(v, p, l) {
						r(function() {
							var M;
							try {
								M = p(l);
							} catch (J) {
								return s.reject(v, J);
							}
							M === v ? s.reject(v, /* @__PURE__ */ new TypeError("Cannot resolve promise with itself")) : s.resolve(v, M);
						});
					}
					function x(v) {
						var p = v && v.then;
						if (v && (typeof v == "object" || typeof v == "function") && typeof p == "function") return function() {
							p.apply(v, arguments);
						};
					}
					function b(v, p) {
						var l = !1;
						function M(ne) {
							l || (l = !0, s.reject(v, ne));
						}
						function J(ne) {
							l || (l = !0, s.resolve(v, ne));
						}
						var se = L(function() {
							p(J, M);
						});
						se.status === "error" && M(se.value);
					}
					function L(v, p) {
						var l = {};
						try {
							l.value = v(p), l.status = "success";
						} catch (M) {
							l.status = "error", l.value = M;
						}
						return l;
					}
					(h.exports = T).prototype.finally = function(v) {
						if (typeof v != "function") return this;
						var p = this.constructor;
						return this.then(function(l) {
							return p.resolve(v()).then(function() {
								return l;
							});
						}, function(l) {
							return p.resolve(v()).then(function() {
								throw l;
							});
						});
					}, T.prototype.catch = function(v) {
						return this.then(null, v);
					}, T.prototype.then = function(v, p) {
						if (typeof v != "function" && this.state === f || typeof p != "function" && this.state === g) return this;
						var l = new this.constructor(d);
						return this.state !== D ? m(l, this.state === f ? v : p, this.outcome) : this.queue.push(new w(l, v, p)), l;
					}, w.prototype.callFulfilled = function(v) {
						s.resolve(this.promise, v);
					}, w.prototype.otherCallFulfilled = function(v) {
						m(this.promise, this.onFulfilled, v);
					}, w.prototype.callRejected = function(v) {
						s.reject(this.promise, v);
					}, w.prototype.otherCallRejected = function(v) {
						m(this.promise, this.onRejected, v);
					}, s.resolve = function(v, p) {
						var l = L(x, p);
						if (l.status === "error") return s.reject(v, l.value);
						var M = l.value;
						if (M) b(v, M);
						else {
							v.state = f, v.outcome = p;
							for (var J = -1, se = v.queue.length; ++J < se;) v.queue[J].callFulfilled(p);
						}
						return v;
					}, s.reject = function(v, p) {
						v.state = g, v.outcome = p;
						for (var l = -1, M = v.queue.length; ++l < M;) v.queue[l].callRejected(p);
						return v;
					}, T.resolve = function(v) {
						return v instanceof this ? v : s.resolve(new this(d), v);
					}, T.reject = function(v) {
						var p = new this(d);
						return s.reject(p, v);
					}, T.all = function(v) {
						var p = this;
						if (Object.prototype.toString.call(v) !== "[object Array]") return this.reject(/* @__PURE__ */ new TypeError("must be an array"));
						var l = v.length, M = !1;
						if (!l) return this.resolve([]);
						for (var J = new Array(l), se = 0, ne = -1, ce = new this(d); ++ne < l;) N(v[ne], ne);
						return ce;
						function N(ke, ve) {
							p.resolve(ke).then(function(S) {
								J[ve] = S, ++se !== l || M || (M = !0, s.resolve(ce, J));
							}, function(S) {
								M || (M = !0, s.reject(ce, S));
							});
						}
					}, T.race = function(v) {
						var p = this;
						if (Object.prototype.toString.call(v) !== "[object Array]") return this.reject(/* @__PURE__ */ new TypeError("must be an array"));
						var l = v.length, M = !1;
						if (!l) return this.resolve([]);
						for (var J = -1, se = new this(d); ++J < l;) ne = v[J], p.resolve(ne).then(function(ce) {
							M || (M = !0, s.resolve(se, ce));
						}, function(ce) {
							M || (M = !0, s.reject(se, ce));
						});
						var ne;
						return se;
					};
				}, { immediate: 36 }],
				38: [function(a, h, o) {
					"use strict";
					var r = {};
					(0, a("./lib/utils/common").assign)(r, a("./lib/deflate"), a("./lib/inflate"), a("./lib/zlib/constants")), h.exports = r;
				}, {
					"./lib/deflate": 39,
					"./lib/inflate": 40,
					"./lib/utils/common": 41,
					"./lib/zlib/constants": 44
				}],
				39: [function(a, h, o) {
					"use strict";
					var r = a("./zlib/deflate"), d = a("./utils/common"), s = a("./utils/strings"), g = a("./zlib/messages"), f = a("./zlib/zstream"), D = Object.prototype.toString, T = 0, w = -1, m = 0, x = 8;
					function b(v) {
						if (!(this instanceof b)) return new b(v);
						this.options = d.assign({
							level: w,
							method: x,
							chunkSize: 16384,
							windowBits: 15,
							memLevel: 8,
							strategy: m,
							to: ""
						}, v || {});
						var p = this.options;
						p.raw && 0 < p.windowBits ? p.windowBits = -p.windowBits : p.gzip && 0 < p.windowBits && p.windowBits < 16 && (p.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new f(), this.strm.avail_out = 0;
						var l = r.deflateInit2(this.strm, p.level, p.method, p.windowBits, p.memLevel, p.strategy);
						if (l !== T) throw new Error(g[l]);
						if (p.header && r.deflateSetHeader(this.strm, p.header), p.dictionary) {
							var M;
							if (M = typeof p.dictionary == "string" ? s.string2buf(p.dictionary) : D.call(p.dictionary) === "[object ArrayBuffer]" ? new Uint8Array(p.dictionary) : p.dictionary, (l = r.deflateSetDictionary(this.strm, M)) !== T) throw new Error(g[l]);
							this._dict_set = !0;
						}
					}
					function L(v, p) {
						var l = new b(p);
						if (l.push(v, !0), l.err) throw l.msg || g[l.err];
						return l.result;
					}
					b.prototype.push = function(v, p) {
						var l, M, J = this.strm, se = this.options.chunkSize;
						if (this.ended) return !1;
						M = p === ~~p ? p : p === !0 ? 4 : 0, typeof v == "string" ? J.input = s.string2buf(v) : D.call(v) === "[object ArrayBuffer]" ? J.input = new Uint8Array(v) : J.input = v, J.next_in = 0, J.avail_in = J.input.length;
						do {
							if (J.avail_out === 0 && (J.output = new d.Buf8(se), J.next_out = 0, J.avail_out = se), (l = r.deflate(J, M)) !== 1 && l !== T) return this.onEnd(l), !(this.ended = !0);
							J.avail_out !== 0 && (J.avail_in !== 0 || M !== 4 && M !== 2) || (this.options.to === "string" ? this.onData(s.buf2binstring(d.shrinkBuf(J.output, J.next_out))) : this.onData(d.shrinkBuf(J.output, J.next_out)));
						} while ((0 < J.avail_in || J.avail_out === 0) && l !== 1);
						return M === 4 ? (l = r.deflateEnd(this.strm), this.onEnd(l), this.ended = !0, l === T) : M !== 2 || (this.onEnd(T), !(J.avail_out = 0));
					}, b.prototype.onData = function(v) {
						this.chunks.push(v);
					}, b.prototype.onEnd = function(v) {
						v === T && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = v, this.msg = this.strm.msg;
					}, o.Deflate = b, o.deflate = L, o.deflateRaw = function(v, p) {
						return (p = p || {}).raw = !0, L(v, p);
					}, o.gzip = function(v, p) {
						return (p = p || {}).gzip = !0, L(v, p);
					};
				}, {
					"./utils/common": 41,
					"./utils/strings": 42,
					"./zlib/deflate": 46,
					"./zlib/messages": 51,
					"./zlib/zstream": 53
				}],
				40: [function(a, h, o) {
					"use strict";
					var r = a("./zlib/inflate"), d = a("./utils/common"), s = a("./utils/strings"), g = a("./zlib/constants"), f = a("./zlib/messages"), D = a("./zlib/zstream"), T = a("./zlib/gzheader"), w = Object.prototype.toString;
					function m(b) {
						if (!(this instanceof m)) return new m(b);
						this.options = d.assign({
							chunkSize: 16384,
							windowBits: 0,
							to: ""
						}, b || {});
						var L = this.options;
						L.raw && 0 <= L.windowBits && L.windowBits < 16 && (L.windowBits = -L.windowBits, L.windowBits === 0 && (L.windowBits = -15)), !(0 <= L.windowBits && L.windowBits < 16) || b && b.windowBits || (L.windowBits += 32), 15 < L.windowBits && L.windowBits < 48 && !(15 & L.windowBits) && (L.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new D(), this.strm.avail_out = 0;
						var v = r.inflateInit2(this.strm, L.windowBits);
						if (v !== g.Z_OK) throw new Error(f[v]);
						this.header = new T(), r.inflateGetHeader(this.strm, this.header);
					}
					function x(b, L) {
						var v = new m(L);
						if (v.push(b, !0), v.err) throw v.msg || f[v.err];
						return v.result;
					}
					m.prototype.push = function(b, L) {
						var v, p, l, M, J, se, ne = this.strm, ce = this.options.chunkSize, N = this.options.dictionary, ke = !1;
						if (this.ended) return !1;
						p = L === ~~L ? L : L === !0 ? g.Z_FINISH : g.Z_NO_FLUSH, typeof b == "string" ? ne.input = s.binstring2buf(b) : w.call(b) === "[object ArrayBuffer]" ? ne.input = new Uint8Array(b) : ne.input = b, ne.next_in = 0, ne.avail_in = ne.input.length;
						do {
							if (ne.avail_out === 0 && (ne.output = new d.Buf8(ce), ne.next_out = 0, ne.avail_out = ce), (v = r.inflate(ne, g.Z_NO_FLUSH)) === g.Z_NEED_DICT && N && (se = typeof N == "string" ? s.string2buf(N) : w.call(N) === "[object ArrayBuffer]" ? new Uint8Array(N) : N, v = r.inflateSetDictionary(this.strm, se)), v === g.Z_BUF_ERROR && ke === !0 && (v = g.Z_OK, ke = !1), v !== g.Z_STREAM_END && v !== g.Z_OK) return this.onEnd(v), !(this.ended = !0);
							ne.next_out && (ne.avail_out !== 0 && v !== g.Z_STREAM_END && (ne.avail_in !== 0 || p !== g.Z_FINISH && p !== g.Z_SYNC_FLUSH) || (this.options.to === "string" ? (l = s.utf8border(ne.output, ne.next_out), M = ne.next_out - l, J = s.buf2string(ne.output, l), ne.next_out = M, ne.avail_out = ce - M, M && d.arraySet(ne.output, ne.output, l, M, 0), this.onData(J)) : this.onData(d.shrinkBuf(ne.output, ne.next_out)))), ne.avail_in === 0 && ne.avail_out === 0 && (ke = !0);
						} while ((0 < ne.avail_in || ne.avail_out === 0) && v !== g.Z_STREAM_END);
						return v === g.Z_STREAM_END && (p = g.Z_FINISH), p === g.Z_FINISH ? (v = r.inflateEnd(this.strm), this.onEnd(v), this.ended = !0, v === g.Z_OK) : p !== g.Z_SYNC_FLUSH || (this.onEnd(g.Z_OK), !(ne.avail_out = 0));
					}, m.prototype.onData = function(b) {
						this.chunks.push(b);
					}, m.prototype.onEnd = function(b) {
						b === g.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = b, this.msg = this.strm.msg;
					}, o.Inflate = m, o.inflate = x, o.inflateRaw = function(b, L) {
						return (L = L || {}).raw = !0, x(b, L);
					}, o.ungzip = x;
				}, {
					"./utils/common": 41,
					"./utils/strings": 42,
					"./zlib/constants": 44,
					"./zlib/gzheader": 47,
					"./zlib/inflate": 49,
					"./zlib/messages": 51,
					"./zlib/zstream": 53
				}],
				41: [function(a, h, o) {
					"use strict";
					var r = typeof Uint8Array != "undefined" && typeof Uint16Array != "undefined" && typeof Int32Array != "undefined";
					o.assign = function(g) {
						for (var f = Array.prototype.slice.call(arguments, 1); f.length;) {
							var D = f.shift();
							if (D) {
								if (typeof D != "object") throw new TypeError(D + "must be non-object");
								for (var T in D) D.hasOwnProperty(T) && (g[T] = D[T]);
							}
						}
						return g;
					}, o.shrinkBuf = function(g, f) {
						return g.length === f ? g : g.subarray ? g.subarray(0, f) : (g.length = f, g);
					};
					var d = {
						arraySet: function(g, f, D, T, w) {
							if (f.subarray && g.subarray) g.set(f.subarray(D, D + T), w);
							else for (var m = 0; m < T; m++) g[w + m] = f[D + m];
						},
						flattenChunks: function(g) {
							var f, D, T, w, m, x;
							for (f = T = 0, D = g.length; f < D; f++) T += g[f].length;
							for (x = new Uint8Array(T), f = w = 0, D = g.length; f < D; f++) m = g[f], x.set(m, w), w += m.length;
							return x;
						}
					}, s = {
						arraySet: function(g, f, D, T, w) {
							for (var m = 0; m < T; m++) g[w + m] = f[D + m];
						},
						flattenChunks: function(g) {
							return [].concat.apply([], g);
						}
					};
					o.setTyped = function(g) {
						g ? (o.Buf8 = Uint8Array, o.Buf16 = Uint16Array, o.Buf32 = Int32Array, o.assign(o, d)) : (o.Buf8 = Array, o.Buf16 = Array, o.Buf32 = Array, o.assign(o, s));
					}, o.setTyped(r);
				}, {}],
				42: [function(a, h, o) {
					"use strict";
					var r = a("./common"), d = !0, s = !0;
					try {
						String.fromCharCode.apply(null, [0]);
					} catch {
						d = !1;
					}
					try {
						String.fromCharCode.apply(null, new Uint8Array(1));
					} catch {
						s = !1;
					}
					for (var g = new r.Buf8(256), f = 0; f < 256; f++) g[f] = 252 <= f ? 6 : 248 <= f ? 5 : 240 <= f ? 4 : 224 <= f ? 3 : 192 <= f ? 2 : 1;
					function D(T, w) {
						if (w < 65537 && (T.subarray && s || !T.subarray && d)) return String.fromCharCode.apply(null, r.shrinkBuf(T, w));
						for (var m = "", x = 0; x < w; x++) m += String.fromCharCode(T[x]);
						return m;
					}
					g[254] = g[254] = 1, o.string2buf = function(T) {
						var w, m, x, b, L, v = T.length, p = 0;
						for (b = 0; b < v; b++) (64512 & (m = T.charCodeAt(b))) == 55296 && b + 1 < v && (64512 & (x = T.charCodeAt(b + 1))) == 56320 && (m = 65536 + (m - 55296 << 10) + (x - 56320), b++), p += m < 128 ? 1 : m < 2048 ? 2 : m < 65536 ? 3 : 4;
						for (w = new r.Buf8(p), b = L = 0; L < p; b++) (64512 & (m = T.charCodeAt(b))) == 55296 && b + 1 < v && (64512 & (x = T.charCodeAt(b + 1))) == 56320 && (m = 65536 + (m - 55296 << 10) + (x - 56320), b++), m < 128 ? w[L++] = m : (m < 2048 ? w[L++] = 192 | m >>> 6 : (m < 65536 ? w[L++] = 224 | m >>> 12 : (w[L++] = 240 | m >>> 18, w[L++] = 128 | m >>> 12 & 63), w[L++] = 128 | m >>> 6 & 63), w[L++] = 128 | 63 & m);
						return w;
					}, o.buf2binstring = function(T) {
						return D(T, T.length);
					}, o.binstring2buf = function(T) {
						for (var w = new r.Buf8(T.length), m = 0, x = w.length; m < x; m++) w[m] = T.charCodeAt(m);
						return w;
					}, o.buf2string = function(T, w) {
						var m, x, b, L, v = w || T.length, p = new Array(2 * v);
						for (m = x = 0; m < v;) if ((b = T[m++]) < 128) p[x++] = b;
						else if (4 < (L = g[b])) p[x++] = 65533, m += L - 1;
						else {
							for (b &= L === 2 ? 31 : L === 3 ? 15 : 7; 1 < L && m < v;) b = b << 6 | 63 & T[m++], L--;
							1 < L ? p[x++] = 65533 : b < 65536 ? p[x++] = b : (b -= 65536, p[x++] = 55296 | b >> 10 & 1023, p[x++] = 56320 | 1023 & b);
						}
						return D(p, x);
					}, o.utf8border = function(T, w) {
						var m;
						for ((w = w || T.length) > T.length && (w = T.length), m = w - 1; 0 <= m && (192 & T[m]) == 128;) m--;
						return m < 0 || m === 0 ? w : m + g[T[m]] > w ? m : w;
					};
				}, { "./common": 41 }],
				43: [function(a, h, o) {
					"use strict";
					h.exports = function(r, d, s, g) {
						for (var f = 65535 & r | 0, D = r >>> 16 & 65535 | 0, T = 0; s !== 0;) {
							for (s -= T = 2e3 < s ? 2e3 : s; D = D + (f = f + d[g++] | 0) | 0, --T;);
							f %= 65521, D %= 65521;
						}
						return f | D << 16 | 0;
					};
				}, {}],
				44: [function(a, h, o) {
					"use strict";
					h.exports = {
						Z_NO_FLUSH: 0,
						Z_PARTIAL_FLUSH: 1,
						Z_SYNC_FLUSH: 2,
						Z_FULL_FLUSH: 3,
						Z_FINISH: 4,
						Z_BLOCK: 5,
						Z_TREES: 6,
						Z_OK: 0,
						Z_STREAM_END: 1,
						Z_NEED_DICT: 2,
						Z_ERRNO: -1,
						Z_STREAM_ERROR: -2,
						Z_DATA_ERROR: -3,
						Z_BUF_ERROR: -5,
						Z_NO_COMPRESSION: 0,
						Z_BEST_SPEED: 1,
						Z_BEST_COMPRESSION: 9,
						Z_DEFAULT_COMPRESSION: -1,
						Z_FILTERED: 1,
						Z_HUFFMAN_ONLY: 2,
						Z_RLE: 3,
						Z_FIXED: 4,
						Z_DEFAULT_STRATEGY: 0,
						Z_BINARY: 0,
						Z_TEXT: 1,
						Z_UNKNOWN: 2,
						Z_DEFLATED: 8
					};
				}, {}],
				45: [function(a, h, o) {
					"use strict";
					var r = (function() {
						for (var d, s = [], g = 0; g < 256; g++) {
							d = g;
							for (var f = 0; f < 8; f++) d = 1 & d ? 3988292384 ^ d >>> 1 : d >>> 1;
							s[g] = d;
						}
						return s;
					})();
					h.exports = function(d, s, g, f) {
						var D = r, T = f + g;
						d ^= -1;
						for (var w = f; w < T; w++) d = d >>> 8 ^ D[255 & (d ^ s[w])];
						return -1 ^ d;
					};
				}, {}],
				46: [function(a, h, o) {
					"use strict";
					var r, d = a("../utils/common"), s = a("./trees"), g = a("./adler32"), f = a("./crc32"), D = a("./messages"), T = 0, w = 4, m = 0, x = -2, b = -1, L = 4, v = 2, p = 8, l = 9, M = 286, J = 30, se = 19, ne = 2 * M + 1, ce = 15, N = 3, ke = 258, ve = ke + N + 1, S = 42, K = 113, y = 1, X = 2, le = 3, t = 4;
					function n(u, De) {
						return u.msg = D[De], De;
					}
					function pe(u) {
						return (u << 1) - (4 < u ? 9 : 0);
					}
					function Be(u) {
						for (var De = u.length; 0 <= --De;) u[De] = 0;
					}
					function W(u) {
						var De = u.state, de = De.pending;
						de > u.avail_out && (de = u.avail_out), de !== 0 && (d.arraySet(u.output, De.pending_buf, De.pending_out, de, u.next_out), u.next_out += de, De.pending_out += de, u.total_out += de, u.avail_out -= de, De.pending -= de, De.pending === 0 && (De.pending_out = 0));
					}
					function _(u, De) {
						s._tr_flush_block(u, 0 <= u.block_start ? u.block_start : -1, u.strstart - u.block_start, De), u.block_start = u.strstart, W(u.strm);
					}
					function H(u, De) {
						u.pending_buf[u.pending++] = De;
					}
					function Le(u, De) {
						u.pending_buf[u.pending++] = De >>> 8 & 255, u.pending_buf[u.pending++] = 255 & De;
					}
					function Te(u, De) {
						var de, z, E = u.max_chain_length, Q = u.strstart, Fe = u.prev_length, Ce = u.nice_match, re = u.strstart > u.w_size - ve ? u.strstart - (u.w_size - ve) : 0, Pe = u.window, He = u.w_mask, We = u.prev, ia = u.strstart + ke, za = Pe[Q + Fe - 1], Ia = Pe[Q + Fe];
						u.prev_length >= u.good_match && (E >>= 2), Ce > u.lookahead && (Ce = u.lookahead);
						do
							if (Pe[(de = De) + Fe] === Ia && Pe[de + Fe - 1] === za && Pe[de] === Pe[Q] && Pe[++de] === Pe[Q + 1]) {
								Q += 2, de++;
								do								;
while (Pe[++Q] === Pe[++de] && Pe[++Q] === Pe[++de] && Pe[++Q] === Pe[++de] && Pe[++Q] === Pe[++de] && Pe[++Q] === Pe[++de] && Pe[++Q] === Pe[++de] && Pe[++Q] === Pe[++de] && Pe[++Q] === Pe[++de] && Q < ia);
								if (z = ke - (ia - Q), Q = ia - ke, Fe < z) {
									if (u.match_start = De, Ce <= (Fe = z)) break;
									za = Pe[Q + Fe - 1], Ia = Pe[Q + Fe];
								}
							}
						while ((De = We[De & He]) > re && --E != 0);
						return Fe <= u.lookahead ? Fe : u.lookahead;
					}
					function Ua(u) {
						var De, de, z, E, Q, Fe, Ce, re, Pe, He, We = u.w_size;
						do {
							if (E = u.window_size - u.lookahead - u.strstart, u.strstart >= We + (We - ve)) {
								for (d.arraySet(u.window, u.window, We, We, 0), u.match_start -= We, u.strstart -= We, u.block_start -= We, De = de = u.hash_size; z = u.head[--De], u.head[De] = We <= z ? z - We : 0, --de;);
								for (De = de = We; z = u.prev[--De], u.prev[De] = We <= z ? z - We : 0, --de;);
								E += We;
							}
							if (u.strm.avail_in === 0) break;
							if (Fe = u.strm, Ce = u.window, re = u.strstart + u.lookahead, Pe = E, He = void 0, He = Fe.avail_in, Pe < He && (He = Pe), de = He === 0 ? 0 : (Fe.avail_in -= He, d.arraySet(Ce, Fe.input, Fe.next_in, He, re), Fe.state.wrap === 1 ? Fe.adler = g(Fe.adler, Ce, He, re) : Fe.state.wrap === 2 && (Fe.adler = f(Fe.adler, Ce, He, re)), Fe.next_in += He, Fe.total_in += He, He), u.lookahead += de, u.lookahead + u.insert >= N) for (Q = u.strstart - u.insert, u.ins_h = u.window[Q], u.ins_h = (u.ins_h << u.hash_shift ^ u.window[Q + 1]) & u.hash_mask; u.insert && (u.ins_h = (u.ins_h << u.hash_shift ^ u.window[Q + N - 1]) & u.hash_mask, u.prev[Q & u.w_mask] = u.head[u.ins_h], u.head[u.ins_h] = Q, Q++, u.insert--, !(u.lookahead + u.insert < N)););
						} while (u.lookahead < ve && u.strm.avail_in !== 0);
					}
					function ya(u, De) {
						for (var de, z;;) {
							if (u.lookahead < ve) {
								if (Ua(u), u.lookahead < ve && De === T) return y;
								if (u.lookahead === 0) break;
							}
							if (de = 0, u.lookahead >= N && (u.ins_h = (u.ins_h << u.hash_shift ^ u.window[u.strstart + N - 1]) & u.hash_mask, de = u.prev[u.strstart & u.w_mask] = u.head[u.ins_h], u.head[u.ins_h] = u.strstart), de !== 0 && u.strstart - de <= u.w_size - ve && (u.match_length = Te(u, de)), u.match_length >= N) if (z = s._tr_tally(u, u.strstart - u.match_start, u.match_length - N), u.lookahead -= u.match_length, u.match_length <= u.max_lazy_match && u.lookahead >= N) {
								for (u.match_length--; u.strstart++, u.ins_h = (u.ins_h << u.hash_shift ^ u.window[u.strstart + N - 1]) & u.hash_mask, de = u.prev[u.strstart & u.w_mask] = u.head[u.ins_h], u.head[u.ins_h] = u.strstart, --u.match_length != 0;);
								u.strstart++;
							} else u.strstart += u.match_length, u.match_length = 0, u.ins_h = u.window[u.strstart], u.ins_h = (u.ins_h << u.hash_shift ^ u.window[u.strstart + 1]) & u.hash_mask;
							else z = s._tr_tally(u, 0, u.window[u.strstart]), u.lookahead--, u.strstart++;
							if (z && (_(u, !1), u.strm.avail_out === 0)) return y;
						}
						return u.insert = u.strstart < N - 1 ? u.strstart : N - 1, De === w ? (_(u, !0), u.strm.avail_out === 0 ? le : t) : u.last_lit && (_(u, !1), u.strm.avail_out === 0) ? y : X;
					}
					function pa(u, De) {
						for (var de, z, E;;) {
							if (u.lookahead < ve) {
								if (Ua(u), u.lookahead < ve && De === T) return y;
								if (u.lookahead === 0) break;
							}
							if (de = 0, u.lookahead >= N && (u.ins_h = (u.ins_h << u.hash_shift ^ u.window[u.strstart + N - 1]) & u.hash_mask, de = u.prev[u.strstart & u.w_mask] = u.head[u.ins_h], u.head[u.ins_h] = u.strstart), u.prev_length = u.match_length, u.prev_match = u.match_start, u.match_length = N - 1, de !== 0 && u.prev_length < u.max_lazy_match && u.strstart - de <= u.w_size - ve && (u.match_length = Te(u, de), u.match_length <= 5 && (u.strategy === 1 || u.match_length === N && 4096 < u.strstart - u.match_start) && (u.match_length = N - 1)), u.prev_length >= N && u.match_length <= u.prev_length) {
								for (E = u.strstart + u.lookahead - N, z = s._tr_tally(u, u.strstart - 1 - u.prev_match, u.prev_length - N), u.lookahead -= u.prev_length - 1, u.prev_length -= 2; ++u.strstart <= E && (u.ins_h = (u.ins_h << u.hash_shift ^ u.window[u.strstart + N - 1]) & u.hash_mask, de = u.prev[u.strstart & u.w_mask] = u.head[u.ins_h], u.head[u.ins_h] = u.strstart), --u.prev_length != 0;);
								if (u.match_available = 0, u.match_length = N - 1, u.strstart++, z && (_(u, !1), u.strm.avail_out === 0)) return y;
							} else if (u.match_available) {
								if ((z = s._tr_tally(u, 0, u.window[u.strstart - 1])) && _(u, !1), u.strstart++, u.lookahead--, u.strm.avail_out === 0) return y;
							} else u.match_available = 1, u.strstart++, u.lookahead--;
						}
						return u.match_available && (z = s._tr_tally(u, 0, u.window[u.strstart - 1]), u.match_available = 0), u.insert = u.strstart < N - 1 ? u.strstart : N - 1, De === w ? (_(u, !0), u.strm.avail_out === 0 ? le : t) : u.last_lit && (_(u, !1), u.strm.avail_out === 0) ? y : X;
					}
					function na(u, De, de, z, E) {
						this.good_length = u, this.max_lazy = De, this.nice_length = de, this.max_chain = z, this.func = E;
					}
					function U() {
						this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = p, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new d.Buf16(2 * ne), this.dyn_dtree = new d.Buf16(2 * (2 * J + 1)), this.bl_tree = new d.Buf16(2 * (2 * se + 1)), Be(this.dyn_ltree), Be(this.dyn_dtree), Be(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new d.Buf16(ce + 1), this.heap = new d.Buf16(2 * M + 1), Be(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new d.Buf16(2 * M + 1), Be(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
					}
					function ga(u) {
						var De;
						return u && u.state ? (u.total_in = u.total_out = 0, u.data_type = v, (De = u.state).pending = 0, De.pending_out = 0, De.wrap < 0 && (De.wrap = -De.wrap), De.status = De.wrap ? S : K, u.adler = De.wrap === 2 ? 0 : 1, De.last_flush = T, s._tr_init(De), m) : n(u, x);
					}
					function Ba(u) {
						var De = ga(u);
						return De === m && (function(de) {
							de.window_size = 2 * de.w_size, Be(de.head), de.max_lazy_match = r[de.level].max_lazy, de.good_match = r[de.level].good_length, de.nice_match = r[de.level].nice_length, de.max_chain_length = r[de.level].max_chain, de.strstart = 0, de.block_start = 0, de.lookahead = 0, de.insert = 0, de.match_length = de.prev_length = N - 1, de.match_available = 0, de.ins_h = 0;
						})(u.state), De;
					}
					function Ya(u, De, de, z, E, Q) {
						if (!u) return x;
						var Fe = 1;
						if (De === b && (De = 6), z < 0 ? (Fe = 0, z = -z) : 15 < z && (Fe = 2, z -= 16), E < 1 || l < E || de !== p || z < 8 || 15 < z || De < 0 || 9 < De || Q < 0 || L < Q) return n(u, x);
						z === 8 && (z = 9);
						var Ce = new U();
						return (u.state = Ce).strm = u, Ce.wrap = Fe, Ce.gzhead = null, Ce.w_bits = z, Ce.w_size = 1 << Ce.w_bits, Ce.w_mask = Ce.w_size - 1, Ce.hash_bits = E + 7, Ce.hash_size = 1 << Ce.hash_bits, Ce.hash_mask = Ce.hash_size - 1, Ce.hash_shift = ~~((Ce.hash_bits + N - 1) / N), Ce.window = new d.Buf8(2 * Ce.w_size), Ce.head = new d.Buf16(Ce.hash_size), Ce.prev = new d.Buf16(Ce.w_size), Ce.lit_bufsize = 1 << E + 6, Ce.pending_buf_size = 4 * Ce.lit_bufsize, Ce.pending_buf = new d.Buf8(Ce.pending_buf_size), Ce.d_buf = 1 * Ce.lit_bufsize, Ce.l_buf = 3 * Ce.lit_bufsize, Ce.level = De, Ce.strategy = Q, Ce.method = de, Ba(u);
					}
					r = [
						new na(0, 0, 0, 0, function(u, De) {
							var de = 65535;
							for (de > u.pending_buf_size - 5 && (de = u.pending_buf_size - 5);;) {
								if (u.lookahead <= 1) {
									if (Ua(u), u.lookahead === 0 && De === T) return y;
									if (u.lookahead === 0) break;
								}
								u.strstart += u.lookahead, u.lookahead = 0;
								var z = u.block_start + de;
								if ((u.strstart === 0 || u.strstart >= z) && (u.lookahead = u.strstart - z, u.strstart = z, _(u, !1), u.strm.avail_out === 0) || u.strstart - u.block_start >= u.w_size - ve && (_(u, !1), u.strm.avail_out === 0)) return y;
							}
							return u.insert = 0, De === w ? (_(u, !0), u.strm.avail_out === 0 ? le : t) : (u.strstart > u.block_start && (_(u, !1), u.strm.avail_out), y);
						}),
						new na(4, 4, 8, 4, ya),
						new na(4, 5, 16, 8, ya),
						new na(4, 6, 32, 32, ya),
						new na(4, 4, 16, 16, pa),
						new na(8, 16, 32, 32, pa),
						new na(8, 16, 128, 128, pa),
						new na(8, 32, 128, 256, pa),
						new na(32, 128, 258, 1024, pa),
						new na(32, 258, 258, 4096, pa)
					], o.deflateInit = function(u, De) {
						return Ya(u, De, p, 15, 8, 0);
					}, o.deflateInit2 = Ya, o.deflateReset = Ba, o.deflateResetKeep = ga, o.deflateSetHeader = function(u, De) {
						return u && u.state ? u.state.wrap !== 2 ? x : (u.state.gzhead = De, m) : x;
					}, o.deflate = function(u, De) {
						var de, z, E, Q;
						if (!u || !u.state || 5 < De || De < 0) return u ? n(u, x) : x;
						if (z = u.state, !u.output || !u.input && u.avail_in !== 0 || z.status === 666 && De !== w) return n(u, u.avail_out === 0 ? -5 : x);
						if (z.strm = u, de = z.last_flush, z.last_flush = De, z.status === S) if (z.wrap === 2) u.adler = 0, H(z, 31), H(z, 139), H(z, 8), z.gzhead ? (H(z, (z.gzhead.text ? 1 : 0) + (z.gzhead.hcrc ? 2 : 0) + (z.gzhead.extra ? 4 : 0) + (z.gzhead.name ? 8 : 0) + (z.gzhead.comment ? 16 : 0)), H(z, 255 & z.gzhead.time), H(z, z.gzhead.time >> 8 & 255), H(z, z.gzhead.time >> 16 & 255), H(z, z.gzhead.time >> 24 & 255), H(z, z.level === 9 ? 2 : 2 <= z.strategy || z.level < 2 ? 4 : 0), H(z, 255 & z.gzhead.os), z.gzhead.extra && z.gzhead.extra.length && (H(z, 255 & z.gzhead.extra.length), H(z, z.gzhead.extra.length >> 8 & 255)), z.gzhead.hcrc && (u.adler = f(u.adler, z.pending_buf, z.pending, 0)), z.gzindex = 0, z.status = 69) : (H(z, 0), H(z, 0), H(z, 0), H(z, 0), H(z, 0), H(z, z.level === 9 ? 2 : 2 <= z.strategy || z.level < 2 ? 4 : 0), H(z, 3), z.status = K);
						else {
							var Fe = p + (z.w_bits - 8 << 4) << 8;
							Fe |= (2 <= z.strategy || z.level < 2 ? 0 : z.level < 6 ? 1 : z.level === 6 ? 2 : 3) << 6, z.strstart !== 0 && (Fe |= 32), Fe += 31 - Fe % 31, z.status = K, Le(z, Fe), z.strstart !== 0 && (Le(z, u.adler >>> 16), Le(z, 65535 & u.adler)), u.adler = 1;
						}
						if (z.status === 69) if (z.gzhead.extra) {
							for (E = z.pending; z.gzindex < (65535 & z.gzhead.extra.length) && (z.pending !== z.pending_buf_size || (z.gzhead.hcrc && z.pending > E && (u.adler = f(u.adler, z.pending_buf, z.pending - E, E)), W(u), E = z.pending, z.pending !== z.pending_buf_size));) H(z, 255 & z.gzhead.extra[z.gzindex]), z.gzindex++;
							z.gzhead.hcrc && z.pending > E && (u.adler = f(u.adler, z.pending_buf, z.pending - E, E)), z.gzindex === z.gzhead.extra.length && (z.gzindex = 0, z.status = 73);
						} else z.status = 73;
						if (z.status === 73) if (z.gzhead.name) {
							E = z.pending;
							do {
								if (z.pending === z.pending_buf_size && (z.gzhead.hcrc && z.pending > E && (u.adler = f(u.adler, z.pending_buf, z.pending - E, E)), W(u), E = z.pending, z.pending === z.pending_buf_size)) {
									Q = 1;
									break;
								}
								Q = z.gzindex < z.gzhead.name.length ? 255 & z.gzhead.name.charCodeAt(z.gzindex++) : 0, H(z, Q);
							} while (Q !== 0);
							z.gzhead.hcrc && z.pending > E && (u.adler = f(u.adler, z.pending_buf, z.pending - E, E)), Q === 0 && (z.gzindex = 0, z.status = 91);
						} else z.status = 91;
						if (z.status === 91) if (z.gzhead.comment) {
							E = z.pending;
							do {
								if (z.pending === z.pending_buf_size && (z.gzhead.hcrc && z.pending > E && (u.adler = f(u.adler, z.pending_buf, z.pending - E, E)), W(u), E = z.pending, z.pending === z.pending_buf_size)) {
									Q = 1;
									break;
								}
								Q = z.gzindex < z.gzhead.comment.length ? 255 & z.gzhead.comment.charCodeAt(z.gzindex++) : 0, H(z, Q);
							} while (Q !== 0);
							z.gzhead.hcrc && z.pending > E && (u.adler = f(u.adler, z.pending_buf, z.pending - E, E)), Q === 0 && (z.status = 103);
						} else z.status = 103;
						if (z.status === 103 && (z.gzhead.hcrc ? (z.pending + 2 > z.pending_buf_size && W(u), z.pending + 2 <= z.pending_buf_size && (H(z, 255 & u.adler), H(z, u.adler >> 8 & 255), u.adler = 0, z.status = K)) : z.status = K), z.pending !== 0) {
							if (W(u), u.avail_out === 0) return z.last_flush = -1, m;
						} else if (u.avail_in === 0 && pe(De) <= pe(de) && De !== w) return n(u, -5);
						if (z.status === 666 && u.avail_in !== 0) return n(u, -5);
						if (u.avail_in !== 0 || z.lookahead !== 0 || De !== T && z.status !== 666) {
							var Ce = z.strategy === 2 ? (function(re, Pe) {
								for (var He;;) {
									if (re.lookahead === 0 && (Ua(re), re.lookahead === 0)) {
										if (Pe === T) return y;
										break;
									}
									if (re.match_length = 0, He = s._tr_tally(re, 0, re.window[re.strstart]), re.lookahead--, re.strstart++, He && (_(re, !1), re.strm.avail_out === 0)) return y;
								}
								return re.insert = 0, Pe === w ? (_(re, !0), re.strm.avail_out === 0 ? le : t) : re.last_lit && (_(re, !1), re.strm.avail_out === 0) ? y : X;
							})(z, De) : z.strategy === 3 ? (function(re, Pe) {
								for (var He, We, ia, za, Ia = re.window;;) {
									if (re.lookahead <= ke) {
										if (Ua(re), re.lookahead <= ke && Pe === T) return y;
										if (re.lookahead === 0) break;
									}
									if (re.match_length = 0, re.lookahead >= N && 0 < re.strstart && (We = Ia[ia = re.strstart - 1]) === Ia[++ia] && We === Ia[++ia] && We === Ia[++ia]) {
										za = re.strstart + ke;
										do										;
while (We === Ia[++ia] && We === Ia[++ia] && We === Ia[++ia] && We === Ia[++ia] && We === Ia[++ia] && We === Ia[++ia] && We === Ia[++ia] && We === Ia[++ia] && ia < za);
										re.match_length = ke - (za - ia), re.match_length > re.lookahead && (re.match_length = re.lookahead);
									}
									if (re.match_length >= N ? (He = s._tr_tally(re, 1, re.match_length - N), re.lookahead -= re.match_length, re.strstart += re.match_length, re.match_length = 0) : (He = s._tr_tally(re, 0, re.window[re.strstart]), re.lookahead--, re.strstart++), He && (_(re, !1), re.strm.avail_out === 0)) return y;
								}
								return re.insert = 0, Pe === w ? (_(re, !0), re.strm.avail_out === 0 ? le : t) : re.last_lit && (_(re, !1), re.strm.avail_out === 0) ? y : X;
							})(z, De) : r[z.level].func(z, De);
							if (Ce !== le && Ce !== t || (z.status = 666), Ce === y || Ce === le) return u.avail_out === 0 && (z.last_flush = -1), m;
							if (Ce === X && (De === 1 ? s._tr_align(z) : De !== 5 && (s._tr_stored_block(z, 0, 0, !1), De === 3 && (Be(z.head), z.lookahead === 0 && (z.strstart = 0, z.block_start = 0, z.insert = 0))), W(u), u.avail_out === 0)) return z.last_flush = -1, m;
						}
						return De !== w ? m : z.wrap <= 0 ? 1 : (z.wrap === 2 ? (H(z, 255 & u.adler), H(z, u.adler >> 8 & 255), H(z, u.adler >> 16 & 255), H(z, u.adler >> 24 & 255), H(z, 255 & u.total_in), H(z, u.total_in >> 8 & 255), H(z, u.total_in >> 16 & 255), H(z, u.total_in >> 24 & 255)) : (Le(z, u.adler >>> 16), Le(z, 65535 & u.adler)), W(u), 0 < z.wrap && (z.wrap = -z.wrap), z.pending !== 0 ? m : 1);
					}, o.deflateEnd = function(u) {
						var De;
						return u && u.state ? (De = u.state.status) !== S && De !== 69 && De !== 73 && De !== 91 && De !== 103 && De !== K && De !== 666 ? n(u, x) : (u.state = null, De === K ? n(u, -3) : m) : x;
					}, o.deflateSetDictionary = function(u, De) {
						var de, z, E, Q, Fe, Ce, re, Pe, He = De.length;
						if (!u || !u.state || (Q = (de = u.state).wrap) === 2 || Q === 1 && de.status !== S || de.lookahead) return x;
						for (Q === 1 && (u.adler = g(u.adler, De, He, 0)), de.wrap = 0, He >= de.w_size && (Q === 0 && (Be(de.head), de.strstart = 0, de.block_start = 0, de.insert = 0), Pe = new d.Buf8(de.w_size), d.arraySet(Pe, De, He - de.w_size, de.w_size, 0), De = Pe, He = de.w_size), Fe = u.avail_in, Ce = u.next_in, re = u.input, u.avail_in = He, u.next_in = 0, u.input = De, Ua(de); de.lookahead >= N;) {
							for (z = de.strstart, E = de.lookahead - (N - 1); de.ins_h = (de.ins_h << de.hash_shift ^ de.window[z + N - 1]) & de.hash_mask, de.prev[z & de.w_mask] = de.head[de.ins_h], de.head[de.ins_h] = z, z++, --E;);
							de.strstart = z, de.lookahead = N - 1, Ua(de);
						}
						return de.strstart += de.lookahead, de.block_start = de.strstart, de.insert = de.lookahead, de.lookahead = 0, de.match_length = de.prev_length = N - 1, de.match_available = 0, u.next_in = Ce, u.input = re, u.avail_in = Fe, de.wrap = Q, m;
					}, o.deflateInfo = "pako deflate (from Nodeca project)";
				}, {
					"../utils/common": 41,
					"./adler32": 43,
					"./crc32": 45,
					"./messages": 51,
					"./trees": 52
				}],
				47: [function(a, h, o) {
					"use strict";
					h.exports = function() {
						this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
					};
				}, {}],
				48: [function(a, h, o) {
					"use strict";
					h.exports = function(r, d) {
						var s = r.state, g = r.next_in, f, D, T, w, m, x, b, L, v, p, l, M, J, se, ne, ce, N, ke, ve, S, K, y = r.input, X;
						f = g + (r.avail_in - 5), D = r.next_out, X = r.output, T = D - (d - r.avail_out), w = D + (r.avail_out - 257), m = s.dmax, x = s.wsize, b = s.whave, L = s.wnext, v = s.window, p = s.hold, l = s.bits, M = s.lencode, J = s.distcode, se = (1 << s.lenbits) - 1, ne = (1 << s.distbits) - 1;
						e: do {
							l < 15 && (p += y[g++] << l, l += 8, p += y[g++] << l, l += 8), ce = M[p & se];
							a: for (;;) {
								if (p >>>= N = ce >>> 24, l -= N, (N = ce >>> 16 & 255) === 0) X[D++] = 65535 & ce;
								else {
									if (!(16 & N)) {
										if ((64 & N) == 0) {
											ce = M[(65535 & ce) + (p & (1 << N) - 1)];
											continue a;
										}
										if (32 & N) {
											s.mode = 12;
											break e;
										}
										r.msg = "invalid literal/length code", s.mode = 30;
										break e;
									}
									ke = 65535 & ce, (N &= 15) && (l < N && (p += y[g++] << l, l += 8), ke += p & (1 << N) - 1, p >>>= N, l -= N), l < 15 && (p += y[g++] << l, l += 8, p += y[g++] << l, l += 8), ce = J[p & ne];
									t: for (;;) {
										if (p >>>= N = ce >>> 24, l -= N, !(16 & (N = ce >>> 16 & 255))) {
											if ((64 & N) == 0) {
												ce = J[(65535 & ce) + (p & (1 << N) - 1)];
												continue t;
											}
											r.msg = "invalid distance code", s.mode = 30;
											break e;
										}
										if (ve = 65535 & ce, l < (N &= 15) && (p += y[g++] << l, (l += 8) < N && (p += y[g++] << l, l += 8)), m < (ve += p & (1 << N) - 1)) {
											r.msg = "invalid distance too far back", s.mode = 30;
											break e;
										}
										if (p >>>= N, l -= N, (N = D - T) < ve) {
											if (b < (N = ve - N) && s.sane) {
												r.msg = "invalid distance too far back", s.mode = 30;
												break e;
											}
											if (K = v, (S = 0) === L) {
												if (S += x - N, N < ke) {
													for (ke -= N; X[D++] = v[S++], --N;);
													S = D - ve, K = X;
												}
											} else if (L < N) {
												if (S += x + L - N, (N -= L) < ke) {
													for (ke -= N; X[D++] = v[S++], --N;);
													if (S = 0, L < ke) {
														for (ke -= N = L; X[D++] = v[S++], --N;);
														S = D - ve, K = X;
													}
												}
											} else if (S += L - N, N < ke) {
												for (ke -= N; X[D++] = v[S++], --N;);
												S = D - ve, K = X;
											}
											for (; 2 < ke;) X[D++] = K[S++], X[D++] = K[S++], X[D++] = K[S++], ke -= 3;
											ke && (X[D++] = K[S++], 1 < ke && (X[D++] = K[S++]));
										} else {
											for (S = D - ve; X[D++] = X[S++], X[D++] = X[S++], X[D++] = X[S++], 2 < (ke -= 3););
											ke && (X[D++] = X[S++], 1 < ke && (X[D++] = X[S++]));
										}
										break;
									}
								}
								break;
							}
						} while (g < f && D < w);
						g -= ke = l >> 3, p &= (1 << (l -= ke << 3)) - 1, r.next_in = g, r.next_out = D, r.avail_in = g < f ? f - g + 5 : 5 - (g - f), r.avail_out = D < w ? w - D + 257 : 257 - (D - w), s.hold = p, s.bits = l;
					};
				}, {}],
				49: [function(a, h, o) {
					"use strict";
					var r = a("../utils/common"), d = a("./adler32"), s = a("./crc32"), g = a("./inffast"), f = a("./inftrees"), D = 1, T = 2, w = 0, m = -2, x = 1, b = 852, L = 592;
					function v(S) {
						return (S >>> 24 & 255) + (S >>> 8 & 65280) + ((65280 & S) << 8) + ((255 & S) << 24);
					}
					function p() {
						this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new r.Buf16(320), this.work = new r.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
					}
					function l(S) {
						var K;
						return S && S.state ? (K = S.state, S.total_in = S.total_out = K.total = 0, S.msg = "", K.wrap && (S.adler = 1 & K.wrap), K.mode = x, K.last = 0, K.havedict = 0, K.dmax = 32768, K.head = null, K.hold = 0, K.bits = 0, K.lencode = K.lendyn = new r.Buf32(b), K.distcode = K.distdyn = new r.Buf32(L), K.sane = 1, K.back = -1, w) : m;
					}
					function M(S) {
						var K;
						return S && S.state ? ((K = S.state).wsize = 0, K.whave = 0, K.wnext = 0, l(S)) : m;
					}
					function J(S, K) {
						var y, X;
						return S && S.state ? (X = S.state, K < 0 ? (y = 0, K = -K) : (y = 1 + (K >> 4), K < 48 && (K &= 15)), K && (K < 8 || 15 < K) ? m : (X.window !== null && X.wbits !== K && (X.window = null), X.wrap = y, X.wbits = K, M(S))) : m;
					}
					function se(S, K) {
						var y, X;
						return S ? (X = new p(), (S.state = X).window = null, (y = J(S, K)) !== w && (S.state = null), y) : m;
					}
					var ne, ce, N = !0;
					function ke(S) {
						if (N) {
							var K;
							for (ne = new r.Buf32(512), ce = new r.Buf32(32), K = 0; K < 144;) S.lens[K++] = 8;
							for (; K < 256;) S.lens[K++] = 9;
							for (; K < 280;) S.lens[K++] = 7;
							for (; K < 288;) S.lens[K++] = 8;
							for (f(D, S.lens, 0, 288, ne, 0, S.work, { bits: 9 }), K = 0; K < 32;) S.lens[K++] = 5;
							f(T, S.lens, 0, 32, ce, 0, S.work, { bits: 5 }), N = !1;
						}
						S.lencode = ne, S.lenbits = 9, S.distcode = ce, S.distbits = 5;
					}
					function ve(S, K, y, X) {
						var le, t = S.state;
						return t.window === null && (t.wsize = 1 << t.wbits, t.wnext = 0, t.whave = 0, t.window = new r.Buf8(t.wsize)), X >= t.wsize ? (r.arraySet(t.window, K, y - t.wsize, t.wsize, 0), t.wnext = 0, t.whave = t.wsize) : (X < (le = t.wsize - t.wnext) && (le = X), r.arraySet(t.window, K, y - X, le, t.wnext), (X -= le) ? (r.arraySet(t.window, K, y - X, X, 0), t.wnext = X, t.whave = t.wsize) : (t.wnext += le, t.wnext === t.wsize && (t.wnext = 0), t.whave < t.wsize && (t.whave += le))), 0;
					}
					o.inflateReset = M, o.inflateReset2 = J, o.inflateResetKeep = l, o.inflateInit = function(S) {
						return se(S, 15);
					}, o.inflateInit2 = se, o.inflate = function(S, K) {
						var y, X, le, t, n, pe, Be, W, _, H, Le, Te, Ua, ya, pa, na, U, ga, Ba, Ya, u, De, de, z, E = 0, Q = new r.Buf8(4), Fe = [
							16,
							17,
							18,
							0,
							8,
							7,
							9,
							6,
							10,
							5,
							11,
							4,
							12,
							3,
							13,
							2,
							14,
							1,
							15
						];
						if (!S || !S.state || !S.output || !S.input && S.avail_in !== 0) return m;
						(y = S.state).mode === 12 && (y.mode = 13), n = S.next_out, le = S.output, Be = S.avail_out, t = S.next_in, X = S.input, pe = S.avail_in, W = y.hold, _ = y.bits, H = pe, Le = Be, De = w;
						e: for (;;) switch (y.mode) {
							case x:
								if (y.wrap === 0) {
									y.mode = 13;
									break;
								}
								for (; _ < 16;) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								if (2 & y.wrap && W === 35615) {
									Q[y.check = 0] = 255 & W, Q[1] = W >>> 8 & 255, y.check = s(y.check, Q, 2, 0), _ = W = 0, y.mode = 2;
									break;
								}
								if (y.flags = 0, y.head && (y.head.done = !1), !(1 & y.wrap) || (((255 & W) << 8) + (W >> 8)) % 31) {
									S.msg = "incorrect header check", y.mode = 30;
									break;
								}
								if ((15 & W) != 8) {
									S.msg = "unknown compression method", y.mode = 30;
									break;
								}
								if (_ -= 4, u = 8 + (15 & (W >>>= 4)), y.wbits === 0) y.wbits = u;
								else if (u > y.wbits) {
									S.msg = "invalid window size", y.mode = 30;
									break;
								}
								y.dmax = 1 << u, S.adler = y.check = 1, y.mode = 512 & W ? 10 : 12, _ = W = 0;
								break;
							case 2:
								for (; _ < 16;) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								if (y.flags = W, (255 & y.flags) != 8) {
									S.msg = "unknown compression method", y.mode = 30;
									break;
								}
								if (57344 & y.flags) {
									S.msg = "unknown header flags set", y.mode = 30;
									break;
								}
								y.head && (y.head.text = W >> 8 & 1), 512 & y.flags && (Q[0] = 255 & W, Q[1] = W >>> 8 & 255, y.check = s(y.check, Q, 2, 0)), _ = W = 0, y.mode = 3;
							case 3:
								for (; _ < 32;) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								y.head && (y.head.time = W), 512 & y.flags && (Q[0] = 255 & W, Q[1] = W >>> 8 & 255, Q[2] = W >>> 16 & 255, Q[3] = W >>> 24 & 255, y.check = s(y.check, Q, 4, 0)), _ = W = 0, y.mode = 4;
							case 4:
								for (; _ < 16;) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								y.head && (y.head.xflags = 255 & W, y.head.os = W >> 8), 512 & y.flags && (Q[0] = 255 & W, Q[1] = W >>> 8 & 255, y.check = s(y.check, Q, 2, 0)), _ = W = 0, y.mode = 5;
							case 5:
								if (1024 & y.flags) {
									for (; _ < 16;) {
										if (pe === 0) break e;
										pe--, W += X[t++] << _, _ += 8;
									}
									y.length = W, y.head && (y.head.extra_len = W), 512 & y.flags && (Q[0] = 255 & W, Q[1] = W >>> 8 & 255, y.check = s(y.check, Q, 2, 0)), _ = W = 0;
								} else y.head && (y.head.extra = null);
								y.mode = 6;
							case 6:
								if (1024 & y.flags && (pe < (Te = y.length) && (Te = pe), Te && (y.head && (u = y.head.extra_len - y.length, y.head.extra || (y.head.extra = new Array(y.head.extra_len)), r.arraySet(y.head.extra, X, t, Te, u)), 512 & y.flags && (y.check = s(y.check, X, Te, t)), pe -= Te, t += Te, y.length -= Te), y.length)) break e;
								y.length = 0, y.mode = 7;
							case 7:
								if (2048 & y.flags) {
									if (pe === 0) break e;
									for (Te = 0; u = X[t + Te++], y.head && u && y.length < 65536 && (y.head.name += String.fromCharCode(u)), u && Te < pe;);
									if (512 & y.flags && (y.check = s(y.check, X, Te, t)), pe -= Te, t += Te, u) break e;
								} else y.head && (y.head.name = null);
								y.length = 0, y.mode = 8;
							case 8:
								if (4096 & y.flags) {
									if (pe === 0) break e;
									for (Te = 0; u = X[t + Te++], y.head && u && y.length < 65536 && (y.head.comment += String.fromCharCode(u)), u && Te < pe;);
									if (512 & y.flags && (y.check = s(y.check, X, Te, t)), pe -= Te, t += Te, u) break e;
								} else y.head && (y.head.comment = null);
								y.mode = 9;
							case 9:
								if (512 & y.flags) {
									for (; _ < 16;) {
										if (pe === 0) break e;
										pe--, W += X[t++] << _, _ += 8;
									}
									if (W !== (65535 & y.check)) {
										S.msg = "header crc mismatch", y.mode = 30;
										break;
									}
									_ = W = 0;
								}
								y.head && (y.head.hcrc = y.flags >> 9 & 1, y.head.done = !0), S.adler = y.check = 0, y.mode = 12;
								break;
							case 10:
								for (; _ < 32;) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								S.adler = y.check = v(W), _ = W = 0, y.mode = 11;
							case 11:
								if (y.havedict === 0) return S.next_out = n, S.avail_out = Be, S.next_in = t, S.avail_in = pe, y.hold = W, y.bits = _, 2;
								S.adler = y.check = 1, y.mode = 12;
							case 12: if (K === 5 || K === 6) break e;
							case 13:
								if (y.last) {
									W >>>= 7 & _, _ -= 7 & _, y.mode = 27;
									break;
								}
								for (; _ < 3;) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								switch (y.last = 1 & W, _ -= 1, 3 & (W >>>= 1)) {
									case 0:
										y.mode = 14;
										break;
									case 1:
										if (ke(y), y.mode = 20, K !== 6) break;
										W >>>= 2, _ -= 2;
										break e;
									case 2:
										y.mode = 17;
										break;
									case 3: S.msg = "invalid block type", y.mode = 30;
								}
								W >>>= 2, _ -= 2;
								break;
							case 14:
								for (W >>>= 7 & _, _ -= 7 & _; _ < 32;) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								if ((65535 & W) != (W >>> 16 ^ 65535)) {
									S.msg = "invalid stored block lengths", y.mode = 30;
									break;
								}
								if (y.length = 65535 & W, _ = W = 0, y.mode = 15, K === 6) break e;
							case 15: y.mode = 16;
							case 16:
								if (Te = y.length) {
									if (pe < Te && (Te = pe), Be < Te && (Te = Be), Te === 0) break e;
									r.arraySet(le, X, t, Te, n), pe -= Te, t += Te, Be -= Te, n += Te, y.length -= Te;
									break;
								}
								y.mode = 12;
								break;
							case 17:
								for (; _ < 14;) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								if (y.nlen = 257 + (31 & W), W >>>= 5, _ -= 5, y.ndist = 1 + (31 & W), W >>>= 5, _ -= 5, y.ncode = 4 + (15 & W), W >>>= 4, _ -= 4, 286 < y.nlen || 30 < y.ndist) {
									S.msg = "too many length or distance symbols", y.mode = 30;
									break;
								}
								y.have = 0, y.mode = 18;
							case 18:
								for (; y.have < y.ncode;) {
									for (; _ < 3;) {
										if (pe === 0) break e;
										pe--, W += X[t++] << _, _ += 8;
									}
									y.lens[Fe[y.have++]] = 7 & W, W >>>= 3, _ -= 3;
								}
								for (; y.have < 19;) y.lens[Fe[y.have++]] = 0;
								if (y.lencode = y.lendyn, y.lenbits = 7, de = { bits: y.lenbits }, De = f(0, y.lens, 0, 19, y.lencode, 0, y.work, de), y.lenbits = de.bits, De) {
									S.msg = "invalid code lengths set", y.mode = 30;
									break;
								}
								y.have = 0, y.mode = 19;
							case 19:
								for (; y.have < y.nlen + y.ndist;) {
									for (; na = (E = y.lencode[W & (1 << y.lenbits) - 1]) >>> 16 & 255, U = 65535 & E, !((pa = E >>> 24) <= _);) {
										if (pe === 0) break e;
										pe--, W += X[t++] << _, _ += 8;
									}
									if (U < 16) W >>>= pa, _ -= pa, y.lens[y.have++] = U;
									else {
										if (U === 16) {
											for (z = pa + 2; _ < z;) {
												if (pe === 0) break e;
												pe--, W += X[t++] << _, _ += 8;
											}
											if (W >>>= pa, _ -= pa, y.have === 0) {
												S.msg = "invalid bit length repeat", y.mode = 30;
												break;
											}
											u = y.lens[y.have - 1], Te = 3 + (3 & W), W >>>= 2, _ -= 2;
										} else if (U === 17) {
											for (z = pa + 3; _ < z;) {
												if (pe === 0) break e;
												pe--, W += X[t++] << _, _ += 8;
											}
											_ -= pa, u = 0, Te = 3 + (7 & (W >>>= pa)), W >>>= 3, _ -= 3;
										} else {
											for (z = pa + 7; _ < z;) {
												if (pe === 0) break e;
												pe--, W += X[t++] << _, _ += 8;
											}
											_ -= pa, u = 0, Te = 11 + (127 & (W >>>= pa)), W >>>= 7, _ -= 7;
										}
										if (y.have + Te > y.nlen + y.ndist) {
											S.msg = "invalid bit length repeat", y.mode = 30;
											break;
										}
										for (; Te--;) y.lens[y.have++] = u;
									}
								}
								if (y.mode === 30) break;
								if (y.lens[256] === 0) {
									S.msg = "invalid code -- missing end-of-block", y.mode = 30;
									break;
								}
								if (y.lenbits = 9, de = { bits: y.lenbits }, De = f(D, y.lens, 0, y.nlen, y.lencode, 0, y.work, de), y.lenbits = de.bits, De) {
									S.msg = "invalid literal/lengths set", y.mode = 30;
									break;
								}
								if (y.distbits = 6, y.distcode = y.distdyn, de = { bits: y.distbits }, De = f(T, y.lens, y.nlen, y.ndist, y.distcode, 0, y.work, de), y.distbits = de.bits, De) {
									S.msg = "invalid distances set", y.mode = 30;
									break;
								}
								if (y.mode = 20, K === 6) break e;
							case 20: y.mode = 21;
							case 21:
								if (6 <= pe && 258 <= Be) {
									S.next_out = n, S.avail_out = Be, S.next_in = t, S.avail_in = pe, y.hold = W, y.bits = _, g(S, Le), n = S.next_out, le = S.output, Be = S.avail_out, t = S.next_in, X = S.input, pe = S.avail_in, W = y.hold, _ = y.bits, y.mode === 12 && (y.back = -1);
									break;
								}
								for (y.back = 0; na = (E = y.lencode[W & (1 << y.lenbits) - 1]) >>> 16 & 255, U = 65535 & E, !((pa = E >>> 24) <= _);) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								if (na && (240 & na) == 0) {
									for (ga = pa, Ba = na, Ya = U; na = (E = y.lencode[Ya + ((W & (1 << ga + Ba) - 1) >> ga)]) >>> 16 & 255, U = 65535 & E, !(ga + (pa = E >>> 24) <= _);) {
										if (pe === 0) break e;
										pe--, W += X[t++] << _, _ += 8;
									}
									W >>>= ga, _ -= ga, y.back += ga;
								}
								if (W >>>= pa, _ -= pa, y.back += pa, y.length = U, na === 0) {
									y.mode = 26;
									break;
								}
								if (32 & na) {
									y.back = -1, y.mode = 12;
									break;
								}
								if (64 & na) {
									S.msg = "invalid literal/length code", y.mode = 30;
									break;
								}
								y.extra = 15 & na, y.mode = 22;
							case 22:
								if (y.extra) {
									for (z = y.extra; _ < z;) {
										if (pe === 0) break e;
										pe--, W += X[t++] << _, _ += 8;
									}
									y.length += W & (1 << y.extra) - 1, W >>>= y.extra, _ -= y.extra, y.back += y.extra;
								}
								y.was = y.length, y.mode = 23;
							case 23:
								for (; na = (E = y.distcode[W & (1 << y.distbits) - 1]) >>> 16 & 255, U = 65535 & E, !((pa = E >>> 24) <= _);) {
									if (pe === 0) break e;
									pe--, W += X[t++] << _, _ += 8;
								}
								if ((240 & na) == 0) {
									for (ga = pa, Ba = na, Ya = U; na = (E = y.distcode[Ya + ((W & (1 << ga + Ba) - 1) >> ga)]) >>> 16 & 255, U = 65535 & E, !(ga + (pa = E >>> 24) <= _);) {
										if (pe === 0) break e;
										pe--, W += X[t++] << _, _ += 8;
									}
									W >>>= ga, _ -= ga, y.back += ga;
								}
								if (W >>>= pa, _ -= pa, y.back += pa, 64 & na) {
									S.msg = "invalid distance code", y.mode = 30;
									break;
								}
								y.offset = U, y.extra = 15 & na, y.mode = 24;
							case 24:
								if (y.extra) {
									for (z = y.extra; _ < z;) {
										if (pe === 0) break e;
										pe--, W += X[t++] << _, _ += 8;
									}
									y.offset += W & (1 << y.extra) - 1, W >>>= y.extra, _ -= y.extra, y.back += y.extra;
								}
								if (y.offset > y.dmax) {
									S.msg = "invalid distance too far back", y.mode = 30;
									break;
								}
								y.mode = 25;
							case 25:
								if (Be === 0) break e;
								if (Te = Le - Be, y.offset > Te) {
									if ((Te = y.offset - Te) > y.whave && y.sane) {
										S.msg = "invalid distance too far back", y.mode = 30;
										break;
									}
									Ua = Te > y.wnext ? (Te -= y.wnext, y.wsize - Te) : y.wnext - Te, Te > y.length && (Te = y.length), ya = y.window;
								} else ya = le, Ua = n - y.offset, Te = y.length;
								for (Be < Te && (Te = Be), Be -= Te, y.length -= Te; le[n++] = ya[Ua++], --Te;);
								y.length === 0 && (y.mode = 21);
								break;
							case 26:
								if (Be === 0) break e;
								le[n++] = y.length, Be--, y.mode = 21;
								break;
							case 27:
								if (y.wrap) {
									for (; _ < 32;) {
										if (pe === 0) break e;
										pe--, W |= X[t++] << _, _ += 8;
									}
									if (Le -= Be, S.total_out += Le, y.total += Le, Le && (S.adler = y.check = y.flags ? s(y.check, le, Le, n - Le) : d(y.check, le, Le, n - Le)), Le = Be, (y.flags ? W : v(W)) !== y.check) {
										S.msg = "incorrect data check", y.mode = 30;
										break;
									}
									_ = W = 0;
								}
								y.mode = 28;
							case 28:
								if (y.wrap && y.flags) {
									for (; _ < 32;) {
										if (pe === 0) break e;
										pe--, W += X[t++] << _, _ += 8;
									}
									if (W !== (4294967295 & y.total)) {
										S.msg = "incorrect length check", y.mode = 30;
										break;
									}
									_ = W = 0;
								}
								y.mode = 29;
							case 29:
								De = 1;
								break e;
							case 30:
								De = -3;
								break e;
							case 31: return -4;
							default: return m;
						}
						return S.next_out = n, S.avail_out = Be, S.next_in = t, S.avail_in = pe, y.hold = W, y.bits = _, (y.wsize || Le !== S.avail_out && y.mode < 30 && (y.mode < 27 || K !== 4)) && ve(S, S.output, S.next_out, Le - S.avail_out) ? (y.mode = 31, -4) : (H -= S.avail_in, Le -= S.avail_out, S.total_in += H, S.total_out += Le, y.total += Le, y.wrap && Le && (S.adler = y.check = y.flags ? s(y.check, le, Le, S.next_out - Le) : d(y.check, le, Le, S.next_out - Le)), S.data_type = y.bits + (y.last ? 64 : 0) + (y.mode === 12 ? 128 : 0) + (y.mode === 20 || y.mode === 15 ? 256 : 0), (H == 0 && Le === 0 || K === 4) && De === w && (De = -5), De);
					}, o.inflateEnd = function(S) {
						if (!S || !S.state) return m;
						var K = S.state;
						return K.window && (K.window = null), S.state = null, w;
					}, o.inflateGetHeader = function(S, K) {
						var y;
						return S && S.state ? (2 & (y = S.state).wrap) == 0 ? m : ((y.head = K).done = !1, w) : m;
					}, o.inflateSetDictionary = function(S, K) {
						var y, X = K.length;
						return S && S.state ? (y = S.state).wrap !== 0 && y.mode !== 11 ? m : y.mode === 11 && d(1, K, X, 0) !== y.check ? -3 : ve(S, K, X, X) ? (y.mode = 31, -4) : (y.havedict = 1, w) : m;
					}, o.inflateInfo = "pako inflate (from Nodeca project)";
				}, {
					"../utils/common": 41,
					"./adler32": 43,
					"./crc32": 45,
					"./inffast": 48,
					"./inftrees": 50
				}],
				50: [function(a, h, o) {
					"use strict";
					var r = a("../utils/common"), d = [
						3,
						4,
						5,
						6,
						7,
						8,
						9,
						10,
						11,
						13,
						15,
						17,
						19,
						23,
						27,
						31,
						35,
						43,
						51,
						59,
						67,
						83,
						99,
						115,
						131,
						163,
						195,
						227,
						258,
						0,
						0
					], s = [
						16,
						16,
						16,
						16,
						16,
						16,
						16,
						16,
						17,
						17,
						17,
						17,
						18,
						18,
						18,
						18,
						19,
						19,
						19,
						19,
						20,
						20,
						20,
						20,
						21,
						21,
						21,
						21,
						16,
						72,
						78
					], g = [
						1,
						2,
						3,
						4,
						5,
						7,
						9,
						13,
						17,
						25,
						33,
						49,
						65,
						97,
						129,
						193,
						257,
						385,
						513,
						769,
						1025,
						1537,
						2049,
						3073,
						4097,
						6145,
						8193,
						12289,
						16385,
						24577,
						0,
						0
					], f = [
						16,
						16,
						16,
						16,
						17,
						17,
						18,
						18,
						19,
						19,
						20,
						20,
						21,
						21,
						22,
						22,
						23,
						23,
						24,
						24,
						25,
						25,
						26,
						26,
						27,
						27,
						28,
						28,
						29,
						29,
						64,
						64
					];
					h.exports = function(D, T, w, m, x, b, L, v) {
						var p, l, M, J, se, ne, ce, N, ke, ve = v.bits, S = 0, K = 0, y = 0, X = 0, le = 0, t = 0, n = 0, pe = 0, Be = 0, W = 0, _ = null, H = 0, Le = new r.Buf16(16), Te = new r.Buf16(16), Ua = null, ya = 0;
						for (S = 0; S <= 15; S++) Le[S] = 0;
						for (K = 0; K < m; K++) Le[T[w + K]]++;
						for (le = ve, X = 15; 1 <= X && Le[X] === 0; X--);
						if (X < le && (le = X), X === 0) return x[b++] = 20971520, x[b++] = 20971520, v.bits = 1, 0;
						for (y = 1; y < X && Le[y] === 0; y++);
						for (le < y && (le = y), S = pe = 1; S <= 15; S++) if (pe <<= 1, (pe -= Le[S]) < 0) return -1;
						if (0 < pe && (D === 0 || X !== 1)) return -1;
						for (Te[1] = 0, S = 1; S < 15; S++) Te[S + 1] = Te[S] + Le[S];
						for (K = 0; K < m; K++) T[w + K] !== 0 && (L[Te[T[w + K]]++] = K);
						if (ne = D === 0 ? (_ = Ua = L, 19) : D === 1 ? (_ = d, H -= 257, Ua = s, ya -= 257, 256) : (_ = g, Ua = f, -1), S = y, se = b, n = K = W = 0, M = -1, J = (Be = 1 << (t = le)) - 1, D === 1 && 852 < Be || D === 2 && 592 < Be) return 1;
						for (;;) {
							for (ce = S - n, ke = L[K] < ne ? (N = 0, L[K]) : L[K] > ne ? (N = Ua[ya + L[K]], _[H + L[K]]) : (N = 96, 0), p = 1 << S - n, y = l = 1 << t; x[se + (W >> n) + (l -= p)] = ce << 24 | N << 16 | ke | 0, l !== 0;);
							for (p = 1 << S - 1; W & p;) p >>= 1;
							if (p !== 0 ? (W &= p - 1, W += p) : W = 0, K++, --Le[S] == 0) {
								if (S === X) break;
								S = T[w + L[K]];
							}
							if (le < S && (W & J) !== M) {
								for (n === 0 && (n = le), se += y, pe = 1 << (t = S - n); t + n < X && !((pe -= Le[t + n]) <= 0);) t++, pe <<= 1;
								if (Be += 1 << t, D === 1 && 852 < Be || D === 2 && 592 < Be) return 1;
								x[M = W & J] = le << 24 | t << 16 | se - b | 0;
							}
						}
						return W !== 0 && (x[se + W] = S - n << 24 | 4194304), v.bits = le, 0;
					};
				}, { "../utils/common": 41 }],
				51: [function(a, h, o) {
					"use strict";
					h.exports = {
						2: "need dictionary",
						1: "stream end",
						0: "",
						"-1": "file error",
						"-2": "stream error",
						"-3": "data error",
						"-4": "insufficient memory",
						"-5": "buffer error",
						"-6": "incompatible version"
					};
				}, {}],
				52: [function(a, h, o) {
					"use strict";
					var r = a("../utils/common"), d = 0, s = 1;
					function g(E) {
						for (var Q = E.length; 0 <= --Q;) E[Q] = 0;
					}
					var f = 0, D = 29, T = 256, w = T + 1 + D, m = 30, x = 19, b = 2 * w + 1, L = 15, v = 16, p = 7, l = 256, M = 16, J = 17, se = 18, ne = [
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						1,
						1,
						1,
						1,
						2,
						2,
						2,
						2,
						3,
						3,
						3,
						3,
						4,
						4,
						4,
						4,
						5,
						5,
						5,
						5,
						0
					], ce = [
						0,
						0,
						0,
						0,
						1,
						1,
						2,
						2,
						3,
						3,
						4,
						4,
						5,
						5,
						6,
						6,
						7,
						7,
						8,
						8,
						9,
						9,
						10,
						10,
						11,
						11,
						12,
						12,
						13,
						13
					], N = [
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						2,
						3,
						7
					], ke = [
						16,
						17,
						18,
						0,
						8,
						7,
						9,
						6,
						10,
						5,
						11,
						4,
						12,
						3,
						13,
						2,
						14,
						1,
						15
					], ve = new Array(2 * (w + 2));
					g(ve);
					var S = new Array(2 * m);
					g(S);
					var K = new Array(512);
					g(K);
					var y = new Array(256);
					g(y);
					var X = new Array(D);
					g(X);
					var le, t, n, pe = new Array(m);
					function Be(E, Q, Fe, Ce, re) {
						this.static_tree = E, this.extra_bits = Q, this.extra_base = Fe, this.elems = Ce, this.max_length = re, this.has_stree = E && E.length;
					}
					function W(E, Q) {
						this.dyn_tree = E, this.max_code = 0, this.stat_desc = Q;
					}
					function _(E) {
						return E < 256 ? K[E] : K[256 + (E >>> 7)];
					}
					function H(E, Q) {
						E.pending_buf[E.pending++] = 255 & Q, E.pending_buf[E.pending++] = Q >>> 8 & 255;
					}
					function Le(E, Q, Fe) {
						E.bi_valid > v - Fe ? (E.bi_buf |= Q << E.bi_valid & 65535, H(E, E.bi_buf), E.bi_buf = Q >> v - E.bi_valid, E.bi_valid += Fe - v) : (E.bi_buf |= Q << E.bi_valid & 65535, E.bi_valid += Fe);
					}
					function Te(E, Q, Fe) {
						Le(E, Fe[2 * Q], Fe[2 * Q + 1]);
					}
					function Ua(E, Q) {
						for (var Fe = 0; Fe |= 1 & E, E >>>= 1, Fe <<= 1, 0 < --Q;);
						return Fe >>> 1;
					}
					function ya(E, Q, Fe) {
						var Ce, re, Pe = new Array(L + 1), He = 0;
						for (Ce = 1; Ce <= L; Ce++) Pe[Ce] = He = He + Fe[Ce - 1] << 1;
						for (re = 0; re <= Q; re++) {
							var We = E[2 * re + 1];
							We !== 0 && (E[2 * re] = Ua(Pe[We]++, We));
						}
					}
					function pa(E) {
						var Q;
						for (Q = 0; Q < w; Q++) E.dyn_ltree[2 * Q] = 0;
						for (Q = 0; Q < m; Q++) E.dyn_dtree[2 * Q] = 0;
						for (Q = 0; Q < x; Q++) E.bl_tree[2 * Q] = 0;
						E.dyn_ltree[2 * l] = 1, E.opt_len = E.static_len = 0, E.last_lit = E.matches = 0;
					}
					function na(E) {
						8 < E.bi_valid ? H(E, E.bi_buf) : 0 < E.bi_valid && (E.pending_buf[E.pending++] = E.bi_buf), E.bi_buf = 0, E.bi_valid = 0;
					}
					function U(E, Q, Fe, Ce) {
						var re = 2 * Q, Pe = 2 * Fe;
						return E[re] < E[Pe] || E[re] === E[Pe] && Ce[Q] <= Ce[Fe];
					}
					function ga(E, Q, Fe) {
						for (var Ce = E.heap[Fe], re = Fe << 1; re <= E.heap_len && (re < E.heap_len && U(Q, E.heap[re + 1], E.heap[re], E.depth) && re++, !U(Q, Ce, E.heap[re], E.depth));) E.heap[Fe] = E.heap[re], Fe = re, re <<= 1;
						E.heap[Fe] = Ce;
					}
					function Ba(E, Q, Fe) {
						var Ce, re, Pe, He, We = 0;
						if (E.last_lit !== 0) for (; Ce = E.pending_buf[E.d_buf + 2 * We] << 8 | E.pending_buf[E.d_buf + 2 * We + 1], re = E.pending_buf[E.l_buf + We], We++, Ce === 0 ? Te(E, re, Q) : (Te(E, (Pe = y[re]) + T + 1, Q), (He = ne[Pe]) !== 0 && Le(E, re -= X[Pe], He), Te(E, Pe = _(--Ce), Fe), (He = ce[Pe]) !== 0 && Le(E, Ce -= pe[Pe], He)), We < E.last_lit;);
						Te(E, l, Q);
					}
					function Ya(E, Q) {
						var Fe, Ce, re, Pe = Q.dyn_tree, He = Q.stat_desc.static_tree, We = Q.stat_desc.has_stree, ia = Q.stat_desc.elems, za = -1;
						for (E.heap_len = 0, E.heap_max = b, Fe = 0; Fe < ia; Fe++) Pe[2 * Fe] !== 0 ? (E.heap[++E.heap_len] = za = Fe, E.depth[Fe] = 0) : Pe[2 * Fe + 1] = 0;
						for (; E.heap_len < 2;) Pe[2 * (re = E.heap[++E.heap_len] = za < 2 ? ++za : 0)] = 1, E.depth[re] = 0, E.opt_len--, We && (E.static_len -= He[2 * re + 1]);
						for (Q.max_code = za, Fe = E.heap_len >> 1; 1 <= Fe; Fe--) ga(E, Pe, Fe);
						for (re = ia; Fe = E.heap[1], E.heap[1] = E.heap[E.heap_len--], ga(E, Pe, 1), Ce = E.heap[1], E.heap[--E.heap_max] = Fe, E.heap[--E.heap_max] = Ce, Pe[2 * re] = Pe[2 * Fe] + Pe[2 * Ce], E.depth[re] = (E.depth[Fe] >= E.depth[Ce] ? E.depth[Fe] : E.depth[Ce]) + 1, Pe[2 * Fe + 1] = Pe[2 * Ce + 1] = re, E.heap[1] = re++, ga(E, Pe, 1), 2 <= E.heap_len;);
						E.heap[--E.heap_max] = E.heap[1], (function(Ia, rn) {
							var jn, dn, Mn, dt, Rr, vd, gn = rn.dyn_tree, ri = rn.max_code, os = rn.stat_desc.static_tree, cs = rn.stat_desc.has_stree, ss = rn.stat_desc.extra_bits, Zo = rn.stat_desc.extra_base, Lr = rn.stat_desc.max_length, Ft = 0;
							for (dt = 0; dt <= L; dt++) Ia.bl_count[dt] = 0;
							for (gn[2 * Ia.heap[Ia.heap_max] + 1] = 0, jn = Ia.heap_max + 1; jn < b; jn++) Lr < (dt = gn[2 * gn[2 * (dn = Ia.heap[jn]) + 1] + 1] + 1) && (dt = Lr, Ft++), gn[2 * dn + 1] = dt, ri < dn || (Ia.bl_count[dt]++, Rr = 0, Zo <= dn && (Rr = ss[dn - Zo]), vd = gn[2 * dn], Ia.opt_len += vd * (dt + Rr), cs && (Ia.static_len += vd * (os[2 * dn + 1] + Rr)));
							if (Ft !== 0) {
								do {
									for (dt = Lr - 1; Ia.bl_count[dt] === 0;) dt--;
									Ia.bl_count[dt]--, Ia.bl_count[dt + 1] += 2, Ia.bl_count[Lr]--, Ft -= 2;
								} while (0 < Ft);
								for (dt = Lr; dt !== 0; dt--) for (dn = Ia.bl_count[dt]; dn !== 0;) ri < (Mn = Ia.heap[--jn]) || (gn[2 * Mn + 1] !== dt && (Ia.opt_len += (dt - gn[2 * Mn + 1]) * gn[2 * Mn], gn[2 * Mn + 1] = dt), dn--);
							}
						})(E, Q), ya(Pe, za, E.bl_count);
					}
					function u(E, Q, Fe) {
						var Ce, re, Pe = -1, He = Q[1], We = 0, ia = 7, za = 4;
						for (He === 0 && (ia = 138, za = 3), Q[2 * (Fe + 1) + 1] = 65535, Ce = 0; Ce <= Fe; Ce++) re = He, He = Q[2 * (Ce + 1) + 1], ++We < ia && re === He || (We < za ? E.bl_tree[2 * re] += We : re !== 0 ? (re !== Pe && E.bl_tree[2 * re]++, E.bl_tree[2 * M]++) : We <= 10 ? E.bl_tree[2 * J]++ : E.bl_tree[2 * se]++, Pe = re, za = (We = 0) === He ? (ia = 138, 3) : re === He ? (ia = 6, 3) : (ia = 7, 4));
					}
					function De(E, Q, Fe) {
						var Ce, re, Pe = -1, He = Q[1], We = 0, ia = 7, za = 4;
						for (He === 0 && (ia = 138, za = 3), Ce = 0; Ce <= Fe; Ce++) if (re = He, He = Q[2 * (Ce + 1) + 1], !(++We < ia && re === He)) {
							if (We < za) for (; Te(E, re, E.bl_tree), --We != 0;);
							else re !== 0 ? (re !== Pe && (Te(E, re, E.bl_tree), We--), Te(E, M, E.bl_tree), Le(E, We - 3, 2)) : We <= 10 ? (Te(E, J, E.bl_tree), Le(E, We - 3, 3)) : (Te(E, se, E.bl_tree), Le(E, We - 11, 7));
							Pe = re, za = (We = 0) === He ? (ia = 138, 3) : re === He ? (ia = 6, 3) : (ia = 7, 4);
						}
					}
					g(pe);
					var de = !1;
					function z(E, Q, Fe, Ce) {
						Le(E, (f << 1) + (Ce ? 1 : 0), 3), (function(re, Pe, He, We) {
							na(re), We && (H(re, He), H(re, ~He)), r.arraySet(re.pending_buf, re.window, Pe, He, re.pending), re.pending += He;
						})(E, Q, Fe, !0);
					}
					o._tr_init = function(E) {
						de || ((function() {
							var Q, Fe, Ce, re, Pe, He = new Array(L + 1);
							for (re = Ce = 0; re < D - 1; re++) for (X[re] = Ce, Q = 0; Q < 1 << ne[re]; Q++) y[Ce++] = re;
							for (y[Ce - 1] = re, re = Pe = 0; re < 16; re++) for (pe[re] = Pe, Q = 0; Q < 1 << ce[re]; Q++) K[Pe++] = re;
							for (Pe >>= 7; re < m; re++) for (pe[re] = Pe << 7, Q = 0; Q < 1 << ce[re] - 7; Q++) K[256 + Pe++] = re;
							for (Fe = 0; Fe <= L; Fe++) He[Fe] = 0;
							for (Q = 0; Q <= 143;) ve[2 * Q + 1] = 8, Q++, He[8]++;
							for (; Q <= 255;) ve[2 * Q + 1] = 9, Q++, He[9]++;
							for (; Q <= 279;) ve[2 * Q + 1] = 7, Q++, He[7]++;
							for (; Q <= 287;) ve[2 * Q + 1] = 8, Q++, He[8]++;
							for (ya(ve, w + 1, He), Q = 0; Q < m; Q++) S[2 * Q + 1] = 5, S[2 * Q] = Ua(Q, 5);
							le = new Be(ve, ne, T + 1, w, L), t = new Be(S, ce, 0, m, L), n = new Be(new Array(0), N, 0, x, p);
						})(), de = !0), E.l_desc = new W(E.dyn_ltree, le), E.d_desc = new W(E.dyn_dtree, t), E.bl_desc = new W(E.bl_tree, n), E.bi_buf = 0, E.bi_valid = 0, pa(E);
					}, o._tr_stored_block = z, o._tr_flush_block = function(E, Q, Fe, Ce) {
						var re, Pe, He = 0;
						0 < E.level ? (E.strm.data_type === 2 && (E.strm.data_type = (function(We) {
							var ia, za = 4093624447;
							for (ia = 0; ia <= 31; ia++, za >>>= 1) if (1 & za && We.dyn_ltree[2 * ia] !== 0) return d;
							if (We.dyn_ltree[18] !== 0 || We.dyn_ltree[20] !== 0 || We.dyn_ltree[26] !== 0) return s;
							for (ia = 32; ia < T; ia++) if (We.dyn_ltree[2 * ia] !== 0) return s;
							return d;
						})(E)), Ya(E, E.l_desc), Ya(E, E.d_desc), He = (function(We) {
							var ia;
							for (u(We, We.dyn_ltree, We.l_desc.max_code), u(We, We.dyn_dtree, We.d_desc.max_code), Ya(We, We.bl_desc), ia = x - 1; 3 <= ia && We.bl_tree[2 * ke[ia] + 1] === 0; ia--);
							return We.opt_len += 3 * (ia + 1) + 5 + 5 + 4, ia;
						})(E), re = E.opt_len + 3 + 7 >>> 3, (Pe = E.static_len + 3 + 7 >>> 3) <= re && (re = Pe)) : re = Pe = Fe + 5, Fe + 4 <= re && Q !== -1 ? z(E, Q, Fe, Ce) : E.strategy === 4 || Pe === re ? (Le(E, 2 + (Ce ? 1 : 0), 3), Ba(E, ve, S)) : (Le(E, 4 + (Ce ? 1 : 0), 3), (function(We, ia, za, Ia) {
							var rn;
							for (Le(We, ia - 257, 5), Le(We, za - 1, 5), Le(We, Ia - 4, 4), rn = 0; rn < Ia; rn++) Le(We, We.bl_tree[2 * ke[rn] + 1], 3);
							De(We, We.dyn_ltree, ia - 1), De(We, We.dyn_dtree, za - 1);
						})(E, E.l_desc.max_code + 1, E.d_desc.max_code + 1, He + 1), Ba(E, E.dyn_ltree, E.dyn_dtree)), pa(E), Ce && na(E);
					}, o._tr_tally = function(E, Q, Fe) {
						return E.pending_buf[E.d_buf + 2 * E.last_lit] = Q >>> 8 & 255, E.pending_buf[E.d_buf + 2 * E.last_lit + 1] = 255 & Q, E.pending_buf[E.l_buf + E.last_lit] = 255 & Fe, E.last_lit++, Q === 0 ? E.dyn_ltree[2 * Fe]++ : (E.matches++, Q--, E.dyn_ltree[2 * (y[Fe] + T + 1)]++, E.dyn_dtree[2 * _(Q)]++), E.last_lit === E.lit_bufsize - 1;
					}, o._tr_align = function(E) {
						Le(E, 2, 3), Te(E, l, ve), (function(Q) {
							Q.bi_valid === 16 ? (H(Q, Q.bi_buf), Q.bi_buf = 0, Q.bi_valid = 0) : 8 <= Q.bi_valid && (Q.pending_buf[Q.pending++] = 255 & Q.bi_buf, Q.bi_buf >>= 8, Q.bi_valid -= 8);
						})(E);
					};
				}, { "../utils/common": 41 }],
				53: [function(a, h, o) {
					"use strict";
					h.exports = function() {
						this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
					};
				}, {}],
				54: [function(a, h, o) {
					(function(r) {
						(function(d, s) {
							"use strict";
							if (!d.setImmediate) {
								var g, f, D, T, w = 1, m = {}, x = !1, b = d.document, L = Object.getPrototypeOf && Object.getPrototypeOf(d);
								L = L && L.setTimeout ? L : d, g = {}.toString.call(d.process) === "[object process]" ? function(M) {
									process.nextTick(function() {
										p(M);
									});
								} : (function() {
									if (d.postMessage && !d.importScripts) {
										var M = !0, J = d.onmessage;
										return d.onmessage = function() {
											M = !1;
										}, d.postMessage("", "*"), d.onmessage = J, M;
									}
								})() ? (T = "setImmediate$" + Math.random() + "$", d.addEventListener ? d.addEventListener("message", l, !1) : d.attachEvent("onmessage", l), function(M) {
									d.postMessage(T + M, "*");
								}) : d.MessageChannel ? ((D = new MessageChannel()).port1.onmessage = function(M) {
									p(M.data);
								}, function(M) {
									D.port2.postMessage(M);
								}) : b && "onreadystatechange" in b.createElement("script") ? (f = b.documentElement, function(M) {
									var J = b.createElement("script");
									J.onreadystatechange = function() {
										p(M), J.onreadystatechange = null, f.removeChild(J), J = null;
									}, f.appendChild(J);
								}) : function(M) {
									setTimeout(p, 0, M);
								}, L.setImmediate = function(M) {
									typeof M != "function" && (M = new Function("" + M));
									for (var J = new Array(arguments.length - 1), se = 0; se < J.length; se++) J[se] = arguments[se + 1];
									return m[w] = {
										callback: M,
										args: J
									}, g(w), w++;
								}, L.clearImmediate = v;
							}
							function v(M) {
								delete m[M];
							}
							function p(M) {
								if (x) setTimeout(p, 0, M);
								else {
									var J = m[M];
									if (J) {
										x = !0;
										try {
											(function(se) {
												var ne = se.callback, ce = se.args;
												switch (ce.length) {
													case 0:
														ne();
														break;
													case 1:
														ne(ce[0]);
														break;
													case 2:
														ne(ce[0], ce[1]);
														break;
													case 3:
														ne(ce[0], ce[1], ce[2]);
														break;
													default: ne.apply(s, ce);
												}
											})(J);
										} finally {
											v(M), x = !1;
										}
									}
								}
							}
							function l(M) {
								M.source === d && typeof M.data == "string" && M.data.indexOf(T) === 0 && p(+M.data.slice(T.length));
							}
						})(typeof self == "undefined" ? r === void 0 ? this : r : self);
					}).call(this, typeof global != "undefined" ? global : typeof self != "undefined" ? self : typeof window != "undefined" ? window : {});
				}, {}]
			}, {}, [10])(10);
		});
	}), Af = n1((e) => {
		"use strict";
		Object.defineProperty(e, "__esModule", { value: !0 }), e.default = [
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "32",
				"Dingbat hex": "20",
				"Unicode dec": "32",
				"Unicode hex": "20"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "33",
				"Dingbat hex": "21",
				"Unicode dec": "33",
				"Unicode hex": "21"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "34",
				"Dingbat hex": "22",
				"Unicode dec": "8704",
				"Unicode hex": "2200"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "35",
				"Dingbat hex": "23",
				"Unicode dec": "35",
				"Unicode hex": "23"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "36",
				"Dingbat hex": "24",
				"Unicode dec": "8707",
				"Unicode hex": "2203"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "37",
				"Dingbat hex": "25",
				"Unicode dec": "37",
				"Unicode hex": "25"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "38",
				"Dingbat hex": "26",
				"Unicode dec": "38",
				"Unicode hex": "26"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "39",
				"Dingbat hex": "27",
				"Unicode dec": "8717",
				"Unicode hex": "220D"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "40",
				"Dingbat hex": "28",
				"Unicode dec": "40",
				"Unicode hex": "28"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "41",
				"Dingbat hex": "29",
				"Unicode dec": "41",
				"Unicode hex": "29"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "42",
				"Dingbat hex": "2A",
				"Unicode dec": "42",
				"Unicode hex": "2A"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "43",
				"Dingbat hex": "2B",
				"Unicode dec": "43",
				"Unicode hex": "2B"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "44",
				"Dingbat hex": "2C",
				"Unicode dec": "44",
				"Unicode hex": "2C"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "45",
				"Dingbat hex": "2D",
				"Unicode dec": "8722",
				"Unicode hex": "2212"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "46",
				"Dingbat hex": "2E",
				"Unicode dec": "46",
				"Unicode hex": "2E"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "47",
				"Dingbat hex": "2F",
				"Unicode dec": "47",
				"Unicode hex": "2F"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "48",
				"Dingbat hex": "30",
				"Unicode dec": "48",
				"Unicode hex": "30"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "49",
				"Dingbat hex": "31",
				"Unicode dec": "49",
				"Unicode hex": "31"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "50",
				"Dingbat hex": "32",
				"Unicode dec": "50",
				"Unicode hex": "32"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "51",
				"Dingbat hex": "33",
				"Unicode dec": "51",
				"Unicode hex": "33"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "52",
				"Dingbat hex": "34",
				"Unicode dec": "52",
				"Unicode hex": "34"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "53",
				"Dingbat hex": "35",
				"Unicode dec": "53",
				"Unicode hex": "35"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "54",
				"Dingbat hex": "36",
				"Unicode dec": "54",
				"Unicode hex": "36"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "55",
				"Dingbat hex": "37",
				"Unicode dec": "55",
				"Unicode hex": "37"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "56",
				"Dingbat hex": "38",
				"Unicode dec": "56",
				"Unicode hex": "38"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "57",
				"Dingbat hex": "39",
				"Unicode dec": "57",
				"Unicode hex": "39"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "58",
				"Dingbat hex": "3A",
				"Unicode dec": "58",
				"Unicode hex": "3A"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "59",
				"Dingbat hex": "3B",
				"Unicode dec": "59",
				"Unicode hex": "3B"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "60",
				"Dingbat hex": "3C",
				"Unicode dec": "60",
				"Unicode hex": "3C"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "61",
				"Dingbat hex": "3D",
				"Unicode dec": "61",
				"Unicode hex": "3D"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "62",
				"Dingbat hex": "3E",
				"Unicode dec": "62",
				"Unicode hex": "3E"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "63",
				"Dingbat hex": "3F",
				"Unicode dec": "63",
				"Unicode hex": "3F"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "64",
				"Dingbat hex": "40",
				"Unicode dec": "8773",
				"Unicode hex": "2245"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "65",
				"Dingbat hex": "41",
				"Unicode dec": "913",
				"Unicode hex": "391"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "66",
				"Dingbat hex": "42",
				"Unicode dec": "914",
				"Unicode hex": "392"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "67",
				"Dingbat hex": "43",
				"Unicode dec": "935",
				"Unicode hex": "3A7"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "68",
				"Dingbat hex": "44",
				"Unicode dec": "916",
				"Unicode hex": "394"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "69",
				"Dingbat hex": "45",
				"Unicode dec": "917",
				"Unicode hex": "395"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "70",
				"Dingbat hex": "46",
				"Unicode dec": "934",
				"Unicode hex": "3A6"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "71",
				"Dingbat hex": "47",
				"Unicode dec": "915",
				"Unicode hex": "393"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "72",
				"Dingbat hex": "48",
				"Unicode dec": "919",
				"Unicode hex": "397"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "73",
				"Dingbat hex": "49",
				"Unicode dec": "921",
				"Unicode hex": "399"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "74",
				"Dingbat hex": "4A",
				"Unicode dec": "977",
				"Unicode hex": "3D1"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "75",
				"Dingbat hex": "4B",
				"Unicode dec": "922",
				"Unicode hex": "39A"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "76",
				"Dingbat hex": "4C",
				"Unicode dec": "923",
				"Unicode hex": "39B"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "77",
				"Dingbat hex": "4D",
				"Unicode dec": "924",
				"Unicode hex": "39C"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "78",
				"Dingbat hex": "4E",
				"Unicode dec": "925",
				"Unicode hex": "39D"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "79",
				"Dingbat hex": "4F",
				"Unicode dec": "927",
				"Unicode hex": "39F"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "80",
				"Dingbat hex": "50",
				"Unicode dec": "928",
				"Unicode hex": "3A0"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "81",
				"Dingbat hex": "51",
				"Unicode dec": "920",
				"Unicode hex": "398"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "82",
				"Dingbat hex": "52",
				"Unicode dec": "929",
				"Unicode hex": "3A1"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "83",
				"Dingbat hex": "53",
				"Unicode dec": "931",
				"Unicode hex": "3A3"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "84",
				"Dingbat hex": "54",
				"Unicode dec": "932",
				"Unicode hex": "3A4"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "85",
				"Dingbat hex": "55",
				"Unicode dec": "933",
				"Unicode hex": "3A5"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "86",
				"Dingbat hex": "56",
				"Unicode dec": "962",
				"Unicode hex": "3C2"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "87",
				"Dingbat hex": "57",
				"Unicode dec": "937",
				"Unicode hex": "3A9"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "88",
				"Dingbat hex": "58",
				"Unicode dec": "926",
				"Unicode hex": "39E"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "89",
				"Dingbat hex": "59",
				"Unicode dec": "936",
				"Unicode hex": "3A8"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "90",
				"Dingbat hex": "5A",
				"Unicode dec": "918",
				"Unicode hex": "396"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "91",
				"Dingbat hex": "5B",
				"Unicode dec": "91",
				"Unicode hex": "5B"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "92",
				"Dingbat hex": "5C",
				"Unicode dec": "8756",
				"Unicode hex": "2234"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "93",
				"Dingbat hex": "5D",
				"Unicode dec": "93",
				"Unicode hex": "5D"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "94",
				"Dingbat hex": "5E",
				"Unicode dec": "8869",
				"Unicode hex": "22A5"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "95",
				"Dingbat hex": "5F",
				"Unicode dec": "95",
				"Unicode hex": "5F"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "96",
				"Dingbat hex": "60",
				"Unicode dec": "8254",
				"Unicode hex": "203E"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "97",
				"Dingbat hex": "61",
				"Unicode dec": "945",
				"Unicode hex": "3B1"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "98",
				"Dingbat hex": "62",
				"Unicode dec": "946",
				"Unicode hex": "3B2"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "99",
				"Dingbat hex": "63",
				"Unicode dec": "967",
				"Unicode hex": "3C7"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "100",
				"Dingbat hex": "64",
				"Unicode dec": "948",
				"Unicode hex": "3B4"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "101",
				"Dingbat hex": "65",
				"Unicode dec": "949",
				"Unicode hex": "3B5"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "102",
				"Dingbat hex": "66",
				"Unicode dec": "966",
				"Unicode hex": "3C6"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "103",
				"Dingbat hex": "67",
				"Unicode dec": "947",
				"Unicode hex": "3B3"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "104",
				"Dingbat hex": "68",
				"Unicode dec": "951",
				"Unicode hex": "3B7"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "105",
				"Dingbat hex": "69",
				"Unicode dec": "953",
				"Unicode hex": "3B9"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "106",
				"Dingbat hex": "6A",
				"Unicode dec": "981",
				"Unicode hex": "3D5"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "107",
				"Dingbat hex": "6B",
				"Unicode dec": "954",
				"Unicode hex": "3BA"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "108",
				"Dingbat hex": "6C",
				"Unicode dec": "955",
				"Unicode hex": "3BB"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "109",
				"Dingbat hex": "6D",
				"Unicode dec": "956",
				"Unicode hex": "3BC"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "110",
				"Dingbat hex": "6E",
				"Unicode dec": "957",
				"Unicode hex": "3BD"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "111",
				"Dingbat hex": "6F",
				"Unicode dec": "959",
				"Unicode hex": "3BF"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "112",
				"Dingbat hex": "70",
				"Unicode dec": "960",
				"Unicode hex": "3C0"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "113",
				"Dingbat hex": "71",
				"Unicode dec": "952",
				"Unicode hex": "3B8"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "114",
				"Dingbat hex": "72",
				"Unicode dec": "961",
				"Unicode hex": "3C1"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "115",
				"Dingbat hex": "73",
				"Unicode dec": "963",
				"Unicode hex": "3C3"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "116",
				"Dingbat hex": "74",
				"Unicode dec": "964",
				"Unicode hex": "3C4"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "117",
				"Dingbat hex": "75",
				"Unicode dec": "965",
				"Unicode hex": "3C5"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "118",
				"Dingbat hex": "76",
				"Unicode dec": "982",
				"Unicode hex": "3D6"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "119",
				"Dingbat hex": "77",
				"Unicode dec": "969",
				"Unicode hex": "3C9"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "120",
				"Dingbat hex": "78",
				"Unicode dec": "958",
				"Unicode hex": "3BE"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "121",
				"Dingbat hex": "79",
				"Unicode dec": "968",
				"Unicode hex": "3C8"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "122",
				"Dingbat hex": "7A",
				"Unicode dec": "950",
				"Unicode hex": "3B6"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "123",
				"Dingbat hex": "7B",
				"Unicode dec": "123",
				"Unicode hex": "7B"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "124",
				"Dingbat hex": "7C",
				"Unicode dec": "124",
				"Unicode hex": "7C"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "125",
				"Dingbat hex": "7D",
				"Unicode dec": "125",
				"Unicode hex": "7D"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "126",
				"Dingbat hex": "7E",
				"Unicode dec": "126",
				"Unicode hex": "7E"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "160",
				"Dingbat hex": "A0",
				"Unicode dec": "8364",
				"Unicode hex": "20AC"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "161",
				"Dingbat hex": "A1",
				"Unicode dec": "978",
				"Unicode hex": "3D2"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "162",
				"Dingbat hex": "A2",
				"Unicode dec": "8242",
				"Unicode hex": "2032"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "163",
				"Dingbat hex": "A3",
				"Unicode dec": "8804",
				"Unicode hex": "2264"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "164",
				"Dingbat hex": "A4",
				"Unicode dec": "8260",
				"Unicode hex": "2044"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "165",
				"Dingbat hex": "A5",
				"Unicode dec": "8734",
				"Unicode hex": "221E"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "166",
				"Dingbat hex": "A6",
				"Unicode dec": "402",
				"Unicode hex": "192"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "167",
				"Dingbat hex": "A7",
				"Unicode dec": "9827",
				"Unicode hex": "2663"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "168",
				"Dingbat hex": "A8",
				"Unicode dec": "9830",
				"Unicode hex": "2666"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "169",
				"Dingbat hex": "A9",
				"Unicode dec": "9829",
				"Unicode hex": "2665"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "170",
				"Dingbat hex": "AA",
				"Unicode dec": "9824",
				"Unicode hex": "2660"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "171",
				"Dingbat hex": "AB",
				"Unicode dec": "8596",
				"Unicode hex": "2194"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "172",
				"Dingbat hex": "AC",
				"Unicode dec": "8592",
				"Unicode hex": "2190"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "173",
				"Dingbat hex": "AD",
				"Unicode dec": "8593",
				"Unicode hex": "2191"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "174",
				"Dingbat hex": "AE",
				"Unicode dec": "8594",
				"Unicode hex": "2192"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "175",
				"Dingbat hex": "AF",
				"Unicode dec": "8595",
				"Unicode hex": "2193"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "176",
				"Dingbat hex": "B0",
				"Unicode dec": "176",
				"Unicode hex": "B0"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "177",
				"Dingbat hex": "B1",
				"Unicode dec": "177",
				"Unicode hex": "B1"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "178",
				"Dingbat hex": "B2",
				"Unicode dec": "8243",
				"Unicode hex": "2033"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "179",
				"Dingbat hex": "B3",
				"Unicode dec": "8805",
				"Unicode hex": "2265"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "180",
				"Dingbat hex": "B4",
				"Unicode dec": "215",
				"Unicode hex": "D7"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "181",
				"Dingbat hex": "B5",
				"Unicode dec": "8733",
				"Unicode hex": "221D"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "182",
				"Dingbat hex": "B6",
				"Unicode dec": "8706",
				"Unicode hex": "2202"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "183",
				"Dingbat hex": "B7",
				"Unicode dec": "8226",
				"Unicode hex": "2022"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "184",
				"Dingbat hex": "B8",
				"Unicode dec": "247",
				"Unicode hex": "F7"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "185",
				"Dingbat hex": "B9",
				"Unicode dec": "8800",
				"Unicode hex": "2260"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "186",
				"Dingbat hex": "BA",
				"Unicode dec": "8801",
				"Unicode hex": "2261"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "187",
				"Dingbat hex": "BB",
				"Unicode dec": "8776",
				"Unicode hex": "2248"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "188",
				"Dingbat hex": "BC",
				"Unicode dec": "8230",
				"Unicode hex": "2026"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "189",
				"Dingbat hex": "BD",
				"Unicode dec": "9168",
				"Unicode hex": "23D0"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "190",
				"Dingbat hex": "BE",
				"Unicode dec": "9135",
				"Unicode hex": "23AF"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "191",
				"Dingbat hex": "BF",
				"Unicode dec": "8629",
				"Unicode hex": "21B5"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "192",
				"Dingbat hex": "C0",
				"Unicode dec": "8501",
				"Unicode hex": "2135"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "193",
				"Dingbat hex": "C1",
				"Unicode dec": "8465",
				"Unicode hex": "2111"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "194",
				"Dingbat hex": "C2",
				"Unicode dec": "8476",
				"Unicode hex": "211C"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "195",
				"Dingbat hex": "C3",
				"Unicode dec": "8472",
				"Unicode hex": "2118"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "196",
				"Dingbat hex": "C4",
				"Unicode dec": "8855",
				"Unicode hex": "2297"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "197",
				"Dingbat hex": "C5",
				"Unicode dec": "8853",
				"Unicode hex": "2295"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "198",
				"Dingbat hex": "C6",
				"Unicode dec": "8709",
				"Unicode hex": "2205"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "199",
				"Dingbat hex": "C7",
				"Unicode dec": "8745",
				"Unicode hex": "2229"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "200",
				"Dingbat hex": "C8",
				"Unicode dec": "8746",
				"Unicode hex": "222A"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "201",
				"Dingbat hex": "C9",
				"Unicode dec": "8835",
				"Unicode hex": "2283"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "202",
				"Dingbat hex": "CA",
				"Unicode dec": "8839",
				"Unicode hex": "2287"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "203",
				"Dingbat hex": "CB",
				"Unicode dec": "8836",
				"Unicode hex": "2284"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "204",
				"Dingbat hex": "CC",
				"Unicode dec": "8834",
				"Unicode hex": "2282"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "205",
				"Dingbat hex": "CD",
				"Unicode dec": "8838",
				"Unicode hex": "2286"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "206",
				"Dingbat hex": "CE",
				"Unicode dec": "8712",
				"Unicode hex": "2208"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "207",
				"Dingbat hex": "CF",
				"Unicode dec": "8713",
				"Unicode hex": "2209"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "208",
				"Dingbat hex": "D0",
				"Unicode dec": "8736",
				"Unicode hex": "2220"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "209",
				"Dingbat hex": "D1",
				"Unicode dec": "8711",
				"Unicode hex": "2207"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "210",
				"Dingbat hex": "D2",
				"Unicode dec": "174",
				"Unicode hex": "AE"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "211",
				"Dingbat hex": "D3",
				"Unicode dec": "169",
				"Unicode hex": "A9"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "212",
				"Dingbat hex": "D4",
				"Unicode dec": "8482",
				"Unicode hex": "2122"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "213",
				"Dingbat hex": "D5",
				"Unicode dec": "8719",
				"Unicode hex": "220F"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "214",
				"Dingbat hex": "D6",
				"Unicode dec": "8730",
				"Unicode hex": "221A"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "215",
				"Dingbat hex": "D7",
				"Unicode dec": "8901",
				"Unicode hex": "22C5"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "216",
				"Dingbat hex": "D8",
				"Unicode dec": "172",
				"Unicode hex": "AC"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "217",
				"Dingbat hex": "D9",
				"Unicode dec": "8743",
				"Unicode hex": "2227"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "218",
				"Dingbat hex": "DA",
				"Unicode dec": "8744",
				"Unicode hex": "2228"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "219",
				"Dingbat hex": "DB",
				"Unicode dec": "8660",
				"Unicode hex": "21D4"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "220",
				"Dingbat hex": "DC",
				"Unicode dec": "8656",
				"Unicode hex": "21D0"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "221",
				"Dingbat hex": "DD",
				"Unicode dec": "8657",
				"Unicode hex": "21D1"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "222",
				"Dingbat hex": "DE",
				"Unicode dec": "8658",
				"Unicode hex": "21D2"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "223",
				"Dingbat hex": "DF",
				"Unicode dec": "8659",
				"Unicode hex": "21D3"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "224",
				"Dingbat hex": "E0",
				"Unicode dec": "9674",
				"Unicode hex": "25CA"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "225",
				"Dingbat hex": "E1",
				"Unicode dec": "12296",
				"Unicode hex": "3008"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "226",
				"Dingbat hex": "E2",
				"Unicode dec": "174",
				"Unicode hex": "AE"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "227",
				"Dingbat hex": "E3",
				"Unicode dec": "169",
				"Unicode hex": "A9"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "228",
				"Dingbat hex": "E4",
				"Unicode dec": "8482",
				"Unicode hex": "2122"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "229",
				"Dingbat hex": "E5",
				"Unicode dec": "8721",
				"Unicode hex": "2211"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "230",
				"Dingbat hex": "E6",
				"Unicode dec": "9115",
				"Unicode hex": "239B"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "231",
				"Dingbat hex": "E7",
				"Unicode dec": "9116",
				"Unicode hex": "239C"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "232",
				"Dingbat hex": "E8",
				"Unicode dec": "9117",
				"Unicode hex": "239D"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "233",
				"Dingbat hex": "E9",
				"Unicode dec": "9121",
				"Unicode hex": "23A1"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "234",
				"Dingbat hex": "EA",
				"Unicode dec": "9122",
				"Unicode hex": "23A2"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "235",
				"Dingbat hex": "EB",
				"Unicode dec": "9123",
				"Unicode hex": "23A3"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "236",
				"Dingbat hex": "EC",
				"Unicode dec": "9127",
				"Unicode hex": "23A7"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "237",
				"Dingbat hex": "ED",
				"Unicode dec": "9128",
				"Unicode hex": "23A8"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "238",
				"Dingbat hex": "EE",
				"Unicode dec": "9129",
				"Unicode hex": "23A9"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "239",
				"Dingbat hex": "EF",
				"Unicode dec": "9130",
				"Unicode hex": "23AA"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "240",
				"Dingbat hex": "F0",
				"Unicode dec": "63743",
				"Unicode hex": "F8FF"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "241",
				"Dingbat hex": "F1",
				"Unicode dec": "12297",
				"Unicode hex": "3009"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "242",
				"Dingbat hex": "F2",
				"Unicode dec": "8747",
				"Unicode hex": "222B"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "243",
				"Dingbat hex": "F3",
				"Unicode dec": "8992",
				"Unicode hex": "2320"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "244",
				"Dingbat hex": "F4",
				"Unicode dec": "9134",
				"Unicode hex": "23AE"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "245",
				"Dingbat hex": "F5",
				"Unicode dec": "8993",
				"Unicode hex": "2321"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "246",
				"Dingbat hex": "F6",
				"Unicode dec": "9118",
				"Unicode hex": "239E"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "247",
				"Dingbat hex": "F7",
				"Unicode dec": "9119",
				"Unicode hex": "239F"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "248",
				"Dingbat hex": "F8",
				"Unicode dec": "9120",
				"Unicode hex": "23A0"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "249",
				"Dingbat hex": "F9",
				"Unicode dec": "9124",
				"Unicode hex": "23A4"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "250",
				"Dingbat hex": "FA",
				"Unicode dec": "9125",
				"Unicode hex": "23A5"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "251",
				"Dingbat hex": "FB",
				"Unicode dec": "9126",
				"Unicode hex": "23A6"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "252",
				"Dingbat hex": "FC",
				"Unicode dec": "9131",
				"Unicode hex": "23AB"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "253",
				"Dingbat hex": "FD",
				"Unicode dec": "9132",
				"Unicode hex": "23AC"
			},
			{
				"Typeface name": "Symbol",
				"Dingbat dec": "254",
				"Dingbat hex": "FE",
				"Unicode dec": "9133",
				"Unicode hex": "23AD"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "32",
				"Dingbat hex": "20",
				"Unicode dec": "32",
				"Unicode hex": "20"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "33",
				"Dingbat hex": "21",
				"Unicode dec": "128375",
				"Unicode hex": "1F577"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "34",
				"Dingbat hex": "22",
				"Unicode dec": "128376",
				"Unicode hex": "1F578"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "35",
				"Dingbat hex": "23",
				"Unicode dec": "128370",
				"Unicode hex": "1F572"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "36",
				"Dingbat hex": "24",
				"Unicode dec": "128374",
				"Unicode hex": "1F576"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "37",
				"Dingbat hex": "25",
				"Unicode dec": "127942",
				"Unicode hex": "1F3C6"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "38",
				"Dingbat hex": "26",
				"Unicode dec": "127894",
				"Unicode hex": "1F396"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "39",
				"Dingbat hex": "27",
				"Unicode dec": "128391",
				"Unicode hex": "1F587"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "40",
				"Dingbat hex": "28",
				"Unicode dec": "128488",
				"Unicode hex": "1F5E8"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "41",
				"Dingbat hex": "29",
				"Unicode dec": "128489",
				"Unicode hex": "1F5E9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "42",
				"Dingbat hex": "2A",
				"Unicode dec": "128496",
				"Unicode hex": "1F5F0"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "43",
				"Dingbat hex": "2B",
				"Unicode dec": "128497",
				"Unicode hex": "1F5F1"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "44",
				"Dingbat hex": "2C",
				"Unicode dec": "127798",
				"Unicode hex": "1F336"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "45",
				"Dingbat hex": "2D",
				"Unicode dec": "127895",
				"Unicode hex": "1F397"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "46",
				"Dingbat hex": "2E",
				"Unicode dec": "128638",
				"Unicode hex": "1F67E"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "47",
				"Dingbat hex": "2F",
				"Unicode dec": "128636",
				"Unicode hex": "1F67C"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "48",
				"Dingbat hex": "30",
				"Unicode dec": "128469",
				"Unicode hex": "1F5D5"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "49",
				"Dingbat hex": "31",
				"Unicode dec": "128470",
				"Unicode hex": "1F5D6"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "50",
				"Dingbat hex": "32",
				"Unicode dec": "128471",
				"Unicode hex": "1F5D7"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "51",
				"Dingbat hex": "33",
				"Unicode dec": "9204",
				"Unicode hex": "23F4"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "52",
				"Dingbat hex": "34",
				"Unicode dec": "9205",
				"Unicode hex": "23F5"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "53",
				"Dingbat hex": "35",
				"Unicode dec": "9206",
				"Unicode hex": "23F6"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "54",
				"Dingbat hex": "36",
				"Unicode dec": "9207",
				"Unicode hex": "23F7"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "55",
				"Dingbat hex": "37",
				"Unicode dec": "9194",
				"Unicode hex": "23EA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "56",
				"Dingbat hex": "38",
				"Unicode dec": "9193",
				"Unicode hex": "23E9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "57",
				"Dingbat hex": "39",
				"Unicode dec": "9198",
				"Unicode hex": "23EE"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "58",
				"Dingbat hex": "3A",
				"Unicode dec": "9197",
				"Unicode hex": "23ED"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "59",
				"Dingbat hex": "3B",
				"Unicode dec": "9208",
				"Unicode hex": "23F8"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "60",
				"Dingbat hex": "3C",
				"Unicode dec": "9209",
				"Unicode hex": "23F9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "61",
				"Dingbat hex": "3D",
				"Unicode dec": "9210",
				"Unicode hex": "23FA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "62",
				"Dingbat hex": "3E",
				"Unicode dec": "128474",
				"Unicode hex": "1F5DA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "63",
				"Dingbat hex": "3F",
				"Unicode dec": "128499",
				"Unicode hex": "1F5F3"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "64",
				"Dingbat hex": "40",
				"Unicode dec": "128736",
				"Unicode hex": "1F6E0"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "65",
				"Dingbat hex": "41",
				"Unicode dec": "127959",
				"Unicode hex": "1F3D7"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "66",
				"Dingbat hex": "42",
				"Unicode dec": "127960",
				"Unicode hex": "1F3D8"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "67",
				"Dingbat hex": "43",
				"Unicode dec": "127961",
				"Unicode hex": "1F3D9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "68",
				"Dingbat hex": "44",
				"Unicode dec": "127962",
				"Unicode hex": "1F3DA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "69",
				"Dingbat hex": "45",
				"Unicode dec": "127964",
				"Unicode hex": "1F3DC"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "70",
				"Dingbat hex": "46",
				"Unicode dec": "127981",
				"Unicode hex": "1F3ED"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "71",
				"Dingbat hex": "47",
				"Unicode dec": "127963",
				"Unicode hex": "1F3DB"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "72",
				"Dingbat hex": "48",
				"Unicode dec": "127968",
				"Unicode hex": "1F3E0"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "73",
				"Dingbat hex": "49",
				"Unicode dec": "127958",
				"Unicode hex": "1F3D6"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "74",
				"Dingbat hex": "4A",
				"Unicode dec": "127965",
				"Unicode hex": "1F3DD"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "75",
				"Dingbat hex": "4B",
				"Unicode dec": "128739",
				"Unicode hex": "1F6E3"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "76",
				"Dingbat hex": "4C",
				"Unicode dec": "128269",
				"Unicode hex": "1F50D"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "77",
				"Dingbat hex": "4D",
				"Unicode dec": "127956",
				"Unicode hex": "1F3D4"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "78",
				"Dingbat hex": "4E",
				"Unicode dec": "128065",
				"Unicode hex": "1F441"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "79",
				"Dingbat hex": "4F",
				"Unicode dec": "128066",
				"Unicode hex": "1F442"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "80",
				"Dingbat hex": "50",
				"Unicode dec": "127966",
				"Unicode hex": "1F3DE"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "81",
				"Dingbat hex": "51",
				"Unicode dec": "127957",
				"Unicode hex": "1F3D5"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "82",
				"Dingbat hex": "52",
				"Unicode dec": "128740",
				"Unicode hex": "1F6E4"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "83",
				"Dingbat hex": "53",
				"Unicode dec": "127967",
				"Unicode hex": "1F3DF"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "84",
				"Dingbat hex": "54",
				"Unicode dec": "128755",
				"Unicode hex": "1F6F3"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "85",
				"Dingbat hex": "55",
				"Unicode dec": "128364",
				"Unicode hex": "1F56C"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "86",
				"Dingbat hex": "56",
				"Unicode dec": "128363",
				"Unicode hex": "1F56B"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "87",
				"Dingbat hex": "57",
				"Unicode dec": "128360",
				"Unicode hex": "1F568"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "88",
				"Dingbat hex": "58",
				"Unicode dec": "128264",
				"Unicode hex": "1F508"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "89",
				"Dingbat hex": "59",
				"Unicode dec": "127892",
				"Unicode hex": "1F394"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "90",
				"Dingbat hex": "5A",
				"Unicode dec": "127893",
				"Unicode hex": "1F395"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "91",
				"Dingbat hex": "5B",
				"Unicode dec": "128492",
				"Unicode hex": "1F5EC"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "92",
				"Dingbat hex": "5C",
				"Unicode dec": "128637",
				"Unicode hex": "1F67D"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "93",
				"Dingbat hex": "5D",
				"Unicode dec": "128493",
				"Unicode hex": "1F5ED"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "94",
				"Dingbat hex": "5E",
				"Unicode dec": "128490",
				"Unicode hex": "1F5EA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "95",
				"Dingbat hex": "5F",
				"Unicode dec": "128491",
				"Unicode hex": "1F5EB"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "96",
				"Dingbat hex": "60",
				"Unicode dec": "11156",
				"Unicode hex": "2B94"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "97",
				"Dingbat hex": "61",
				"Unicode dec": "10004",
				"Unicode hex": "2714"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "98",
				"Dingbat hex": "62",
				"Unicode dec": "128690",
				"Unicode hex": "1F6B2"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "99",
				"Dingbat hex": "63",
				"Unicode dec": "11036",
				"Unicode hex": "2B1C"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "100",
				"Dingbat hex": "64",
				"Unicode dec": "128737",
				"Unicode hex": "1F6E1"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "101",
				"Dingbat hex": "65",
				"Unicode dec": "128230",
				"Unicode hex": "1F4E6"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "102",
				"Dingbat hex": "66",
				"Unicode dec": "128753",
				"Unicode hex": "1F6F1"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "103",
				"Dingbat hex": "67",
				"Unicode dec": "11035",
				"Unicode hex": "2B1B"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "104",
				"Dingbat hex": "68",
				"Unicode dec": "128657",
				"Unicode hex": "1F691"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "105",
				"Dingbat hex": "69",
				"Unicode dec": "128712",
				"Unicode hex": "1F6C8"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "106",
				"Dingbat hex": "6A",
				"Unicode dec": "128745",
				"Unicode hex": "1F6E9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "107",
				"Dingbat hex": "6B",
				"Unicode dec": "128752",
				"Unicode hex": "1F6F0"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "108",
				"Dingbat hex": "6C",
				"Unicode dec": "128968",
				"Unicode hex": "1F7C8"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "109",
				"Dingbat hex": "6D",
				"Unicode dec": "128372",
				"Unicode hex": "1F574"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "110",
				"Dingbat hex": "6E",
				"Unicode dec": "11044",
				"Unicode hex": "2B24"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "111",
				"Dingbat hex": "6F",
				"Unicode dec": "128741",
				"Unicode hex": "1F6E5"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "112",
				"Dingbat hex": "70",
				"Unicode dec": "128660",
				"Unicode hex": "1F694"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "113",
				"Dingbat hex": "71",
				"Unicode dec": "128472",
				"Unicode hex": "1F5D8"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "114",
				"Dingbat hex": "72",
				"Unicode dec": "128473",
				"Unicode hex": "1F5D9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "115",
				"Dingbat hex": "73",
				"Unicode dec": "10067",
				"Unicode hex": "2753"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "116",
				"Dingbat hex": "74",
				"Unicode dec": "128754",
				"Unicode hex": "1F6F2"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "117",
				"Dingbat hex": "75",
				"Unicode dec": "128647",
				"Unicode hex": "1F687"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "118",
				"Dingbat hex": "76",
				"Unicode dec": "128653",
				"Unicode hex": "1F68D"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "119",
				"Dingbat hex": "77",
				"Unicode dec": "9971",
				"Unicode hex": "26F3"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "120",
				"Dingbat hex": "78",
				"Unicode dec": "10680",
				"Unicode hex": "29B8"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "121",
				"Dingbat hex": "79",
				"Unicode dec": "8854",
				"Unicode hex": "2296"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "122",
				"Dingbat hex": "7A",
				"Unicode dec": "128685",
				"Unicode hex": "1F6AD"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "123",
				"Dingbat hex": "7B",
				"Unicode dec": "128494",
				"Unicode hex": "1F5EE"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "124",
				"Dingbat hex": "7C",
				"Unicode dec": "9168",
				"Unicode hex": "23D0"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "125",
				"Dingbat hex": "7D",
				"Unicode dec": "128495",
				"Unicode hex": "1F5EF"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "126",
				"Dingbat hex": "7E",
				"Unicode dec": "128498",
				"Unicode hex": "1F5F2"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "128",
				"Dingbat hex": "80",
				"Unicode dec": "128697",
				"Unicode hex": "1F6B9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "129",
				"Dingbat hex": "81",
				"Unicode dec": "128698",
				"Unicode hex": "1F6BA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "130",
				"Dingbat hex": "82",
				"Unicode dec": "128713",
				"Unicode hex": "1F6C9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "131",
				"Dingbat hex": "83",
				"Unicode dec": "128714",
				"Unicode hex": "1F6CA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "132",
				"Dingbat hex": "84",
				"Unicode dec": "128700",
				"Unicode hex": "1F6BC"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "133",
				"Dingbat hex": "85",
				"Unicode dec": "128125",
				"Unicode hex": "1F47D"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "134",
				"Dingbat hex": "86",
				"Unicode dec": "127947",
				"Unicode hex": "1F3CB"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "135",
				"Dingbat hex": "87",
				"Unicode dec": "9975",
				"Unicode hex": "26F7"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "136",
				"Dingbat hex": "88",
				"Unicode dec": "127938",
				"Unicode hex": "1F3C2"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "137",
				"Dingbat hex": "89",
				"Unicode dec": "127948",
				"Unicode hex": "1F3CC"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "138",
				"Dingbat hex": "8A",
				"Unicode dec": "127946",
				"Unicode hex": "1F3CA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "139",
				"Dingbat hex": "8B",
				"Unicode dec": "127940",
				"Unicode hex": "1F3C4"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "140",
				"Dingbat hex": "8C",
				"Unicode dec": "127949",
				"Unicode hex": "1F3CD"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "141",
				"Dingbat hex": "8D",
				"Unicode dec": "127950",
				"Unicode hex": "1F3CE"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "142",
				"Dingbat hex": "8E",
				"Unicode dec": "128664",
				"Unicode hex": "1F698"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "143",
				"Dingbat hex": "8F",
				"Unicode dec": "128480",
				"Unicode hex": "1F5E0"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "144",
				"Dingbat hex": "90",
				"Unicode dec": "128738",
				"Unicode hex": "1F6E2"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "145",
				"Dingbat hex": "91",
				"Unicode dec": "128176",
				"Unicode hex": "1F4B0"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "146",
				"Dingbat hex": "92",
				"Unicode dec": "127991",
				"Unicode hex": "1F3F7"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "147",
				"Dingbat hex": "93",
				"Unicode dec": "128179",
				"Unicode hex": "1F4B3"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "148",
				"Dingbat hex": "94",
				"Unicode dec": "128106",
				"Unicode hex": "1F46A"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "149",
				"Dingbat hex": "95",
				"Unicode dec": "128481",
				"Unicode hex": "1F5E1"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "150",
				"Dingbat hex": "96",
				"Unicode dec": "128482",
				"Unicode hex": "1F5E2"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "151",
				"Dingbat hex": "97",
				"Unicode dec": "128483",
				"Unicode hex": "1F5E3"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "152",
				"Dingbat hex": "98",
				"Unicode dec": "10031",
				"Unicode hex": "272F"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "153",
				"Dingbat hex": "99",
				"Unicode dec": "128388",
				"Unicode hex": "1F584"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "154",
				"Dingbat hex": "9A",
				"Unicode dec": "128389",
				"Unicode hex": "1F585"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "155",
				"Dingbat hex": "9B",
				"Unicode dec": "128387",
				"Unicode hex": "1F583"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "156",
				"Dingbat hex": "9C",
				"Unicode dec": "128390",
				"Unicode hex": "1F586"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "157",
				"Dingbat hex": "9D",
				"Unicode dec": "128441",
				"Unicode hex": "1F5B9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "158",
				"Dingbat hex": "9E",
				"Unicode dec": "128442",
				"Unicode hex": "1F5BA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "159",
				"Dingbat hex": "9F",
				"Unicode dec": "128443",
				"Unicode hex": "1F5BB"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "160",
				"Dingbat hex": "A0",
				"Unicode dec": "128373",
				"Unicode hex": "1F575"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "161",
				"Dingbat hex": "A1",
				"Unicode dec": "128368",
				"Unicode hex": "1F570"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "162",
				"Dingbat hex": "A2",
				"Unicode dec": "128445",
				"Unicode hex": "1F5BD"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "163",
				"Dingbat hex": "A3",
				"Unicode dec": "128446",
				"Unicode hex": "1F5BE"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "164",
				"Dingbat hex": "A4",
				"Unicode dec": "128203",
				"Unicode hex": "1F4CB"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "165",
				"Dingbat hex": "A5",
				"Unicode dec": "128466",
				"Unicode hex": "1F5D2"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "166",
				"Dingbat hex": "A6",
				"Unicode dec": "128467",
				"Unicode hex": "1F5D3"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "167",
				"Dingbat hex": "A7",
				"Unicode dec": "128366",
				"Unicode hex": "1F56E"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "168",
				"Dingbat hex": "A8",
				"Unicode dec": "128218",
				"Unicode hex": "1F4DA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "169",
				"Dingbat hex": "A9",
				"Unicode dec": "128478",
				"Unicode hex": "1F5DE"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "170",
				"Dingbat hex": "AA",
				"Unicode dec": "128479",
				"Unicode hex": "1F5DF"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "171",
				"Dingbat hex": "AB",
				"Unicode dec": "128451",
				"Unicode hex": "1F5C3"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "172",
				"Dingbat hex": "AC",
				"Unicode dec": "128450",
				"Unicode hex": "1F5C2"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "173",
				"Dingbat hex": "AD",
				"Unicode dec": "128444",
				"Unicode hex": "1F5BC"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "174",
				"Dingbat hex": "AE",
				"Unicode dec": "127917",
				"Unicode hex": "1F3AD"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "175",
				"Dingbat hex": "AF",
				"Unicode dec": "127900",
				"Unicode hex": "1F39C"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "176",
				"Dingbat hex": "B0",
				"Unicode dec": "127896",
				"Unicode hex": "1F398"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "177",
				"Dingbat hex": "B1",
				"Unicode dec": "127897",
				"Unicode hex": "1F399"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "178",
				"Dingbat hex": "B2",
				"Unicode dec": "127911",
				"Unicode hex": "1F3A7"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "179",
				"Dingbat hex": "B3",
				"Unicode dec": "128191",
				"Unicode hex": "1F4BF"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "180",
				"Dingbat hex": "B4",
				"Unicode dec": "127902",
				"Unicode hex": "1F39E"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "181",
				"Dingbat hex": "B5",
				"Unicode dec": "128247",
				"Unicode hex": "1F4F7"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "182",
				"Dingbat hex": "B6",
				"Unicode dec": "127903",
				"Unicode hex": "1F39F"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "183",
				"Dingbat hex": "B7",
				"Unicode dec": "127916",
				"Unicode hex": "1F3AC"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "184",
				"Dingbat hex": "B8",
				"Unicode dec": "128253",
				"Unicode hex": "1F4FD"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "185",
				"Dingbat hex": "B9",
				"Unicode dec": "128249",
				"Unicode hex": "1F4F9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "186",
				"Dingbat hex": "BA",
				"Unicode dec": "128254",
				"Unicode hex": "1F4FE"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "187",
				"Dingbat hex": "BB",
				"Unicode dec": "128251",
				"Unicode hex": "1F4FB"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "188",
				"Dingbat hex": "BC",
				"Unicode dec": "127898",
				"Unicode hex": "1F39A"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "189",
				"Dingbat hex": "BD",
				"Unicode dec": "127899",
				"Unicode hex": "1F39B"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "190",
				"Dingbat hex": "BE",
				"Unicode dec": "128250",
				"Unicode hex": "1F4FA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "191",
				"Dingbat hex": "BF",
				"Unicode dec": "128187",
				"Unicode hex": "1F4BB"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "192",
				"Dingbat hex": "C0",
				"Unicode dec": "128421",
				"Unicode hex": "1F5A5"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "193",
				"Dingbat hex": "C1",
				"Unicode dec": "128422",
				"Unicode hex": "1F5A6"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "194",
				"Dingbat hex": "C2",
				"Unicode dec": "128423",
				"Unicode hex": "1F5A7"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "195",
				"Dingbat hex": "C3",
				"Unicode dec": "128377",
				"Unicode hex": "1F579"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "196",
				"Dingbat hex": "C4",
				"Unicode dec": "127918",
				"Unicode hex": "1F3AE"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "197",
				"Dingbat hex": "C5",
				"Unicode dec": "128379",
				"Unicode hex": "1F57B"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "198",
				"Dingbat hex": "C6",
				"Unicode dec": "128380",
				"Unicode hex": "1F57C"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "199",
				"Dingbat hex": "C7",
				"Unicode dec": "128223",
				"Unicode hex": "1F4DF"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "200",
				"Dingbat hex": "C8",
				"Unicode dec": "128385",
				"Unicode hex": "1F581"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "201",
				"Dingbat hex": "C9",
				"Unicode dec": "128384",
				"Unicode hex": "1F580"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "202",
				"Dingbat hex": "CA",
				"Unicode dec": "128424",
				"Unicode hex": "1F5A8"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "203",
				"Dingbat hex": "CB",
				"Unicode dec": "128425",
				"Unicode hex": "1F5A9"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "204",
				"Dingbat hex": "CC",
				"Unicode dec": "128447",
				"Unicode hex": "1F5BF"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "205",
				"Dingbat hex": "CD",
				"Unicode dec": "128426",
				"Unicode hex": "1F5AA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "206",
				"Dingbat hex": "CE",
				"Unicode dec": "128476",
				"Unicode hex": "1F5DC"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "207",
				"Dingbat hex": "CF",
				"Unicode dec": "128274",
				"Unicode hex": "1F512"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "208",
				"Dingbat hex": "D0",
				"Unicode dec": "128275",
				"Unicode hex": "1F513"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "209",
				"Dingbat hex": "D1",
				"Unicode dec": "128477",
				"Unicode hex": "1F5DD"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "210",
				"Dingbat hex": "D2",
				"Unicode dec": "128229",
				"Unicode hex": "1F4E5"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "211",
				"Dingbat hex": "D3",
				"Unicode dec": "128228",
				"Unicode hex": "1F4E4"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "212",
				"Dingbat hex": "D4",
				"Unicode dec": "128371",
				"Unicode hex": "1F573"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "213",
				"Dingbat hex": "D5",
				"Unicode dec": "127779",
				"Unicode hex": "1F323"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "214",
				"Dingbat hex": "D6",
				"Unicode dec": "127780",
				"Unicode hex": "1F324"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "215",
				"Dingbat hex": "D7",
				"Unicode dec": "127781",
				"Unicode hex": "1F325"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "216",
				"Dingbat hex": "D8",
				"Unicode dec": "127782",
				"Unicode hex": "1F326"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "217",
				"Dingbat hex": "D9",
				"Unicode dec": "9729",
				"Unicode hex": "2601"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "218",
				"Dingbat hex": "DA",
				"Unicode dec": "127784",
				"Unicode hex": "1F328"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "219",
				"Dingbat hex": "DB",
				"Unicode dec": "127783",
				"Unicode hex": "1F327"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "220",
				"Dingbat hex": "DC",
				"Unicode dec": "127785",
				"Unicode hex": "1F329"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "221",
				"Dingbat hex": "DD",
				"Unicode dec": "127786",
				"Unicode hex": "1F32A"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "222",
				"Dingbat hex": "DE",
				"Unicode dec": "127788",
				"Unicode hex": "1F32C"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "223",
				"Dingbat hex": "DF",
				"Unicode dec": "127787",
				"Unicode hex": "1F32B"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "224",
				"Dingbat hex": "E0",
				"Unicode dec": "127772",
				"Unicode hex": "1F31C"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "225",
				"Dingbat hex": "E1",
				"Unicode dec": "127777",
				"Unicode hex": "1F321"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "226",
				"Dingbat hex": "E2",
				"Unicode dec": "128715",
				"Unicode hex": "1F6CB"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "227",
				"Dingbat hex": "E3",
				"Unicode dec": "128719",
				"Unicode hex": "1F6CF"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "228",
				"Dingbat hex": "E4",
				"Unicode dec": "127869",
				"Unicode hex": "1F37D"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "229",
				"Dingbat hex": "E5",
				"Unicode dec": "127864",
				"Unicode hex": "1F378"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "230",
				"Dingbat hex": "E6",
				"Unicode dec": "128718",
				"Unicode hex": "1F6CE"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "231",
				"Dingbat hex": "E7",
				"Unicode dec": "128717",
				"Unicode hex": "1F6CD"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "232",
				"Dingbat hex": "E8",
				"Unicode dec": "9413",
				"Unicode hex": "24C5"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "233",
				"Dingbat hex": "E9",
				"Unicode dec": "9855",
				"Unicode hex": "267F"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "234",
				"Dingbat hex": "EA",
				"Unicode dec": "128710",
				"Unicode hex": "1F6C6"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "235",
				"Dingbat hex": "EB",
				"Unicode dec": "128392",
				"Unicode hex": "1F588"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "236",
				"Dingbat hex": "EC",
				"Unicode dec": "127891",
				"Unicode hex": "1F393"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "237",
				"Dingbat hex": "ED",
				"Unicode dec": "128484",
				"Unicode hex": "1F5E4"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "238",
				"Dingbat hex": "EE",
				"Unicode dec": "128485",
				"Unicode hex": "1F5E5"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "239",
				"Dingbat hex": "EF",
				"Unicode dec": "128486",
				"Unicode hex": "1F5E6"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "240",
				"Dingbat hex": "F0",
				"Unicode dec": "128487",
				"Unicode hex": "1F5E7"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "241",
				"Dingbat hex": "F1",
				"Unicode dec": "128746",
				"Unicode hex": "1F6EA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "242",
				"Dingbat hex": "F2",
				"Unicode dec": "128063",
				"Unicode hex": "1F43F"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "243",
				"Dingbat hex": "F3",
				"Unicode dec": "128038",
				"Unicode hex": "1F426"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "244",
				"Dingbat hex": "F4",
				"Unicode dec": "128031",
				"Unicode hex": "1F41F"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "245",
				"Dingbat hex": "F5",
				"Unicode dec": "128021",
				"Unicode hex": "1F415"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "246",
				"Dingbat hex": "F6",
				"Unicode dec": "128008",
				"Unicode hex": "1F408"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "247",
				"Dingbat hex": "F7",
				"Unicode dec": "128620",
				"Unicode hex": "1F66C"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "248",
				"Dingbat hex": "F8",
				"Unicode dec": "128622",
				"Unicode hex": "1F66E"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "249",
				"Dingbat hex": "F9",
				"Unicode dec": "128621",
				"Unicode hex": "1F66D"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "250",
				"Dingbat hex": "FA",
				"Unicode dec": "128623",
				"Unicode hex": "1F66F"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "251",
				"Dingbat hex": "FB",
				"Unicode dec": "128506",
				"Unicode hex": "1F5FA"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "252",
				"Dingbat hex": "FC",
				"Unicode dec": "127757",
				"Unicode hex": "1F30D"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "253",
				"Dingbat hex": "FD",
				"Unicode dec": "127759",
				"Unicode hex": "1F30F"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "254",
				"Dingbat hex": "FE",
				"Unicode dec": "127758",
				"Unicode hex": "1F30E"
			},
			{
				"Typeface name": "Webdings",
				"Dingbat dec": "255",
				"Dingbat hex": "FF",
				"Unicode dec": "128330",
				"Unicode hex": "1F54A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "32",
				"Dingbat hex": "20",
				"Unicode dec": "32",
				"Unicode hex": "20"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "33",
				"Dingbat hex": "21",
				"Unicode dec": "128393",
				"Unicode hex": "1F589"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "34",
				"Dingbat hex": "22",
				"Unicode dec": "9986",
				"Unicode hex": "2702"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "35",
				"Dingbat hex": "23",
				"Unicode dec": "9985",
				"Unicode hex": "2701"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "36",
				"Dingbat hex": "24",
				"Unicode dec": "128083",
				"Unicode hex": "1F453"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "37",
				"Dingbat hex": "25",
				"Unicode dec": "128365",
				"Unicode hex": "1F56D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "38",
				"Dingbat hex": "26",
				"Unicode dec": "128366",
				"Unicode hex": "1F56E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "39",
				"Dingbat hex": "27",
				"Unicode dec": "128367",
				"Unicode hex": "1F56F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "40",
				"Dingbat hex": "28",
				"Unicode dec": "128383",
				"Unicode hex": "1F57F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "41",
				"Dingbat hex": "29",
				"Unicode dec": "9990",
				"Unicode hex": "2706"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "42",
				"Dingbat hex": "2A",
				"Unicode dec": "128386",
				"Unicode hex": "1F582"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "43",
				"Dingbat hex": "2B",
				"Unicode dec": "128387",
				"Unicode hex": "1F583"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "44",
				"Dingbat hex": "2C",
				"Unicode dec": "128234",
				"Unicode hex": "1F4EA"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "45",
				"Dingbat hex": "2D",
				"Unicode dec": "128235",
				"Unicode hex": "1F4EB"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "46",
				"Dingbat hex": "2E",
				"Unicode dec": "128236",
				"Unicode hex": "1F4EC"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "47",
				"Dingbat hex": "2F",
				"Unicode dec": "128237",
				"Unicode hex": "1F4ED"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "48",
				"Dingbat hex": "30",
				"Unicode dec": "128448",
				"Unicode hex": "1F5C0"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "49",
				"Dingbat hex": "31",
				"Unicode dec": "128449",
				"Unicode hex": "1F5C1"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "50",
				"Dingbat hex": "32",
				"Unicode dec": "128462",
				"Unicode hex": "1F5CE"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "51",
				"Dingbat hex": "33",
				"Unicode dec": "128463",
				"Unicode hex": "1F5CF"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "52",
				"Dingbat hex": "34",
				"Unicode dec": "128464",
				"Unicode hex": "1F5D0"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "53",
				"Dingbat hex": "35",
				"Unicode dec": "128452",
				"Unicode hex": "1F5C4"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "54",
				"Dingbat hex": "36",
				"Unicode dec": "8987",
				"Unicode hex": "231B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "55",
				"Dingbat hex": "37",
				"Unicode dec": "128430",
				"Unicode hex": "1F5AE"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "56",
				"Dingbat hex": "38",
				"Unicode dec": "128432",
				"Unicode hex": "1F5B0"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "57",
				"Dingbat hex": "39",
				"Unicode dec": "128434",
				"Unicode hex": "1F5B2"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "58",
				"Dingbat hex": "3A",
				"Unicode dec": "128435",
				"Unicode hex": "1F5B3"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "59",
				"Dingbat hex": "3B",
				"Unicode dec": "128436",
				"Unicode hex": "1F5B4"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "60",
				"Dingbat hex": "3C",
				"Unicode dec": "128427",
				"Unicode hex": "1F5AB"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "61",
				"Dingbat hex": "3D",
				"Unicode dec": "128428",
				"Unicode hex": "1F5AC"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "62",
				"Dingbat hex": "3E",
				"Unicode dec": "9991",
				"Unicode hex": "2707"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "63",
				"Dingbat hex": "3F",
				"Unicode dec": "9997",
				"Unicode hex": "270D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "64",
				"Dingbat hex": "40",
				"Unicode dec": "128398",
				"Unicode hex": "1F58E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "65",
				"Dingbat hex": "41",
				"Unicode dec": "9996",
				"Unicode hex": "270C"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "66",
				"Dingbat hex": "42",
				"Unicode dec": "128399",
				"Unicode hex": "1F58F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "67",
				"Dingbat hex": "43",
				"Unicode dec": "128077",
				"Unicode hex": "1F44D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "68",
				"Dingbat hex": "44",
				"Unicode dec": "128078",
				"Unicode hex": "1F44E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "69",
				"Dingbat hex": "45",
				"Unicode dec": "9756",
				"Unicode hex": "261C"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "70",
				"Dingbat hex": "46",
				"Unicode dec": "9758",
				"Unicode hex": "261E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "71",
				"Dingbat hex": "47",
				"Unicode dec": "9757",
				"Unicode hex": "261D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "72",
				"Dingbat hex": "48",
				"Unicode dec": "9759",
				"Unicode hex": "261F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "73",
				"Dingbat hex": "49",
				"Unicode dec": "128400",
				"Unicode hex": "1F590"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "74",
				"Dingbat hex": "4A",
				"Unicode dec": "9786",
				"Unicode hex": "263A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "75",
				"Dingbat hex": "4B",
				"Unicode dec": "128528",
				"Unicode hex": "1F610"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "76",
				"Dingbat hex": "4C",
				"Unicode dec": "9785",
				"Unicode hex": "2639"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "77",
				"Dingbat hex": "4D",
				"Unicode dec": "128163",
				"Unicode hex": "1F4A3"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "78",
				"Dingbat hex": "4E",
				"Unicode dec": "128369",
				"Unicode hex": "1F571"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "79",
				"Dingbat hex": "4F",
				"Unicode dec": "127987",
				"Unicode hex": "1F3F3"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "80",
				"Dingbat hex": "50",
				"Unicode dec": "127985",
				"Unicode hex": "1F3F1"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "81",
				"Dingbat hex": "51",
				"Unicode dec": "9992",
				"Unicode hex": "2708"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "82",
				"Dingbat hex": "52",
				"Unicode dec": "9788",
				"Unicode hex": "263C"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "83",
				"Dingbat hex": "53",
				"Unicode dec": "127778",
				"Unicode hex": "1F322"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "84",
				"Dingbat hex": "54",
				"Unicode dec": "10052",
				"Unicode hex": "2744"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "85",
				"Dingbat hex": "55",
				"Unicode dec": "128326",
				"Unicode hex": "1F546"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "86",
				"Dingbat hex": "56",
				"Unicode dec": "10014",
				"Unicode hex": "271E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "87",
				"Dingbat hex": "57",
				"Unicode dec": "128328",
				"Unicode hex": "1F548"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "88",
				"Dingbat hex": "58",
				"Unicode dec": "10016",
				"Unicode hex": "2720"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "89",
				"Dingbat hex": "59",
				"Unicode dec": "10017",
				"Unicode hex": "2721"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "90",
				"Dingbat hex": "5A",
				"Unicode dec": "9770",
				"Unicode hex": "262A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "91",
				"Dingbat hex": "5B",
				"Unicode dec": "9775",
				"Unicode hex": "262F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "92",
				"Dingbat hex": "5C",
				"Unicode dec": "128329",
				"Unicode hex": "1F549"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "93",
				"Dingbat hex": "5D",
				"Unicode dec": "9784",
				"Unicode hex": "2638"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "94",
				"Dingbat hex": "5E",
				"Unicode dec": "9800",
				"Unicode hex": "2648"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "95",
				"Dingbat hex": "5F",
				"Unicode dec": "9801",
				"Unicode hex": "2649"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "96",
				"Dingbat hex": "60",
				"Unicode dec": "9802",
				"Unicode hex": "264A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "97",
				"Dingbat hex": "61",
				"Unicode dec": "9803",
				"Unicode hex": "264B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "98",
				"Dingbat hex": "62",
				"Unicode dec": "9804",
				"Unicode hex": "264C"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "99",
				"Dingbat hex": "63",
				"Unicode dec": "9805",
				"Unicode hex": "264D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "100",
				"Dingbat hex": "64",
				"Unicode dec": "9806",
				"Unicode hex": "264E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "101",
				"Dingbat hex": "65",
				"Unicode dec": "9807",
				"Unicode hex": "264F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "102",
				"Dingbat hex": "66",
				"Unicode dec": "9808",
				"Unicode hex": "2650"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "103",
				"Dingbat hex": "67",
				"Unicode dec": "9809",
				"Unicode hex": "2651"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "104",
				"Dingbat hex": "68",
				"Unicode dec": "9810",
				"Unicode hex": "2652"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "105",
				"Dingbat hex": "69",
				"Unicode dec": "9811",
				"Unicode hex": "2653"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "106",
				"Dingbat hex": "6A",
				"Unicode dec": "128624",
				"Unicode hex": "1F670"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "107",
				"Dingbat hex": "6B",
				"Unicode dec": "128629",
				"Unicode hex": "1F675"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "108",
				"Dingbat hex": "6C",
				"Unicode dec": "9899",
				"Unicode hex": "26AB"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "109",
				"Dingbat hex": "6D",
				"Unicode dec": "128318",
				"Unicode hex": "1F53E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "110",
				"Dingbat hex": "6E",
				"Unicode dec": "9724",
				"Unicode hex": "25FC"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "111",
				"Dingbat hex": "6F",
				"Unicode dec": "128911",
				"Unicode hex": "1F78F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "112",
				"Dingbat hex": "70",
				"Unicode dec": "128912",
				"Unicode hex": "1F790"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "113",
				"Dingbat hex": "71",
				"Unicode dec": "10065",
				"Unicode hex": "2751"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "114",
				"Dingbat hex": "72",
				"Unicode dec": "10066",
				"Unicode hex": "2752"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "115",
				"Dingbat hex": "73",
				"Unicode dec": "128927",
				"Unicode hex": "1F79F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "116",
				"Dingbat hex": "74",
				"Unicode dec": "10731",
				"Unicode hex": "29EB"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "117",
				"Dingbat hex": "75",
				"Unicode dec": "9670",
				"Unicode hex": "25C6"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "118",
				"Dingbat hex": "76",
				"Unicode dec": "10070",
				"Unicode hex": "2756"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "119",
				"Dingbat hex": "77",
				"Unicode dec": "11049",
				"Unicode hex": "2B29"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "120",
				"Dingbat hex": "78",
				"Unicode dec": "8999",
				"Unicode hex": "2327"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "121",
				"Dingbat hex": "79",
				"Unicode dec": "11193",
				"Unicode hex": "2BB9"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "122",
				"Dingbat hex": "7A",
				"Unicode dec": "8984",
				"Unicode hex": "2318"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "123",
				"Dingbat hex": "7B",
				"Unicode dec": "127989",
				"Unicode hex": "1F3F5"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "124",
				"Dingbat hex": "7C",
				"Unicode dec": "127990",
				"Unicode hex": "1F3F6"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "125",
				"Dingbat hex": "7D",
				"Unicode dec": "128630",
				"Unicode hex": "1F676"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "126",
				"Dingbat hex": "7E",
				"Unicode dec": "128631",
				"Unicode hex": "1F677"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "127",
				"Dingbat hex": "7F",
				"Unicode dec": "9647",
				"Unicode hex": "25AF"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "128",
				"Dingbat hex": "80",
				"Unicode dec": "127243",
				"Unicode hex": "1F10B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "129",
				"Dingbat hex": "81",
				"Unicode dec": "10112",
				"Unicode hex": "2780"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "130",
				"Dingbat hex": "82",
				"Unicode dec": "10113",
				"Unicode hex": "2781"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "131",
				"Dingbat hex": "83",
				"Unicode dec": "10114",
				"Unicode hex": "2782"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "132",
				"Dingbat hex": "84",
				"Unicode dec": "10115",
				"Unicode hex": "2783"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "133",
				"Dingbat hex": "85",
				"Unicode dec": "10116",
				"Unicode hex": "2784"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "134",
				"Dingbat hex": "86",
				"Unicode dec": "10117",
				"Unicode hex": "2785"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "135",
				"Dingbat hex": "87",
				"Unicode dec": "10118",
				"Unicode hex": "2786"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "136",
				"Dingbat hex": "88",
				"Unicode dec": "10119",
				"Unicode hex": "2787"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "137",
				"Dingbat hex": "89",
				"Unicode dec": "10120",
				"Unicode hex": "2788"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "138",
				"Dingbat hex": "8A",
				"Unicode dec": "10121",
				"Unicode hex": "2789"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "139",
				"Dingbat hex": "8B",
				"Unicode dec": "127244",
				"Unicode hex": "1F10C"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "140",
				"Dingbat hex": "8C",
				"Unicode dec": "10122",
				"Unicode hex": "278A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "141",
				"Dingbat hex": "8D",
				"Unicode dec": "10123",
				"Unicode hex": "278B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "142",
				"Dingbat hex": "8E",
				"Unicode dec": "10124",
				"Unicode hex": "278C"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "143",
				"Dingbat hex": "8F",
				"Unicode dec": "10125",
				"Unicode hex": "278D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "144",
				"Dingbat hex": "90",
				"Unicode dec": "10126",
				"Unicode hex": "278E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "145",
				"Dingbat hex": "91",
				"Unicode dec": "10127",
				"Unicode hex": "278F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "146",
				"Dingbat hex": "92",
				"Unicode dec": "10128",
				"Unicode hex": "2790"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "147",
				"Dingbat hex": "93",
				"Unicode dec": "10129",
				"Unicode hex": "2791"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "148",
				"Dingbat hex": "94",
				"Unicode dec": "10130",
				"Unicode hex": "2792"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "149",
				"Dingbat hex": "95",
				"Unicode dec": "10131",
				"Unicode hex": "2793"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "150",
				"Dingbat hex": "96",
				"Unicode dec": "128610",
				"Unicode hex": "1F662"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "151",
				"Dingbat hex": "97",
				"Unicode dec": "128608",
				"Unicode hex": "1F660"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "152",
				"Dingbat hex": "98",
				"Unicode dec": "128609",
				"Unicode hex": "1F661"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "153",
				"Dingbat hex": "99",
				"Unicode dec": "128611",
				"Unicode hex": "1F663"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "154",
				"Dingbat hex": "9A",
				"Unicode dec": "128606",
				"Unicode hex": "1F65E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "155",
				"Dingbat hex": "9B",
				"Unicode dec": "128604",
				"Unicode hex": "1F65C"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "156",
				"Dingbat hex": "9C",
				"Unicode dec": "128605",
				"Unicode hex": "1F65D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "157",
				"Dingbat hex": "9D",
				"Unicode dec": "128607",
				"Unicode hex": "1F65F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "158",
				"Dingbat hex": "9E",
				"Unicode dec": "8729",
				"Unicode hex": "2219"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "159",
				"Dingbat hex": "9F",
				"Unicode dec": "8226",
				"Unicode hex": "2022"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "160",
				"Dingbat hex": "A0",
				"Unicode dec": "11037",
				"Unicode hex": "2B1D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "161",
				"Dingbat hex": "A1",
				"Unicode dec": "11096",
				"Unicode hex": "2B58"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "162",
				"Dingbat hex": "A2",
				"Unicode dec": "128902",
				"Unicode hex": "1F786"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "163",
				"Dingbat hex": "A3",
				"Unicode dec": "128904",
				"Unicode hex": "1F788"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "164",
				"Dingbat hex": "A4",
				"Unicode dec": "128906",
				"Unicode hex": "1F78A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "165",
				"Dingbat hex": "A5",
				"Unicode dec": "128907",
				"Unicode hex": "1F78B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "166",
				"Dingbat hex": "A6",
				"Unicode dec": "128319",
				"Unicode hex": "1F53F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "167",
				"Dingbat hex": "A7",
				"Unicode dec": "9642",
				"Unicode hex": "25AA"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "168",
				"Dingbat hex": "A8",
				"Unicode dec": "128910",
				"Unicode hex": "1F78E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "169",
				"Dingbat hex": "A9",
				"Unicode dec": "128961",
				"Unicode hex": "1F7C1"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "170",
				"Dingbat hex": "AA",
				"Unicode dec": "128965",
				"Unicode hex": "1F7C5"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "171",
				"Dingbat hex": "AB",
				"Unicode dec": "9733",
				"Unicode hex": "2605"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "172",
				"Dingbat hex": "AC",
				"Unicode dec": "128971",
				"Unicode hex": "1F7CB"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "173",
				"Dingbat hex": "AD",
				"Unicode dec": "128975",
				"Unicode hex": "1F7CF"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "174",
				"Dingbat hex": "AE",
				"Unicode dec": "128979",
				"Unicode hex": "1F7D3"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "175",
				"Dingbat hex": "AF",
				"Unicode dec": "128977",
				"Unicode hex": "1F7D1"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "176",
				"Dingbat hex": "B0",
				"Unicode dec": "11216",
				"Unicode hex": "2BD0"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "177",
				"Dingbat hex": "B1",
				"Unicode dec": "8982",
				"Unicode hex": "2316"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "178",
				"Dingbat hex": "B2",
				"Unicode dec": "11214",
				"Unicode hex": "2BCE"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "179",
				"Dingbat hex": "B3",
				"Unicode dec": "11215",
				"Unicode hex": "2BCF"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "180",
				"Dingbat hex": "B4",
				"Unicode dec": "11217",
				"Unicode hex": "2BD1"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "181",
				"Dingbat hex": "B5",
				"Unicode dec": "10026",
				"Unicode hex": "272A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "182",
				"Dingbat hex": "B6",
				"Unicode dec": "10032",
				"Unicode hex": "2730"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "183",
				"Dingbat hex": "B7",
				"Unicode dec": "128336",
				"Unicode hex": "1F550"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "184",
				"Dingbat hex": "B8",
				"Unicode dec": "128337",
				"Unicode hex": "1F551"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "185",
				"Dingbat hex": "B9",
				"Unicode dec": "128338",
				"Unicode hex": "1F552"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "186",
				"Dingbat hex": "BA",
				"Unicode dec": "128339",
				"Unicode hex": "1F553"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "187",
				"Dingbat hex": "BB",
				"Unicode dec": "128340",
				"Unicode hex": "1F554"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "188",
				"Dingbat hex": "BC",
				"Unicode dec": "128341",
				"Unicode hex": "1F555"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "189",
				"Dingbat hex": "BD",
				"Unicode dec": "128342",
				"Unicode hex": "1F556"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "190",
				"Dingbat hex": "BE",
				"Unicode dec": "128343",
				"Unicode hex": "1F557"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "191",
				"Dingbat hex": "BF",
				"Unicode dec": "128344",
				"Unicode hex": "1F558"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "192",
				"Dingbat hex": "C0",
				"Unicode dec": "128345",
				"Unicode hex": "1F559"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "193",
				"Dingbat hex": "C1",
				"Unicode dec": "128346",
				"Unicode hex": "1F55A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "194",
				"Dingbat hex": "C2",
				"Unicode dec": "128347",
				"Unicode hex": "1F55B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "195",
				"Dingbat hex": "C3",
				"Unicode dec": "11184",
				"Unicode hex": "2BB0"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "196",
				"Dingbat hex": "C4",
				"Unicode dec": "11185",
				"Unicode hex": "2BB1"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "197",
				"Dingbat hex": "C5",
				"Unicode dec": "11186",
				"Unicode hex": "2BB2"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "198",
				"Dingbat hex": "C6",
				"Unicode dec": "11187",
				"Unicode hex": "2BB3"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "199",
				"Dingbat hex": "C7",
				"Unicode dec": "11188",
				"Unicode hex": "2BB4"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "200",
				"Dingbat hex": "C8",
				"Unicode dec": "11189",
				"Unicode hex": "2BB5"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "201",
				"Dingbat hex": "C9",
				"Unicode dec": "11190",
				"Unicode hex": "2BB6"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "202",
				"Dingbat hex": "CA",
				"Unicode dec": "11191",
				"Unicode hex": "2BB7"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "203",
				"Dingbat hex": "CB",
				"Unicode dec": "128618",
				"Unicode hex": "1F66A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "204",
				"Dingbat hex": "CC",
				"Unicode dec": "128619",
				"Unicode hex": "1F66B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "205",
				"Dingbat hex": "CD",
				"Unicode dec": "128597",
				"Unicode hex": "1F655"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "206",
				"Dingbat hex": "CE",
				"Unicode dec": "128596",
				"Unicode hex": "1F654"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "207",
				"Dingbat hex": "CF",
				"Unicode dec": "128599",
				"Unicode hex": "1F657"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "208",
				"Dingbat hex": "D0",
				"Unicode dec": "128598",
				"Unicode hex": "1F656"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "209",
				"Dingbat hex": "D1",
				"Unicode dec": "128592",
				"Unicode hex": "1F650"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "210",
				"Dingbat hex": "D2",
				"Unicode dec": "128593",
				"Unicode hex": "1F651"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "211",
				"Dingbat hex": "D3",
				"Unicode dec": "128594",
				"Unicode hex": "1F652"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "212",
				"Dingbat hex": "D4",
				"Unicode dec": "128595",
				"Unicode hex": "1F653"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "213",
				"Dingbat hex": "D5",
				"Unicode dec": "9003",
				"Unicode hex": "232B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "214",
				"Dingbat hex": "D6",
				"Unicode dec": "8998",
				"Unicode hex": "2326"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "215",
				"Dingbat hex": "D7",
				"Unicode dec": "11160",
				"Unicode hex": "2B98"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "216",
				"Dingbat hex": "D8",
				"Unicode dec": "11162",
				"Unicode hex": "2B9A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "217",
				"Dingbat hex": "D9",
				"Unicode dec": "11161",
				"Unicode hex": "2B99"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "218",
				"Dingbat hex": "DA",
				"Unicode dec": "11163",
				"Unicode hex": "2B9B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "219",
				"Dingbat hex": "DB",
				"Unicode dec": "11144",
				"Unicode hex": "2B88"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "220",
				"Dingbat hex": "DC",
				"Unicode dec": "11146",
				"Unicode hex": "2B8A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "221",
				"Dingbat hex": "DD",
				"Unicode dec": "11145",
				"Unicode hex": "2B89"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "222",
				"Dingbat hex": "DE",
				"Unicode dec": "11147",
				"Unicode hex": "2B8B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "223",
				"Dingbat hex": "DF",
				"Unicode dec": "129128",
				"Unicode hex": "1F868"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "224",
				"Dingbat hex": "E0",
				"Unicode dec": "129130",
				"Unicode hex": "1F86A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "225",
				"Dingbat hex": "E1",
				"Unicode dec": "129129",
				"Unicode hex": "1F869"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "226",
				"Dingbat hex": "E2",
				"Unicode dec": "129131",
				"Unicode hex": "1F86B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "227",
				"Dingbat hex": "E3",
				"Unicode dec": "129132",
				"Unicode hex": "1F86C"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "228",
				"Dingbat hex": "E4",
				"Unicode dec": "129133",
				"Unicode hex": "1F86D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "229",
				"Dingbat hex": "E5",
				"Unicode dec": "129135",
				"Unicode hex": "1F86F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "230",
				"Dingbat hex": "E6",
				"Unicode dec": "129134",
				"Unicode hex": "1F86E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "231",
				"Dingbat hex": "E7",
				"Unicode dec": "129144",
				"Unicode hex": "1F878"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "232",
				"Dingbat hex": "E8",
				"Unicode dec": "129146",
				"Unicode hex": "1F87A"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "233",
				"Dingbat hex": "E9",
				"Unicode dec": "129145",
				"Unicode hex": "1F879"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "234",
				"Dingbat hex": "EA",
				"Unicode dec": "129147",
				"Unicode hex": "1F87B"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "235",
				"Dingbat hex": "EB",
				"Unicode dec": "129148",
				"Unicode hex": "1F87C"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "236",
				"Dingbat hex": "EC",
				"Unicode dec": "129149",
				"Unicode hex": "1F87D"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "237",
				"Dingbat hex": "ED",
				"Unicode dec": "129151",
				"Unicode hex": "1F87F"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "238",
				"Dingbat hex": "EE",
				"Unicode dec": "129150",
				"Unicode hex": "1F87E"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "239",
				"Dingbat hex": "EF",
				"Unicode dec": "8678",
				"Unicode hex": "21E6"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "240",
				"Dingbat hex": "F0",
				"Unicode dec": "8680",
				"Unicode hex": "21E8"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "241",
				"Dingbat hex": "F1",
				"Unicode dec": "8679",
				"Unicode hex": "21E7"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "242",
				"Dingbat hex": "F2",
				"Unicode dec": "8681",
				"Unicode hex": "21E9"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "243",
				"Dingbat hex": "F3",
				"Unicode dec": "11012",
				"Unicode hex": "2B04"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "244",
				"Dingbat hex": "F4",
				"Unicode dec": "8691",
				"Unicode hex": "21F3"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "245",
				"Dingbat hex": "F5",
				"Unicode dec": "11009",
				"Unicode hex": "2B01"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "246",
				"Dingbat hex": "F6",
				"Unicode dec": "11008",
				"Unicode hex": "2B00"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "247",
				"Dingbat hex": "F7",
				"Unicode dec": "11011",
				"Unicode hex": "2B03"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "248",
				"Dingbat hex": "F8",
				"Unicode dec": "11010",
				"Unicode hex": "2B02"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "249",
				"Dingbat hex": "F9",
				"Unicode dec": "129196",
				"Unicode hex": "1F8AC"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "250",
				"Dingbat hex": "FA",
				"Unicode dec": "129197",
				"Unicode hex": "1F8AD"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "251",
				"Dingbat hex": "FB",
				"Unicode dec": "128502",
				"Unicode hex": "1F5F6"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "252",
				"Dingbat hex": "FC",
				"Unicode dec": "10003",
				"Unicode hex": "2713"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "253",
				"Dingbat hex": "FD",
				"Unicode dec": "128503",
				"Unicode hex": "1F5F7"
			},
			{
				"Typeface name": "Wingdings",
				"Dingbat dec": "254",
				"Dingbat hex": "FE",
				"Unicode dec": "128505",
				"Unicode hex": "1F5F9"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "32",
				"Dingbat hex": "20",
				"Unicode dec": "32",
				"Unicode hex": "20"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "33",
				"Dingbat hex": "21",
				"Unicode dec": "128394",
				"Unicode hex": "1F58A"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "34",
				"Dingbat hex": "22",
				"Unicode dec": "128395",
				"Unicode hex": "1F58B"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "35",
				"Dingbat hex": "23",
				"Unicode dec": "128396",
				"Unicode hex": "1F58C"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "36",
				"Dingbat hex": "24",
				"Unicode dec": "128397",
				"Unicode hex": "1F58D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "37",
				"Dingbat hex": "25",
				"Unicode dec": "9988",
				"Unicode hex": "2704"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "38",
				"Dingbat hex": "26",
				"Unicode dec": "9984",
				"Unicode hex": "2700"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "39",
				"Dingbat hex": "27",
				"Unicode dec": "128382",
				"Unicode hex": "1F57E"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "40",
				"Dingbat hex": "28",
				"Unicode dec": "128381",
				"Unicode hex": "1F57D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "41",
				"Dingbat hex": "29",
				"Unicode dec": "128453",
				"Unicode hex": "1F5C5"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "42",
				"Dingbat hex": "2A",
				"Unicode dec": "128454",
				"Unicode hex": "1F5C6"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "43",
				"Dingbat hex": "2B",
				"Unicode dec": "128455",
				"Unicode hex": "1F5C7"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "44",
				"Dingbat hex": "2C",
				"Unicode dec": "128456",
				"Unicode hex": "1F5C8"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "45",
				"Dingbat hex": "2D",
				"Unicode dec": "128457",
				"Unicode hex": "1F5C9"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "46",
				"Dingbat hex": "2E",
				"Unicode dec": "128458",
				"Unicode hex": "1F5CA"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "47",
				"Dingbat hex": "2F",
				"Unicode dec": "128459",
				"Unicode hex": "1F5CB"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "48",
				"Dingbat hex": "30",
				"Unicode dec": "128460",
				"Unicode hex": "1F5CC"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "49",
				"Dingbat hex": "31",
				"Unicode dec": "128461",
				"Unicode hex": "1F5CD"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "50",
				"Dingbat hex": "32",
				"Unicode dec": "128203",
				"Unicode hex": "1F4CB"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "51",
				"Dingbat hex": "33",
				"Unicode dec": "128465",
				"Unicode hex": "1F5D1"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "52",
				"Dingbat hex": "34",
				"Unicode dec": "128468",
				"Unicode hex": "1F5D4"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "53",
				"Dingbat hex": "35",
				"Unicode dec": "128437",
				"Unicode hex": "1F5B5"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "54",
				"Dingbat hex": "36",
				"Unicode dec": "128438",
				"Unicode hex": "1F5B6"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "55",
				"Dingbat hex": "37",
				"Unicode dec": "128439",
				"Unicode hex": "1F5B7"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "56",
				"Dingbat hex": "38",
				"Unicode dec": "128440",
				"Unicode hex": "1F5B8"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "57",
				"Dingbat hex": "39",
				"Unicode dec": "128429",
				"Unicode hex": "1F5AD"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "58",
				"Dingbat hex": "3A",
				"Unicode dec": "128431",
				"Unicode hex": "1F5AF"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "59",
				"Dingbat hex": "3B",
				"Unicode dec": "128433",
				"Unicode hex": "1F5B1"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "60",
				"Dingbat hex": "3C",
				"Unicode dec": "128402",
				"Unicode hex": "1F592"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "61",
				"Dingbat hex": "3D",
				"Unicode dec": "128403",
				"Unicode hex": "1F593"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "62",
				"Dingbat hex": "3E",
				"Unicode dec": "128408",
				"Unicode hex": "1F598"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "63",
				"Dingbat hex": "3F",
				"Unicode dec": "128409",
				"Unicode hex": "1F599"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "64",
				"Dingbat hex": "40",
				"Unicode dec": "128410",
				"Unicode hex": "1F59A"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "65",
				"Dingbat hex": "41",
				"Unicode dec": "128411",
				"Unicode hex": "1F59B"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "66",
				"Dingbat hex": "42",
				"Unicode dec": "128072",
				"Unicode hex": "1F448"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "67",
				"Dingbat hex": "43",
				"Unicode dec": "128073",
				"Unicode hex": "1F449"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "68",
				"Dingbat hex": "44",
				"Unicode dec": "128412",
				"Unicode hex": "1F59C"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "69",
				"Dingbat hex": "45",
				"Unicode dec": "128413",
				"Unicode hex": "1F59D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "70",
				"Dingbat hex": "46",
				"Unicode dec": "128414",
				"Unicode hex": "1F59E"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "71",
				"Dingbat hex": "47",
				"Unicode dec": "128415",
				"Unicode hex": "1F59F"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "72",
				"Dingbat hex": "48",
				"Unicode dec": "128416",
				"Unicode hex": "1F5A0"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "73",
				"Dingbat hex": "49",
				"Unicode dec": "128417",
				"Unicode hex": "1F5A1"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "74",
				"Dingbat hex": "4A",
				"Unicode dec": "128070",
				"Unicode hex": "1F446"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "75",
				"Dingbat hex": "4B",
				"Unicode dec": "128071",
				"Unicode hex": "1F447"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "76",
				"Dingbat hex": "4C",
				"Unicode dec": "128418",
				"Unicode hex": "1F5A2"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "77",
				"Dingbat hex": "4D",
				"Unicode dec": "128419",
				"Unicode hex": "1F5A3"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "78",
				"Dingbat hex": "4E",
				"Unicode dec": "128401",
				"Unicode hex": "1F591"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "79",
				"Dingbat hex": "4F",
				"Unicode dec": "128500",
				"Unicode hex": "1F5F4"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "80",
				"Dingbat hex": "50",
				"Unicode dec": "128504",
				"Unicode hex": "1F5F8"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "81",
				"Dingbat hex": "51",
				"Unicode dec": "128501",
				"Unicode hex": "1F5F5"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "82",
				"Dingbat hex": "52",
				"Unicode dec": "9745",
				"Unicode hex": "2611"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "83",
				"Dingbat hex": "53",
				"Unicode dec": "11197",
				"Unicode hex": "2BBD"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "84",
				"Dingbat hex": "54",
				"Unicode dec": "9746",
				"Unicode hex": "2612"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "85",
				"Dingbat hex": "55",
				"Unicode dec": "11198",
				"Unicode hex": "2BBE"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "86",
				"Dingbat hex": "56",
				"Unicode dec": "11199",
				"Unicode hex": "2BBF"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "87",
				"Dingbat hex": "57",
				"Unicode dec": "128711",
				"Unicode hex": "1F6C7"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "88",
				"Dingbat hex": "58",
				"Unicode dec": "10680",
				"Unicode hex": "29B8"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "89",
				"Dingbat hex": "59",
				"Unicode dec": "128625",
				"Unicode hex": "1F671"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "90",
				"Dingbat hex": "5A",
				"Unicode dec": "128628",
				"Unicode hex": "1F674"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "91",
				"Dingbat hex": "5B",
				"Unicode dec": "128626",
				"Unicode hex": "1F672"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "92",
				"Dingbat hex": "5C",
				"Unicode dec": "128627",
				"Unicode hex": "1F673"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "93",
				"Dingbat hex": "5D",
				"Unicode dec": "8253",
				"Unicode hex": "203D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "94",
				"Dingbat hex": "5E",
				"Unicode dec": "128633",
				"Unicode hex": "1F679"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "95",
				"Dingbat hex": "5F",
				"Unicode dec": "128634",
				"Unicode hex": "1F67A"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "96",
				"Dingbat hex": "60",
				"Unicode dec": "128635",
				"Unicode hex": "1F67B"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "97",
				"Dingbat hex": "61",
				"Unicode dec": "128614",
				"Unicode hex": "1F666"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "98",
				"Dingbat hex": "62",
				"Unicode dec": "128612",
				"Unicode hex": "1F664"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "99",
				"Dingbat hex": "63",
				"Unicode dec": "128613",
				"Unicode hex": "1F665"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "100",
				"Dingbat hex": "64",
				"Unicode dec": "128615",
				"Unicode hex": "1F667"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "101",
				"Dingbat hex": "65",
				"Unicode dec": "128602",
				"Unicode hex": "1F65A"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "102",
				"Dingbat hex": "66",
				"Unicode dec": "128600",
				"Unicode hex": "1F658"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "103",
				"Dingbat hex": "67",
				"Unicode dec": "128601",
				"Unicode hex": "1F659"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "104",
				"Dingbat hex": "68",
				"Unicode dec": "128603",
				"Unicode hex": "1F65B"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "105",
				"Dingbat hex": "69",
				"Unicode dec": "9450",
				"Unicode hex": "24EA"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "106",
				"Dingbat hex": "6A",
				"Unicode dec": "9312",
				"Unicode hex": "2460"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "107",
				"Dingbat hex": "6B",
				"Unicode dec": "9313",
				"Unicode hex": "2461"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "108",
				"Dingbat hex": "6C",
				"Unicode dec": "9314",
				"Unicode hex": "2462"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "109",
				"Dingbat hex": "6D",
				"Unicode dec": "9315",
				"Unicode hex": "2463"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "110",
				"Dingbat hex": "6E",
				"Unicode dec": "9316",
				"Unicode hex": "2464"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "111",
				"Dingbat hex": "6F",
				"Unicode dec": "9317",
				"Unicode hex": "2465"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "112",
				"Dingbat hex": "70",
				"Unicode dec": "9318",
				"Unicode hex": "2466"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "113",
				"Dingbat hex": "71",
				"Unicode dec": "9319",
				"Unicode hex": "2467"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "114",
				"Dingbat hex": "72",
				"Unicode dec": "9320",
				"Unicode hex": "2468"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "115",
				"Dingbat hex": "73",
				"Unicode dec": "9321",
				"Unicode hex": "2469"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "116",
				"Dingbat hex": "74",
				"Unicode dec": "9471",
				"Unicode hex": "24FF"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "117",
				"Dingbat hex": "75",
				"Unicode dec": "10102",
				"Unicode hex": "2776"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "118",
				"Dingbat hex": "76",
				"Unicode dec": "10103",
				"Unicode hex": "2777"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "119",
				"Dingbat hex": "77",
				"Unicode dec": "10104",
				"Unicode hex": "2778"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "120",
				"Dingbat hex": "78",
				"Unicode dec": "10105",
				"Unicode hex": "2779"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "121",
				"Dingbat hex": "79",
				"Unicode dec": "10106",
				"Unicode hex": "277A"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "122",
				"Dingbat hex": "7A",
				"Unicode dec": "10107",
				"Unicode hex": "277B"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "123",
				"Dingbat hex": "7B",
				"Unicode dec": "10108",
				"Unicode hex": "277C"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "124",
				"Dingbat hex": "7C",
				"Unicode dec": "10109",
				"Unicode hex": "277D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "125",
				"Dingbat hex": "7D",
				"Unicode dec": "10110",
				"Unicode hex": "277E"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "126",
				"Dingbat hex": "7E",
				"Unicode dec": "10111",
				"Unicode hex": "277F"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "128",
				"Dingbat hex": "80",
				"Unicode dec": "9737",
				"Unicode hex": "2609"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "129",
				"Dingbat hex": "81",
				"Unicode dec": "127765",
				"Unicode hex": "1F315"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "130",
				"Dingbat hex": "82",
				"Unicode dec": "9789",
				"Unicode hex": "263D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "131",
				"Dingbat hex": "83",
				"Unicode dec": "9790",
				"Unicode hex": "263E"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "132",
				"Dingbat hex": "84",
				"Unicode dec": "11839",
				"Unicode hex": "2E3F"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "133",
				"Dingbat hex": "85",
				"Unicode dec": "10013",
				"Unicode hex": "271D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "134",
				"Dingbat hex": "86",
				"Unicode dec": "128327",
				"Unicode hex": "1F547"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "135",
				"Dingbat hex": "87",
				"Unicode dec": "128348",
				"Unicode hex": "1F55C"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "136",
				"Dingbat hex": "88",
				"Unicode dec": "128349",
				"Unicode hex": "1F55D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "137",
				"Dingbat hex": "89",
				"Unicode dec": "128350",
				"Unicode hex": "1F55E"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "138",
				"Dingbat hex": "8A",
				"Unicode dec": "128351",
				"Unicode hex": "1F55F"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "139",
				"Dingbat hex": "8B",
				"Unicode dec": "128352",
				"Unicode hex": "1F560"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "140",
				"Dingbat hex": "8C",
				"Unicode dec": "128353",
				"Unicode hex": "1F561"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "141",
				"Dingbat hex": "8D",
				"Unicode dec": "128354",
				"Unicode hex": "1F562"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "142",
				"Dingbat hex": "8E",
				"Unicode dec": "128355",
				"Unicode hex": "1F563"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "143",
				"Dingbat hex": "8F",
				"Unicode dec": "128356",
				"Unicode hex": "1F564"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "144",
				"Dingbat hex": "90",
				"Unicode dec": "128357",
				"Unicode hex": "1F565"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "145",
				"Dingbat hex": "91",
				"Unicode dec": "128358",
				"Unicode hex": "1F566"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "146",
				"Dingbat hex": "92",
				"Unicode dec": "128359",
				"Unicode hex": "1F567"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "147",
				"Dingbat hex": "93",
				"Unicode dec": "128616",
				"Unicode hex": "1F668"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "148",
				"Dingbat hex": "94",
				"Unicode dec": "128617",
				"Unicode hex": "1F669"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "149",
				"Dingbat hex": "95",
				"Unicode dec": "8901",
				"Unicode hex": "22C5"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "150",
				"Dingbat hex": "96",
				"Unicode dec": "128900",
				"Unicode hex": "1F784"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "151",
				"Dingbat hex": "97",
				"Unicode dec": "10625",
				"Unicode hex": "2981"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "152",
				"Dingbat hex": "98",
				"Unicode dec": "9679",
				"Unicode hex": "25CF"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "153",
				"Dingbat hex": "99",
				"Unicode dec": "9675",
				"Unicode hex": "25CB"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "154",
				"Dingbat hex": "9A",
				"Unicode dec": "128901",
				"Unicode hex": "1F785"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "155",
				"Dingbat hex": "9B",
				"Unicode dec": "128903",
				"Unicode hex": "1F787"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "156",
				"Dingbat hex": "9C",
				"Unicode dec": "128905",
				"Unicode hex": "1F789"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "157",
				"Dingbat hex": "9D",
				"Unicode dec": "8857",
				"Unicode hex": "2299"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "158",
				"Dingbat hex": "9E",
				"Unicode dec": "10687",
				"Unicode hex": "29BF"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "159",
				"Dingbat hex": "9F",
				"Unicode dec": "128908",
				"Unicode hex": "1F78C"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "160",
				"Dingbat hex": "A0",
				"Unicode dec": "128909",
				"Unicode hex": "1F78D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "161",
				"Dingbat hex": "A1",
				"Unicode dec": "9726",
				"Unicode hex": "25FE"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "162",
				"Dingbat hex": "A2",
				"Unicode dec": "9632",
				"Unicode hex": "25A0"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "163",
				"Dingbat hex": "A3",
				"Unicode dec": "9633",
				"Unicode hex": "25A1"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "164",
				"Dingbat hex": "A4",
				"Unicode dec": "128913",
				"Unicode hex": "1F791"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "165",
				"Dingbat hex": "A5",
				"Unicode dec": "128914",
				"Unicode hex": "1F792"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "166",
				"Dingbat hex": "A6",
				"Unicode dec": "128915",
				"Unicode hex": "1F793"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "167",
				"Dingbat hex": "A7",
				"Unicode dec": "128916",
				"Unicode hex": "1F794"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "168",
				"Dingbat hex": "A8",
				"Unicode dec": "9635",
				"Unicode hex": "25A3"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "169",
				"Dingbat hex": "A9",
				"Unicode dec": "128917",
				"Unicode hex": "1F795"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "170",
				"Dingbat hex": "AA",
				"Unicode dec": "128918",
				"Unicode hex": "1F796"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "171",
				"Dingbat hex": "AB",
				"Unicode dec": "128919",
				"Unicode hex": "1F797"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "172",
				"Dingbat hex": "AC",
				"Unicode dec": "128920",
				"Unicode hex": "1F798"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "173",
				"Dingbat hex": "AD",
				"Unicode dec": "11049",
				"Unicode hex": "2B29"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "174",
				"Dingbat hex": "AE",
				"Unicode dec": "11045",
				"Unicode hex": "2B25"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "175",
				"Dingbat hex": "AF",
				"Unicode dec": "9671",
				"Unicode hex": "25C7"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "176",
				"Dingbat hex": "B0",
				"Unicode dec": "128922",
				"Unicode hex": "1F79A"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "177",
				"Dingbat hex": "B1",
				"Unicode dec": "9672",
				"Unicode hex": "25C8"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "178",
				"Dingbat hex": "B2",
				"Unicode dec": "128923",
				"Unicode hex": "1F79B"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "179",
				"Dingbat hex": "B3",
				"Unicode dec": "128924",
				"Unicode hex": "1F79C"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "180",
				"Dingbat hex": "B4",
				"Unicode dec": "128925",
				"Unicode hex": "1F79D"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "181",
				"Dingbat hex": "B5",
				"Unicode dec": "128926",
				"Unicode hex": "1F79E"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "182",
				"Dingbat hex": "B6",
				"Unicode dec": "11050",
				"Unicode hex": "2B2A"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "183",
				"Dingbat hex": "B7",
				"Unicode dec": "11047",
				"Unicode hex": "2B27"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "184",
				"Dingbat hex": "B8",
				"Unicode dec": "9674",
				"Unicode hex": "25CA"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "185",
				"Dingbat hex": "B9",
				"Unicode dec": "128928",
				"Unicode hex": "1F7A0"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "186",
				"Dingbat hex": "BA",
				"Unicode dec": "9686",
				"Unicode hex": "25D6"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "187",
				"Dingbat hex": "BB",
				"Unicode dec": "9687",
				"Unicode hex": "25D7"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "188",
				"Dingbat hex": "BC",
				"Unicode dec": "11210",
				"Unicode hex": "2BCA"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "189",
				"Dingbat hex": "BD",
				"Unicode dec": "11211",
				"Unicode hex": "2BCB"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "190",
				"Dingbat hex": "BE",
				"Unicode dec": "11200",
				"Unicode hex": "2BC0"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "191",
				"Dingbat hex": "BF",
				"Unicode dec": "11201",
				"Unicode hex": "2BC1"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "192",
				"Dingbat hex": "C0",
				"Unicode dec": "11039",
				"Unicode hex": "2B1F"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "193",
				"Dingbat hex": "C1",
				"Unicode dec": "11202",
				"Unicode hex": "2BC2"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "194",
				"Dingbat hex": "C2",
				"Unicode dec": "11043",
				"Unicode hex": "2B23"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "195",
				"Dingbat hex": "C3",
				"Unicode dec": "11042",
				"Unicode hex": "2B22"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "196",
				"Dingbat hex": "C4",
				"Unicode dec": "11203",
				"Unicode hex": "2BC3"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "197",
				"Dingbat hex": "C5",
				"Unicode dec": "11204",
				"Unicode hex": "2BC4"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "198",
				"Dingbat hex": "C6",
				"Unicode dec": "128929",
				"Unicode hex": "1F7A1"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "199",
				"Dingbat hex": "C7",
				"Unicode dec": "128930",
				"Unicode hex": "1F7A2"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "200",
				"Dingbat hex": "C8",
				"Unicode dec": "128931",
				"Unicode hex": "1F7A3"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "201",
				"Dingbat hex": "C9",
				"Unicode dec": "128932",
				"Unicode hex": "1F7A4"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "202",
				"Dingbat hex": "CA",
				"Unicode dec": "128933",
				"Unicode hex": "1F7A5"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "203",
				"Dingbat hex": "CB",
				"Unicode dec": "128934",
				"Unicode hex": "1F7A6"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "204",
				"Dingbat hex": "CC",
				"Unicode dec": "128935",
				"Unicode hex": "1F7A7"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "205",
				"Dingbat hex": "CD",
				"Unicode dec": "128936",
				"Unicode hex": "1F7A8"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "206",
				"Dingbat hex": "CE",
				"Unicode dec": "128937",
				"Unicode hex": "1F7A9"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "207",
				"Dingbat hex": "CF",
				"Unicode dec": "128938",
				"Unicode hex": "1F7AA"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "208",
				"Dingbat hex": "D0",
				"Unicode dec": "128939",
				"Unicode hex": "1F7AB"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "209",
				"Dingbat hex": "D1",
				"Unicode dec": "128940",
				"Unicode hex": "1F7AC"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "210",
				"Dingbat hex": "D2",
				"Unicode dec": "128941",
				"Unicode hex": "1F7AD"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "211",
				"Dingbat hex": "D3",
				"Unicode dec": "128942",
				"Unicode hex": "1F7AE"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "212",
				"Dingbat hex": "D4",
				"Unicode dec": "128943",
				"Unicode hex": "1F7AF"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "213",
				"Dingbat hex": "D5",
				"Unicode dec": "128944",
				"Unicode hex": "1F7B0"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "214",
				"Dingbat hex": "D6",
				"Unicode dec": "128945",
				"Unicode hex": "1F7B1"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "215",
				"Dingbat hex": "D7",
				"Unicode dec": "128946",
				"Unicode hex": "1F7B2"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "216",
				"Dingbat hex": "D8",
				"Unicode dec": "128947",
				"Unicode hex": "1F7B3"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "217",
				"Dingbat hex": "D9",
				"Unicode dec": "128948",
				"Unicode hex": "1F7B4"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "218",
				"Dingbat hex": "DA",
				"Unicode dec": "128949",
				"Unicode hex": "1F7B5"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "219",
				"Dingbat hex": "DB",
				"Unicode dec": "128950",
				"Unicode hex": "1F7B6"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "220",
				"Dingbat hex": "DC",
				"Unicode dec": "128951",
				"Unicode hex": "1F7B7"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "221",
				"Dingbat hex": "DD",
				"Unicode dec": "128952",
				"Unicode hex": "1F7B8"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "222",
				"Dingbat hex": "DE",
				"Unicode dec": "128953",
				"Unicode hex": "1F7B9"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "223",
				"Dingbat hex": "DF",
				"Unicode dec": "128954",
				"Unicode hex": "1F7BA"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "224",
				"Dingbat hex": "E0",
				"Unicode dec": "128955",
				"Unicode hex": "1F7BB"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "225",
				"Dingbat hex": "E1",
				"Unicode dec": "128956",
				"Unicode hex": "1F7BC"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "226",
				"Dingbat hex": "E2",
				"Unicode dec": "128957",
				"Unicode hex": "1F7BD"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "227",
				"Dingbat hex": "E3",
				"Unicode dec": "128958",
				"Unicode hex": "1F7BE"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "228",
				"Dingbat hex": "E4",
				"Unicode dec": "128959",
				"Unicode hex": "1F7BF"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "229",
				"Dingbat hex": "E5",
				"Unicode dec": "128960",
				"Unicode hex": "1F7C0"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "230",
				"Dingbat hex": "E6",
				"Unicode dec": "128962",
				"Unicode hex": "1F7C2"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "231",
				"Dingbat hex": "E7",
				"Unicode dec": "128964",
				"Unicode hex": "1F7C4"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "232",
				"Dingbat hex": "E8",
				"Unicode dec": "128966",
				"Unicode hex": "1F7C6"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "233",
				"Dingbat hex": "E9",
				"Unicode dec": "128969",
				"Unicode hex": "1F7C9"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "234",
				"Dingbat hex": "EA",
				"Unicode dec": "128970",
				"Unicode hex": "1F7CA"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "235",
				"Dingbat hex": "EB",
				"Unicode dec": "10038",
				"Unicode hex": "2736"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "236",
				"Dingbat hex": "EC",
				"Unicode dec": "128972",
				"Unicode hex": "1F7CC"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "237",
				"Dingbat hex": "ED",
				"Unicode dec": "128974",
				"Unicode hex": "1F7CE"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "238",
				"Dingbat hex": "EE",
				"Unicode dec": "128976",
				"Unicode hex": "1F7D0"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "239",
				"Dingbat hex": "EF",
				"Unicode dec": "128978",
				"Unicode hex": "1F7D2"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "240",
				"Dingbat hex": "F0",
				"Unicode dec": "10041",
				"Unicode hex": "2739"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "241",
				"Dingbat hex": "F1",
				"Unicode dec": "128963",
				"Unicode hex": "1F7C3"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "242",
				"Dingbat hex": "F2",
				"Unicode dec": "128967",
				"Unicode hex": "1F7C7"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "243",
				"Dingbat hex": "F3",
				"Unicode dec": "10031",
				"Unicode hex": "272F"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "244",
				"Dingbat hex": "F4",
				"Unicode dec": "128973",
				"Unicode hex": "1F7CD"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "245",
				"Dingbat hex": "F5",
				"Unicode dec": "128980",
				"Unicode hex": "1F7D4"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "246",
				"Dingbat hex": "F6",
				"Unicode dec": "11212",
				"Unicode hex": "2BCC"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "247",
				"Dingbat hex": "F7",
				"Unicode dec": "11213",
				"Unicode hex": "2BCD"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "248",
				"Dingbat hex": "F8",
				"Unicode dec": "8251",
				"Unicode hex": "203B"
			},
			{
				"Typeface name": "Wingdings 2",
				"Dingbat dec": "249",
				"Dingbat hex": "F9",
				"Unicode dec": "8258",
				"Unicode hex": "2042"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "32",
				"Dingbat hex": "20",
				"Unicode dec": "32",
				"Unicode hex": "20"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "33",
				"Dingbat hex": "21",
				"Unicode dec": "11104",
				"Unicode hex": "2B60"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "34",
				"Dingbat hex": "22",
				"Unicode dec": "11106",
				"Unicode hex": "2B62"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "35",
				"Dingbat hex": "23",
				"Unicode dec": "11105",
				"Unicode hex": "2B61"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "36",
				"Dingbat hex": "24",
				"Unicode dec": "11107",
				"Unicode hex": "2B63"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "37",
				"Dingbat hex": "25",
				"Unicode dec": "11110",
				"Unicode hex": "2B66"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "38",
				"Dingbat hex": "26",
				"Unicode dec": "11111",
				"Unicode hex": "2B67"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "39",
				"Dingbat hex": "27",
				"Unicode dec": "11113",
				"Unicode hex": "2B69"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "40",
				"Dingbat hex": "28",
				"Unicode dec": "11112",
				"Unicode hex": "2B68"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "41",
				"Dingbat hex": "29",
				"Unicode dec": "11120",
				"Unicode hex": "2B70"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "42",
				"Dingbat hex": "2A",
				"Unicode dec": "11122",
				"Unicode hex": "2B72"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "43",
				"Dingbat hex": "2B",
				"Unicode dec": "11121",
				"Unicode hex": "2B71"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "44",
				"Dingbat hex": "2C",
				"Unicode dec": "11123",
				"Unicode hex": "2B73"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "45",
				"Dingbat hex": "2D",
				"Unicode dec": "11126",
				"Unicode hex": "2B76"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "46",
				"Dingbat hex": "2E",
				"Unicode dec": "11128",
				"Unicode hex": "2B78"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "47",
				"Dingbat hex": "2F",
				"Unicode dec": "11131",
				"Unicode hex": "2B7B"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "48",
				"Dingbat hex": "30",
				"Unicode dec": "11133",
				"Unicode hex": "2B7D"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "49",
				"Dingbat hex": "31",
				"Unicode dec": "11108",
				"Unicode hex": "2B64"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "50",
				"Dingbat hex": "32",
				"Unicode dec": "11109",
				"Unicode hex": "2B65"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "51",
				"Dingbat hex": "33",
				"Unicode dec": "11114",
				"Unicode hex": "2B6A"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "52",
				"Dingbat hex": "34",
				"Unicode dec": "11116",
				"Unicode hex": "2B6C"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "53",
				"Dingbat hex": "35",
				"Unicode dec": "11115",
				"Unicode hex": "2B6B"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "54",
				"Dingbat hex": "36",
				"Unicode dec": "11117",
				"Unicode hex": "2B6D"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "55",
				"Dingbat hex": "37",
				"Unicode dec": "11085",
				"Unicode hex": "2B4D"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "56",
				"Dingbat hex": "38",
				"Unicode dec": "11168",
				"Unicode hex": "2BA0"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "57",
				"Dingbat hex": "39",
				"Unicode dec": "11169",
				"Unicode hex": "2BA1"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "58",
				"Dingbat hex": "3A",
				"Unicode dec": "11170",
				"Unicode hex": "2BA2"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "59",
				"Dingbat hex": "3B",
				"Unicode dec": "11171",
				"Unicode hex": "2BA3"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "60",
				"Dingbat hex": "3C",
				"Unicode dec": "11172",
				"Unicode hex": "2BA4"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "61",
				"Dingbat hex": "3D",
				"Unicode dec": "11173",
				"Unicode hex": "2BA5"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "62",
				"Dingbat hex": "3E",
				"Unicode dec": "11174",
				"Unicode hex": "2BA6"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "63",
				"Dingbat hex": "3F",
				"Unicode dec": "11175",
				"Unicode hex": "2BA7"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "64",
				"Dingbat hex": "40",
				"Unicode dec": "11152",
				"Unicode hex": "2B90"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "65",
				"Dingbat hex": "41",
				"Unicode dec": "11153",
				"Unicode hex": "2B91"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "66",
				"Dingbat hex": "42",
				"Unicode dec": "11154",
				"Unicode hex": "2B92"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "67",
				"Dingbat hex": "43",
				"Unicode dec": "11155",
				"Unicode hex": "2B93"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "68",
				"Dingbat hex": "44",
				"Unicode dec": "11136",
				"Unicode hex": "2B80"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "69",
				"Dingbat hex": "45",
				"Unicode dec": "11139",
				"Unicode hex": "2B83"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "70",
				"Dingbat hex": "46",
				"Unicode dec": "11134",
				"Unicode hex": "2B7E"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "71",
				"Dingbat hex": "47",
				"Unicode dec": "11135",
				"Unicode hex": "2B7F"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "72",
				"Dingbat hex": "48",
				"Unicode dec": "11140",
				"Unicode hex": "2B84"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "73",
				"Dingbat hex": "49",
				"Unicode dec": "11142",
				"Unicode hex": "2B86"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "74",
				"Dingbat hex": "4A",
				"Unicode dec": "11141",
				"Unicode hex": "2B85"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "75",
				"Dingbat hex": "4B",
				"Unicode dec": "11143",
				"Unicode hex": "2B87"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "76",
				"Dingbat hex": "4C",
				"Unicode dec": "11151",
				"Unicode hex": "2B8F"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "77",
				"Dingbat hex": "4D",
				"Unicode dec": "11149",
				"Unicode hex": "2B8D"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "78",
				"Dingbat hex": "4E",
				"Unicode dec": "11150",
				"Unicode hex": "2B8E"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "79",
				"Dingbat hex": "4F",
				"Unicode dec": "11148",
				"Unicode hex": "2B8C"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "80",
				"Dingbat hex": "50",
				"Unicode dec": "11118",
				"Unicode hex": "2B6E"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "81",
				"Dingbat hex": "51",
				"Unicode dec": "11119",
				"Unicode hex": "2B6F"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "82",
				"Dingbat hex": "52",
				"Unicode dec": "9099",
				"Unicode hex": "238B"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "83",
				"Dingbat hex": "53",
				"Unicode dec": "8996",
				"Unicode hex": "2324"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "84",
				"Dingbat hex": "54",
				"Unicode dec": "8963",
				"Unicode hex": "2303"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "85",
				"Dingbat hex": "55",
				"Unicode dec": "8997",
				"Unicode hex": "2325"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "86",
				"Dingbat hex": "56",
				"Unicode dec": "9251",
				"Unicode hex": "2423"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "87",
				"Dingbat hex": "57",
				"Unicode dec": "9085",
				"Unicode hex": "237D"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "88",
				"Dingbat hex": "58",
				"Unicode dec": "8682",
				"Unicode hex": "21EA"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "89",
				"Dingbat hex": "59",
				"Unicode dec": "11192",
				"Unicode hex": "2BB8"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "90",
				"Dingbat hex": "5A",
				"Unicode dec": "129184",
				"Unicode hex": "1F8A0"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "91",
				"Dingbat hex": "5B",
				"Unicode dec": "129185",
				"Unicode hex": "1F8A1"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "92",
				"Dingbat hex": "5C",
				"Unicode dec": "129186",
				"Unicode hex": "1F8A2"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "93",
				"Dingbat hex": "5D",
				"Unicode dec": "129187",
				"Unicode hex": "1F8A3"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "94",
				"Dingbat hex": "5E",
				"Unicode dec": "129188",
				"Unicode hex": "1F8A4"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "95",
				"Dingbat hex": "5F",
				"Unicode dec": "129189",
				"Unicode hex": "1F8A5"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "96",
				"Dingbat hex": "60",
				"Unicode dec": "129190",
				"Unicode hex": "1F8A6"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "97",
				"Dingbat hex": "61",
				"Unicode dec": "129191",
				"Unicode hex": "1F8A7"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "98",
				"Dingbat hex": "62",
				"Unicode dec": "129192",
				"Unicode hex": "1F8A8"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "99",
				"Dingbat hex": "63",
				"Unicode dec": "129193",
				"Unicode hex": "1F8A9"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "100",
				"Dingbat hex": "64",
				"Unicode dec": "129194",
				"Unicode hex": "1F8AA"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "101",
				"Dingbat hex": "65",
				"Unicode dec": "129195",
				"Unicode hex": "1F8AB"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "102",
				"Dingbat hex": "66",
				"Unicode dec": "129104",
				"Unicode hex": "1F850"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "103",
				"Dingbat hex": "67",
				"Unicode dec": "129106",
				"Unicode hex": "1F852"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "104",
				"Dingbat hex": "68",
				"Unicode dec": "129105",
				"Unicode hex": "1F851"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "105",
				"Dingbat hex": "69",
				"Unicode dec": "129107",
				"Unicode hex": "1F853"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "106",
				"Dingbat hex": "6A",
				"Unicode dec": "129108",
				"Unicode hex": "1F854"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "107",
				"Dingbat hex": "6B",
				"Unicode dec": "129109",
				"Unicode hex": "1F855"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "108",
				"Dingbat hex": "6C",
				"Unicode dec": "129111",
				"Unicode hex": "1F857"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "109",
				"Dingbat hex": "6D",
				"Unicode dec": "129110",
				"Unicode hex": "1F856"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "110",
				"Dingbat hex": "6E",
				"Unicode dec": "129112",
				"Unicode hex": "1F858"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "111",
				"Dingbat hex": "6F",
				"Unicode dec": "129113",
				"Unicode hex": "1F859"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "112",
				"Dingbat hex": "70",
				"Unicode dec": "9650",
				"Unicode hex": "25B2"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "113",
				"Dingbat hex": "71",
				"Unicode dec": "9660",
				"Unicode hex": "25BC"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "114",
				"Dingbat hex": "72",
				"Unicode dec": "9651",
				"Unicode hex": "25B3"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "115",
				"Dingbat hex": "73",
				"Unicode dec": "9661",
				"Unicode hex": "25BD"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "116",
				"Dingbat hex": "74",
				"Unicode dec": "9664",
				"Unicode hex": "25C0"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "117",
				"Dingbat hex": "75",
				"Unicode dec": "9654",
				"Unicode hex": "25B6"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "118",
				"Dingbat hex": "76",
				"Unicode dec": "9665",
				"Unicode hex": "25C1"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "119",
				"Dingbat hex": "77",
				"Unicode dec": "9655",
				"Unicode hex": "25B7"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "120",
				"Dingbat hex": "78",
				"Unicode dec": "9699",
				"Unicode hex": "25E3"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "121",
				"Dingbat hex": "79",
				"Unicode dec": "9698",
				"Unicode hex": "25E2"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "122",
				"Dingbat hex": "7A",
				"Unicode dec": "9700",
				"Unicode hex": "25E4"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "123",
				"Dingbat hex": "7B",
				"Unicode dec": "9701",
				"Unicode hex": "25E5"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "124",
				"Dingbat hex": "7C",
				"Unicode dec": "128896",
				"Unicode hex": "1F780"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "125",
				"Dingbat hex": "7D",
				"Unicode dec": "128898",
				"Unicode hex": "1F782"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "126",
				"Dingbat hex": "7E",
				"Unicode dec": "128897",
				"Unicode hex": "1F781"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "128",
				"Dingbat hex": "80",
				"Unicode dec": "128899",
				"Unicode hex": "1F783"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "129",
				"Dingbat hex": "81",
				"Unicode dec": "11205",
				"Unicode hex": "2BC5"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "130",
				"Dingbat hex": "82",
				"Unicode dec": "11206",
				"Unicode hex": "2BC6"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "131",
				"Dingbat hex": "83",
				"Unicode dec": "11207",
				"Unicode hex": "2BC7"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "132",
				"Dingbat hex": "84",
				"Unicode dec": "11208",
				"Unicode hex": "2BC8"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "133",
				"Dingbat hex": "85",
				"Unicode dec": "11164",
				"Unicode hex": "2B9C"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "134",
				"Dingbat hex": "86",
				"Unicode dec": "11166",
				"Unicode hex": "2B9E"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "135",
				"Dingbat hex": "87",
				"Unicode dec": "11165",
				"Unicode hex": "2B9D"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "136",
				"Dingbat hex": "88",
				"Unicode dec": "11167",
				"Unicode hex": "2B9F"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "137",
				"Dingbat hex": "89",
				"Unicode dec": "129040",
				"Unicode hex": "1F810"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "138",
				"Dingbat hex": "8A",
				"Unicode dec": "129042",
				"Unicode hex": "1F812"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "139",
				"Dingbat hex": "8B",
				"Unicode dec": "129041",
				"Unicode hex": "1F811"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "140",
				"Dingbat hex": "8C",
				"Unicode dec": "129043",
				"Unicode hex": "1F813"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "141",
				"Dingbat hex": "8D",
				"Unicode dec": "129044",
				"Unicode hex": "1F814"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "142",
				"Dingbat hex": "8E",
				"Unicode dec": "129046",
				"Unicode hex": "1F816"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "143",
				"Dingbat hex": "8F",
				"Unicode dec": "129045",
				"Unicode hex": "1F815"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "144",
				"Dingbat hex": "90",
				"Unicode dec": "129047",
				"Unicode hex": "1F817"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "145",
				"Dingbat hex": "91",
				"Unicode dec": "129048",
				"Unicode hex": "1F818"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "146",
				"Dingbat hex": "92",
				"Unicode dec": "129050",
				"Unicode hex": "1F81A"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "147",
				"Dingbat hex": "93",
				"Unicode dec": "129049",
				"Unicode hex": "1F819"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "148",
				"Dingbat hex": "94",
				"Unicode dec": "129051",
				"Unicode hex": "1F81B"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "149",
				"Dingbat hex": "95",
				"Unicode dec": "129052",
				"Unicode hex": "1F81C"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "150",
				"Dingbat hex": "96",
				"Unicode dec": "129054",
				"Unicode hex": "1F81E"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "151",
				"Dingbat hex": "97",
				"Unicode dec": "129053",
				"Unicode hex": "1F81D"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "152",
				"Dingbat hex": "98",
				"Unicode dec": "129055",
				"Unicode hex": "1F81F"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "153",
				"Dingbat hex": "99",
				"Unicode dec": "129024",
				"Unicode hex": "1F800"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "154",
				"Dingbat hex": "9A",
				"Unicode dec": "129026",
				"Unicode hex": "1F802"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "155",
				"Dingbat hex": "9B",
				"Unicode dec": "129025",
				"Unicode hex": "1F801"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "156",
				"Dingbat hex": "9C",
				"Unicode dec": "129027",
				"Unicode hex": "1F803"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "157",
				"Dingbat hex": "9D",
				"Unicode dec": "129028",
				"Unicode hex": "1F804"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "158",
				"Dingbat hex": "9E",
				"Unicode dec": "129030",
				"Unicode hex": "1F806"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "159",
				"Dingbat hex": "9F",
				"Unicode dec": "129029",
				"Unicode hex": "1F805"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "160",
				"Dingbat hex": "A0",
				"Unicode dec": "129031",
				"Unicode hex": "1F807"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "161",
				"Dingbat hex": "A1",
				"Unicode dec": "129032",
				"Unicode hex": "1F808"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "162",
				"Dingbat hex": "A2",
				"Unicode dec": "129034",
				"Unicode hex": "1F80A"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "163",
				"Dingbat hex": "A3",
				"Unicode dec": "129033",
				"Unicode hex": "1F809"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "164",
				"Dingbat hex": "A4",
				"Unicode dec": "129035",
				"Unicode hex": "1F80B"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "165",
				"Dingbat hex": "A5",
				"Unicode dec": "129056",
				"Unicode hex": "1F820"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "166",
				"Dingbat hex": "A6",
				"Unicode dec": "129058",
				"Unicode hex": "1F822"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "167",
				"Dingbat hex": "A7",
				"Unicode dec": "129060",
				"Unicode hex": "1F824"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "168",
				"Dingbat hex": "A8",
				"Unicode dec": "129062",
				"Unicode hex": "1F826"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "169",
				"Dingbat hex": "A9",
				"Unicode dec": "129064",
				"Unicode hex": "1F828"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "170",
				"Dingbat hex": "AA",
				"Unicode dec": "129066",
				"Unicode hex": "1F82A"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "171",
				"Dingbat hex": "AB",
				"Unicode dec": "129068",
				"Unicode hex": "1F82C"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "172",
				"Dingbat hex": "AC",
				"Unicode dec": "129180",
				"Unicode hex": "1F89C"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "173",
				"Dingbat hex": "AD",
				"Unicode dec": "129181",
				"Unicode hex": "1F89D"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "174",
				"Dingbat hex": "AE",
				"Unicode dec": "129182",
				"Unicode hex": "1F89E"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "175",
				"Dingbat hex": "AF",
				"Unicode dec": "129183",
				"Unicode hex": "1F89F"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "176",
				"Dingbat hex": "B0",
				"Unicode dec": "129070",
				"Unicode hex": "1F82E"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "177",
				"Dingbat hex": "B1",
				"Unicode dec": "129072",
				"Unicode hex": "1F830"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "178",
				"Dingbat hex": "B2",
				"Unicode dec": "129074",
				"Unicode hex": "1F832"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "179",
				"Dingbat hex": "B3",
				"Unicode dec": "129076",
				"Unicode hex": "1F834"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "180",
				"Dingbat hex": "B4",
				"Unicode dec": "129078",
				"Unicode hex": "1F836"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "181",
				"Dingbat hex": "B5",
				"Unicode dec": "129080",
				"Unicode hex": "1F838"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "182",
				"Dingbat hex": "B6",
				"Unicode dec": "129082",
				"Unicode hex": "1F83A"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "183",
				"Dingbat hex": "B7",
				"Unicode dec": "129081",
				"Unicode hex": "1F839"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "184",
				"Dingbat hex": "B8",
				"Unicode dec": "129083",
				"Unicode hex": "1F83B"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "185",
				"Dingbat hex": "B9",
				"Unicode dec": "129176",
				"Unicode hex": "1F898"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "186",
				"Dingbat hex": "BA",
				"Unicode dec": "129178",
				"Unicode hex": "1F89A"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "187",
				"Dingbat hex": "BB",
				"Unicode dec": "129177",
				"Unicode hex": "1F899"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "188",
				"Dingbat hex": "BC",
				"Unicode dec": "129179",
				"Unicode hex": "1F89B"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "189",
				"Dingbat hex": "BD",
				"Unicode dec": "129084",
				"Unicode hex": "1F83C"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "190",
				"Dingbat hex": "BE",
				"Unicode dec": "129086",
				"Unicode hex": "1F83E"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "191",
				"Dingbat hex": "BF",
				"Unicode dec": "129085",
				"Unicode hex": "1F83D"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "192",
				"Dingbat hex": "C0",
				"Unicode dec": "129087",
				"Unicode hex": "1F83F"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "193",
				"Dingbat hex": "C1",
				"Unicode dec": "129088",
				"Unicode hex": "1F840"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "194",
				"Dingbat hex": "C2",
				"Unicode dec": "129090",
				"Unicode hex": "1F842"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "195",
				"Dingbat hex": "C3",
				"Unicode dec": "129089",
				"Unicode hex": "1F841"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "196",
				"Dingbat hex": "C4",
				"Unicode dec": "129091",
				"Unicode hex": "1F843"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "197",
				"Dingbat hex": "C5",
				"Unicode dec": "129092",
				"Unicode hex": "1F844"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "198",
				"Dingbat hex": "C6",
				"Unicode dec": "129094",
				"Unicode hex": "1F846"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "199",
				"Dingbat hex": "C7",
				"Unicode dec": "129093",
				"Unicode hex": "1F845"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "200",
				"Dingbat hex": "C8",
				"Unicode dec": "129095",
				"Unicode hex": "1F847"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "201",
				"Dingbat hex": "C9",
				"Unicode dec": "11176",
				"Unicode hex": "2BA8"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "202",
				"Dingbat hex": "CA",
				"Unicode dec": "11177",
				"Unicode hex": "2BA9"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "203",
				"Dingbat hex": "CB",
				"Unicode dec": "11178",
				"Unicode hex": "2BAA"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "204",
				"Dingbat hex": "CC",
				"Unicode dec": "11179",
				"Unicode hex": "2BAB"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "205",
				"Dingbat hex": "CD",
				"Unicode dec": "11180",
				"Unicode hex": "2BAC"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "206",
				"Dingbat hex": "CE",
				"Unicode dec": "11181",
				"Unicode hex": "2BAD"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "207",
				"Dingbat hex": "CF",
				"Unicode dec": "11182",
				"Unicode hex": "2BAE"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "208",
				"Dingbat hex": "D0",
				"Unicode dec": "11183",
				"Unicode hex": "2BAF"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "209",
				"Dingbat hex": "D1",
				"Unicode dec": "129120",
				"Unicode hex": "1F860"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "210",
				"Dingbat hex": "D2",
				"Unicode dec": "129122",
				"Unicode hex": "1F862"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "211",
				"Dingbat hex": "D3",
				"Unicode dec": "129121",
				"Unicode hex": "1F861"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "212",
				"Dingbat hex": "D4",
				"Unicode dec": "129123",
				"Unicode hex": "1F863"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "213",
				"Dingbat hex": "D5",
				"Unicode dec": "129124",
				"Unicode hex": "1F864"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "214",
				"Dingbat hex": "D6",
				"Unicode dec": "129125",
				"Unicode hex": "1F865"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "215",
				"Dingbat hex": "D7",
				"Unicode dec": "129127",
				"Unicode hex": "1F867"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "216",
				"Dingbat hex": "D8",
				"Unicode dec": "129126",
				"Unicode hex": "1F866"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "217",
				"Dingbat hex": "D9",
				"Unicode dec": "129136",
				"Unicode hex": "1F870"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "218",
				"Dingbat hex": "DA",
				"Unicode dec": "129138",
				"Unicode hex": "1F872"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "219",
				"Dingbat hex": "DB",
				"Unicode dec": "129137",
				"Unicode hex": "1F871"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "220",
				"Dingbat hex": "DC",
				"Unicode dec": "129139",
				"Unicode hex": "1F873"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "221",
				"Dingbat hex": "DD",
				"Unicode dec": "129140",
				"Unicode hex": "1F874"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "222",
				"Dingbat hex": "DE",
				"Unicode dec": "129141",
				"Unicode hex": "1F875"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "223",
				"Dingbat hex": "DF",
				"Unicode dec": "129143",
				"Unicode hex": "1F877"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "224",
				"Dingbat hex": "E0",
				"Unicode dec": "129142",
				"Unicode hex": "1F876"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "225",
				"Dingbat hex": "E1",
				"Unicode dec": "129152",
				"Unicode hex": "1F880"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "226",
				"Dingbat hex": "E2",
				"Unicode dec": "129154",
				"Unicode hex": "1F882"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "227",
				"Dingbat hex": "E3",
				"Unicode dec": "129153",
				"Unicode hex": "1F881"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "228",
				"Dingbat hex": "E4",
				"Unicode dec": "129155",
				"Unicode hex": "1F883"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "229",
				"Dingbat hex": "E5",
				"Unicode dec": "129156",
				"Unicode hex": "1F884"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "230",
				"Dingbat hex": "E6",
				"Unicode dec": "129157",
				"Unicode hex": "1F885"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "231",
				"Dingbat hex": "E7",
				"Unicode dec": "129159",
				"Unicode hex": "1F887"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "232",
				"Dingbat hex": "E8",
				"Unicode dec": "129158",
				"Unicode hex": "1F886"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "233",
				"Dingbat hex": "E9",
				"Unicode dec": "129168",
				"Unicode hex": "1F890"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "234",
				"Dingbat hex": "EA",
				"Unicode dec": "129170",
				"Unicode hex": "1F892"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "235",
				"Dingbat hex": "EB",
				"Unicode dec": "129169",
				"Unicode hex": "1F891"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "236",
				"Dingbat hex": "EC",
				"Unicode dec": "129171",
				"Unicode hex": "1F893"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "237",
				"Dingbat hex": "ED",
				"Unicode dec": "129172",
				"Unicode hex": "1F894"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "238",
				"Dingbat hex": "EE",
				"Unicode dec": "129174",
				"Unicode hex": "1F896"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "239",
				"Dingbat hex": "EF",
				"Unicode dec": "129173",
				"Unicode hex": "1F895"
			},
			{
				"Typeface name": "Wingdings 3",
				"Dingbat dec": "240",
				"Dingbat hex": "F0",
				"Unicode dec": "129175",
				"Unicode hex": "1F897"
			}
		];
	}), Wf = n1((e) => {
		"use strict";
		var i = e && e.__importDefault || function(x) {
			return x && x.__esModule ? x : { default: x };
		};
		Object.defineProperty(e, "__esModule", { value: !0 }), e.hex = e.dec = e.codePoint = void 0;
		var a = i(Af()), h = {}, o = String.fromCodePoint ? String.fromCodePoint : m;
		for (g = 0, f = a.default; g < f.length; g++) r = f[g], d = parseInt(r["Unicode dec"], 10), s = {
			codePoint: d,
			string: o(d)
		}, h[r["Typeface name"].toUpperCase() + "_" + r["Dingbat dec"]] = s;
		var r, d, s, g, f;
		function D(x, b) {
			return h[x.toUpperCase() + "_" + b];
		}
		e.codePoint = D;
		function T(x, b) {
			return D(x, parseInt(b, 10));
		}
		e.dec = T;
		function w(x, b) {
			return D(x, parseInt(b, 16));
		}
		e.hex = w;
		function m(x) {
			if (x <= 65535) return String.fromCharCode(x);
			var b = Math.floor((x - 65536) / 1024) + 55296, L = (x - 65536) % 1024 + 56320;
			return String.fromCharCode(b, L);
		}
	}), Bf = B0(Cf(), 1);
	function $c(e) {
		"@babel/helpers - typeof";
		return $c = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(i) {
			return typeof i;
		} : function(i) {
			return i && typeof Symbol == "function" && i.constructor === Symbol && i !== Symbol.prototype ? "symbol" : typeof i;
		}, $c(e);
	}
	var Pf = /^\s+/, Sf = /\s+$/;
	function Ge(e, i) {
		if (e = e || "", i = i || {}, e instanceof Ge) return e;
		if (!(this instanceof Ge)) return new Ge(e, i);
		var a = Ef(e);
		this._originalInput = e, this._r = a.r, this._g = a.g, this._b = a.b, this._a = a.a, this._roundA = Math.round(100 * this._a) / 100, this._format = i.format || a.format, this._gradientType = i.gradientType, this._r < 1 && (this._r = Math.round(this._r)), this._g < 1 && (this._g = Math.round(this._g)), this._b < 1 && (this._b = Math.round(this._b)), this._ok = a.ok;
	}
	Ge.prototype = {
		isDark: function() {
			return this.getBrightness() < 128;
		},
		isLight: function() {
			return !this.isDark();
		},
		isValid: function() {
			return this._ok;
		},
		getOriginalInput: function() {
			return this._originalInput;
		},
		getFormat: function() {
			return this._format;
		},
		getAlpha: function() {
			return this._a;
		},
		getBrightness: function() {
			var e = this.toRgb();
			return (e.r * 299 + e.g * 587 + e.b * 114) / 1e3;
		},
		getLuminance: function() {
			var e = this.toRgb(), i, a, h, o, r, d;
			return i = e.r / 255, a = e.g / 255, h = e.b / 255, i <= .03928 ? o = i / 12.92 : o = Math.pow((i + .055) / 1.055, 2.4), a <= .03928 ? r = a / 12.92 : r = Math.pow((a + .055) / 1.055, 2.4), h <= .03928 ? d = h / 12.92 : d = Math.pow((h + .055) / 1.055, 2.4), .2126 * o + .7152 * r + .0722 * d;
		},
		setAlpha: function(e) {
			return this._a = O0(e), this._roundA = Math.round(100 * this._a) / 100, this;
		},
		toHsv: function() {
			var e = S0(this._r, this._g, this._b);
			return {
				h: e.h * 360,
				s: e.s,
				v: e.v,
				a: this._a
			};
		},
		toHsvString: function() {
			var e = S0(this._r, this._g, this._b), i = Math.round(e.h * 360), a = Math.round(e.s * 100), h = Math.round(e.v * 100);
			return this._a == 1 ? "hsv(" + i + ", " + a + "%, " + h + "%)" : "hsva(" + i + ", " + a + "%, " + h + "%, " + this._roundA + ")";
		},
		toHsl: function() {
			var e = P0(this._r, this._g, this._b);
			return {
				h: e.h * 360,
				s: e.s,
				l: e.l,
				a: this._a
			};
		},
		toHslString: function() {
			var e = P0(this._r, this._g, this._b), i = Math.round(e.h * 360), a = Math.round(e.s * 100), h = Math.round(e.l * 100);
			return this._a == 1 ? "hsl(" + i + ", " + a + "%, " + h + "%)" : "hsla(" + i + ", " + a + "%, " + h + "%, " + this._roundA + ")";
		},
		toHex: function(e) {
			return E0(this._r, this._g, this._b, e);
		},
		toHexString: function(e) {
			return "#" + this.toHex(e);
		},
		toHex8: function(e) {
			return Gf(this._r, this._g, this._b, this._a, e);
		},
		toHex8String: function(e) {
			return "#" + this.toHex8(e);
		},
		toRgb: function() {
			return {
				r: Math.round(this._r),
				g: Math.round(this._g),
				b: Math.round(this._b),
				a: this._a
			};
		},
		toRgbString: function() {
			return this._a == 1 ? "rgb(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ")" : "rgba(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ", " + this._roundA + ")";
		},
		toPercentageRgb: function() {
			return {
				r: Math.round(vt(this._r, 255) * 100) + "%",
				g: Math.round(vt(this._g, 255) * 100) + "%",
				b: Math.round(vt(this._b, 255) * 100) + "%",
				a: this._a
			};
		},
		toPercentageRgbString: function() {
			return this._a == 1 ? "rgb(" + Math.round(vt(this._r, 255) * 100) + "%, " + Math.round(vt(this._g, 255) * 100) + "%, " + Math.round(vt(this._b, 255) * 100) + "%)" : "rgba(" + Math.round(vt(this._r, 255) * 100) + "%, " + Math.round(vt(this._g, 255) * 100) + "%, " + Math.round(vt(this._b, 255) * 100) + "%, " + this._roundA + ")";
		},
		toName: function() {
			return this._a === 0 ? "transparent" : this._a < 1 ? !1 : Zf[E0(this._r, this._g, this._b, !0)] || !1;
		},
		toFilter: function(e) {
			var i = "#" + z0(this._r, this._g, this._b, this._a), a = i, h = this._gradientType ? "GradientType = 1, " : "";
			if (e) {
				var o = Ge(e);
				a = "#" + z0(o._r, o._g, o._b, o._a);
			}
			return "progid:DXImageTransform.Microsoft.gradient(" + h + "startColorstr=" + i + ",endColorstr=" + a + ")";
		},
		toString: function(e) {
			var i = !!e;
			e = e || this._format;
			var a = !1, h = this._a < 1 && this._a >= 0;
			return !i && h && (e === "hex" || e === "hex6" || e === "hex3" || e === "hex4" || e === "hex8" || e === "name") ? e === "name" && this._a === 0 ? this.toName() : this.toRgbString() : (e === "rgb" && (a = this.toRgbString()), e === "prgb" && (a = this.toPercentageRgbString()), (e === "hex" || e === "hex6") && (a = this.toHexString()), e === "hex3" && (a = this.toHexString(!0)), e === "hex4" && (a = this.toHex8String(!0)), e === "hex8" && (a = this.toHex8String()), e === "name" && (a = this.toName()), e === "hsl" && (a = this.toHslString()), e === "hsv" && (a = this.toHsvString()), a || this.toHexString());
		},
		clone: function() {
			return Ge(this.toString());
		},
		_applyModification: function(e, i) {
			var a = e.apply(null, [this].concat([].slice.call(i)));
			return this._r = a._r, this._g = a._g, this._b = a._b, this.setAlpha(a._a), this;
		},
		lighten: function() {
			return this._applyModification(Hf, arguments);
		},
		brighten: function() {
			return this._applyModification($f, arguments);
		},
		darken: function() {
			return this._applyModification(Jf, arguments);
		},
		desaturate: function() {
			return this._applyModification(Nf, arguments);
		},
		saturate: function() {
			return this._applyModification(Rf, arguments);
		},
		greyscale: function() {
			return this._applyModification(Xf, arguments);
		},
		spin: function() {
			return this._applyModification(qf, arguments);
		},
		_applyCombination: function(e, i) {
			return e.apply(null, [this].concat([].slice.call(i)));
		},
		analogous: function() {
			return this._applyCombination(Yf, arguments);
		},
		complement: function() {
			return this._applyCombination(Vf, arguments);
		},
		monochromatic: function() {
			return this._applyCombination(Kf, arguments);
		},
		splitcomplement: function() {
			return this._applyCombination(Qf, arguments);
		},
		triad: function() {
			return this._applyCombination(j0, [3]);
		},
		tetrad: function() {
			return this._applyCombination(j0, [4]);
		}
	}, Ge.fromRatio = function(e, i) {
		if ($c(e) == "object") {
			var a = {};
			for (var h in e) e.hasOwnProperty(h) && (h === "a" ? a[h] = e[h] : a[h] = Ho(e[h]));
			e = a;
		}
		return Ge(e, i);
	};
	function Ef(e) {
		var i = {
			r: 0,
			g: 0,
			b: 0
		}, a = 1, h = null, o = null, r = null, d = !1, s = !1;
		return typeof e == "string" && (e = n2(e)), $c(e) == "object" && (Ji(e.r) && Ji(e.g) && Ji(e.b) ? (i = zf(e.r, e.g, e.b), d = !0, s = String(e.r).substr(-1) === "%" ? "prgb" : "rgb") : Ji(e.h) && Ji(e.s) && Ji(e.v) ? (h = Ho(e.s), o = Ho(e.v), i = Of(e.h, h, o), d = !0, s = "hsv") : Ji(e.h) && Ji(e.s) && Ji(e.l) && (h = Ho(e.s), r = Ho(e.l), i = jf(e.h, h, r), d = !0, s = "hsl"), e.hasOwnProperty("a") && (a = e.a)), a = O0(a), {
			ok: d,
			format: e.format || s,
			r: Math.min(255, Math.max(i.r, 0)),
			g: Math.min(255, Math.max(i.g, 0)),
			b: Math.min(255, Math.max(i.b, 0)),
			a
		};
	}
	function zf(e, i, a) {
		return {
			r: vt(e, 255) * 255,
			g: vt(i, 255) * 255,
			b: vt(a, 255) * 255
		};
	}
	function P0(e, i, a) {
		e = vt(e, 255), i = vt(i, 255), a = vt(a, 255);
		var h = Math.max(e, i, a), o = Math.min(e, i, a), r, d, s = (h + o) / 2;
		if (h == o) r = d = 0;
		else {
			var g = h - o;
			switch (d = s > .5 ? g / (2 - h - o) : g / (h + o), h) {
				case e:
					r = (i - a) / g + (i < a ? 6 : 0);
					break;
				case i:
					r = (a - e) / g + 2;
					break;
				case a:
					r = (e - i) / g + 4;
					break;
			}
			r /= 6;
		}
		return {
			h: r,
			s: d,
			l: s
		};
	}
	function jf(e, i, a) {
		var h, o, r;
		e = vt(e, 360), i = vt(i, 100), a = vt(a, 100);
		function d(f, D, T) {
			return T < 0 && (T += 1), T > 1 && (T -= 1), T < 1 / 6 ? f + (D - f) * 6 * T : T < 1 / 2 ? D : T < 2 / 3 ? f + (D - f) * (2 / 3 - T) * 6 : f;
		}
		if (i === 0) h = o = r = a;
		else {
			var s = a < .5 ? a * (1 + i) : a + i - a * i, g = 2 * a - s;
			h = d(g, s, e + 1 / 3), o = d(g, s, e), r = d(g, s, e - 1 / 3);
		}
		return {
			r: h * 255,
			g: o * 255,
			b: r * 255
		};
	}
	function S0(e, i, a) {
		e = vt(e, 255), i = vt(i, 255), a = vt(a, 255);
		var h = Math.max(e, i, a), o = Math.min(e, i, a), r, d, s = h, g = h - o;
		if (d = h === 0 ? 0 : g / h, h == o) r = 0;
		else {
			switch (h) {
				case e:
					r = (i - a) / g + (i < a ? 6 : 0);
					break;
				case i:
					r = (a - e) / g + 2;
					break;
				case a:
					r = (e - i) / g + 4;
					break;
			}
			r /= 6;
		}
		return {
			h: r,
			s: d,
			v: s
		};
	}
	function Of(e, i, a) {
		e = vt(e, 360) * 6, i = vt(i, 100), a = vt(a, 100);
		var h = Math.floor(e), o = e - h, r = a * (1 - i), d = a * (1 - o * i), s = a * (1 - (1 - o) * i), g = h % 6, f = [
			a,
			d,
			r,
			r,
			s,
			a
		][g], D = [
			s,
			a,
			a,
			d,
			r,
			r
		][g], T = [
			r,
			r,
			s,
			a,
			a,
			d
		][g];
		return {
			r: f * 255,
			g: D * 255,
			b: T * 255
		};
	}
	function E0(e, i, a, h) {
		var o = [
			ai(Math.round(e).toString(16)),
			ai(Math.round(i).toString(16)),
			ai(Math.round(a).toString(16))
		];
		return h && o[0].charAt(0) == o[0].charAt(1) && o[1].charAt(0) == o[1].charAt(1) && o[2].charAt(0) == o[2].charAt(1) ? o[0].charAt(0) + o[1].charAt(0) + o[2].charAt(0) : o.join("");
	}
	function Gf(e, i, a, h, o) {
		var r = [
			ai(Math.round(e).toString(16)),
			ai(Math.round(i).toString(16)),
			ai(Math.round(a).toString(16)),
			ai(G0(h))
		];
		return o && r[0].charAt(0) == r[0].charAt(1) && r[1].charAt(0) == r[1].charAt(1) && r[2].charAt(0) == r[2].charAt(1) && r[3].charAt(0) == r[3].charAt(1) ? r[0].charAt(0) + r[1].charAt(0) + r[2].charAt(0) + r[3].charAt(0) : r.join("");
	}
	function z0(e, i, a, h) {
		return [
			ai(G0(h)),
			ai(Math.round(e).toString(16)),
			ai(Math.round(i).toString(16)),
			ai(Math.round(a).toString(16))
		].join("");
	}
	Ge.equals = function(e, i) {
		return !e || !i ? !1 : Ge(e).toRgbString() == Ge(i).toRgbString();
	}, Ge.random = function() {
		return Ge.fromRatio({
			r: Math.random(),
			g: Math.random(),
			b: Math.random()
		});
	};
	function Nf(e, i) {
		i = i === 0 ? 0 : i || 10;
		var a = Ge(e).toHsl();
		return a.s -= i / 100, a.s = Jc(a.s), Ge(a);
	}
	function Rf(e, i) {
		i = i === 0 ? 0 : i || 10;
		var a = Ge(e).toHsl();
		return a.s += i / 100, a.s = Jc(a.s), Ge(a);
	}
	function Xf(e) {
		return Ge(e).desaturate(100);
	}
	function Hf(e, i) {
		i = i === 0 ? 0 : i || 10;
		var a = Ge(e).toHsl();
		return a.l += i / 100, a.l = Jc(a.l), Ge(a);
	}
	function $f(e, i) {
		i = i === 0 ? 0 : i || 10;
		var a = Ge(e).toRgb();
		return a.r = Math.max(0, Math.min(255, a.r - Math.round(255 * -(i / 100)))), a.g = Math.max(0, Math.min(255, a.g - Math.round(255 * -(i / 100)))), a.b = Math.max(0, Math.min(255, a.b - Math.round(255 * -(i / 100)))), Ge(a);
	}
	function Jf(e, i) {
		i = i === 0 ? 0 : i || 10;
		var a = Ge(e).toHsl();
		return a.l -= i / 100, a.l = Jc(a.l), Ge(a);
	}
	function qf(e, i) {
		var a = Ge(e).toHsl(), h = (a.h + i) % 360;
		return a.h = h < 0 ? 360 + h : h, Ge(a);
	}
	function Vf(e) {
		var i = Ge(e).toHsl();
		return i.h = (i.h + 180) % 360, Ge(i);
	}
	function j0(e, i) {
		if (isNaN(i) || i <= 0) throw new Error("Argument to polyad must be a positive number");
		for (var a = Ge(e).toHsl(), h = [Ge(e)], o = 360 / i, r = 1; r < i; r++) h.push(Ge({
			h: (a.h + r * o) % 360,
			s: a.s,
			l: a.l
		}));
		return h;
	}
	function Qf(e) {
		var i = Ge(e).toHsl(), a = i.h;
		return [
			Ge(e),
			Ge({
				h: (a + 72) % 360,
				s: i.s,
				l: i.l
			}),
			Ge({
				h: (a + 216) % 360,
				s: i.s,
				l: i.l
			})
		];
	}
	function Yf(e, i, a) {
		i = i || 6, a = a || 30;
		var h = Ge(e).toHsl(), o = 360 / a, r = [Ge(e)];
		for (h.h = (h.h - (o * i >> 1) + 720) % 360; --i;) h.h = (h.h + o) % 360, r.push(Ge(h));
		return r;
	}
	function Kf(e, i) {
		i = i || 6;
		for (var a = Ge(e).toHsv(), h = a.h, o = a.s, r = a.v, d = [], s = 1 / i; i--;) d.push(Ge({
			h,
			s: o,
			v: r
		})), r = (r + s) % 1;
		return d;
	}
	Ge.mix = function(e, i, a) {
		a = a === 0 ? 0 : a || 50;
		var h = Ge(e).toRgb(), o = Ge(i).toRgb(), r = a / 100;
		return Ge({
			r: (o.r - h.r) * r + h.r,
			g: (o.g - h.g) * r + h.g,
			b: (o.b - h.b) * r + h.b,
			a: (o.a - h.a) * r + h.a
		});
	}, Ge.readability = function(e, i) {
		var a = Ge(e), h = Ge(i);
		return (Math.max(a.getLuminance(), h.getLuminance()) + .05) / (Math.min(a.getLuminance(), h.getLuminance()) + .05);
	}, Ge.isReadable = function(e, i, a) {
		var h = Ge.readability(e, i), o, r;
		switch (r = !1, o = i2(a), o.level + o.size) {
			case "AAsmall":
			case "AAAlarge":
				r = h >= 4.5;
				break;
			case "AAlarge":
				r = h >= 3;
				break;
			case "AAAsmall":
				r = h >= 7;
				break;
		}
		return r;
	}, Ge.mostReadable = function(e, i, a) {
		var h = null, o = 0, r, d, s, g;
		a = a || {}, d = a.includeFallbackColors, s = a.level, g = a.size;
		for (var f = 0; f < i.length; f++) r = Ge.readability(e, i[f]), r > o && (o = r, h = Ge(i[f]));
		return Ge.isReadable(e, h, {
			level: s,
			size: g
		}) || !d ? h : (a.includeFallbackColors = !1, Ge.mostReadable(e, ["#fff", "#000"], a));
	};
	var i1 = Ge.names = {
		aliceblue: "f0f8ff",
		antiquewhite: "faebd7",
		aqua: "0ff",
		aquamarine: "7fffd4",
		azure: "f0ffff",
		beige: "f5f5dc",
		bisque: "ffe4c4",
		black: "000",
		blanchedalmond: "ffebcd",
		blue: "00f",
		blueviolet: "8a2be2",
		brown: "a52a2a",
		burlywood: "deb887",
		burntsienna: "ea7e5d",
		cadetblue: "5f9ea0",
		chartreuse: "7fff00",
		chocolate: "d2691e",
		coral: "ff7f50",
		cornflowerblue: "6495ed",
		cornsilk: "fff8dc",
		crimson: "dc143c",
		cyan: "0ff",
		darkblue: "00008b",
		darkcyan: "008b8b",
		darkgoldenrod: "b8860b",
		darkgray: "a9a9a9",
		darkgreen: "006400",
		darkgrey: "a9a9a9",
		darkkhaki: "bdb76b",
		darkmagenta: "8b008b",
		darkolivegreen: "556b2f",
		darkorange: "ff8c00",
		darkorchid: "9932cc",
		darkred: "8b0000",
		darksalmon: "e9967a",
		darkseagreen: "8fbc8f",
		darkslateblue: "483d8b",
		darkslategray: "2f4f4f",
		darkslategrey: "2f4f4f",
		darkturquoise: "00ced1",
		darkviolet: "9400d3",
		deeppink: "ff1493",
		deepskyblue: "00bfff",
		dimgray: "696969",
		dimgrey: "696969",
		dodgerblue: "1e90ff",
		firebrick: "b22222",
		floralwhite: "fffaf0",
		forestgreen: "228b22",
		fuchsia: "f0f",
		gainsboro: "dcdcdc",
		ghostwhite: "f8f8ff",
		gold: "ffd700",
		goldenrod: "daa520",
		gray: "808080",
		green: "008000",
		greenyellow: "adff2f",
		grey: "808080",
		honeydew: "f0fff0",
		hotpink: "ff69b4",
		indianred: "cd5c5c",
		indigo: "4b0082",
		ivory: "fffff0",
		khaki: "f0e68c",
		lavender: "e6e6fa",
		lavenderblush: "fff0f5",
		lawngreen: "7cfc00",
		lemonchiffon: "fffacd",
		lightblue: "add8e6",
		lightcoral: "f08080",
		lightcyan: "e0ffff",
		lightgoldenrodyellow: "fafad2",
		lightgray: "d3d3d3",
		lightgreen: "90ee90",
		lightgrey: "d3d3d3",
		lightpink: "ffb6c1",
		lightsalmon: "ffa07a",
		lightseagreen: "20b2aa",
		lightskyblue: "87cefa",
		lightslategray: "789",
		lightslategrey: "789",
		lightsteelblue: "b0c4de",
		lightyellow: "ffffe0",
		lime: "0f0",
		limegreen: "32cd32",
		linen: "faf0e6",
		magenta: "f0f",
		maroon: "800000",
		mediumaquamarine: "66cdaa",
		mediumblue: "0000cd",
		mediumorchid: "ba55d3",
		mediumpurple: "9370db",
		mediumseagreen: "3cb371",
		mediumslateblue: "7b68ee",
		mediumspringgreen: "00fa9a",
		mediumturquoise: "48d1cc",
		mediumvioletred: "c71585",
		midnightblue: "191970",
		mintcream: "f5fffa",
		mistyrose: "ffe4e1",
		moccasin: "ffe4b5",
		navajowhite: "ffdead",
		navy: "000080",
		oldlace: "fdf5e6",
		olive: "808000",
		olivedrab: "6b8e23",
		orange: "ffa500",
		orangered: "ff4500",
		orchid: "da70d6",
		palegoldenrod: "eee8aa",
		palegreen: "98fb98",
		paleturquoise: "afeeee",
		palevioletred: "db7093",
		papayawhip: "ffefd5",
		peachpuff: "ffdab9",
		peru: "cd853f",
		pink: "ffc0cb",
		plum: "dda0dd",
		powderblue: "b0e0e6",
		purple: "800080",
		rebeccapurple: "663399",
		red: "f00",
		rosybrown: "bc8f8f",
		royalblue: "4169e1",
		saddlebrown: "8b4513",
		salmon: "fa8072",
		sandybrown: "f4a460",
		seagreen: "2e8b57",
		seashell: "fff5ee",
		sienna: "a0522d",
		silver: "c0c0c0",
		skyblue: "87ceeb",
		slateblue: "6a5acd",
		slategray: "708090",
		slategrey: "708090",
		snow: "fffafa",
		springgreen: "00ff7f",
		steelblue: "4682b4",
		tan: "d2b48c",
		teal: "008080",
		thistle: "d8bfd8",
		tomato: "ff6347",
		turquoise: "40e0d0",
		violet: "ee82ee",
		wheat: "f5deb3",
		white: "fff",
		whitesmoke: "f5f5f5",
		yellow: "ff0",
		yellowgreen: "9acd32"
	}, Zf = Ge.hexNames = e2(i1);
	function e2(e) {
		var i = {};
		for (var a in e) e.hasOwnProperty(a) && (i[e[a]] = a);
		return i;
	}
	function O0(e) {
		return e = parseFloat(e), (isNaN(e) || e < 0 || e > 1) && (e = 1), e;
	}
	function vt(e, i) {
		a2(e) && (e = "100%");
		var a = t2(e);
		return e = Math.min(i, Math.max(0, parseFloat(e))), a && (e = parseInt(e * i, 10) / 100), Math.abs(e - i) < 1e-6 ? 1 : e % i / parseFloat(i);
	}
	function Jc(e) {
		return Math.min(1, Math.max(0, e));
	}
	function En(e) {
		return parseInt(e, 16);
	}
	function a2(e) {
		return typeof e == "string" && e.indexOf(".") != -1 && parseFloat(e) === 1;
	}
	function t2(e) {
		return typeof e == "string" && e.indexOf("%") != -1;
	}
	function ai(e) {
		return e.length == 1 ? "0" + e : "" + e;
	}
	function Ho(e) {
		return e <= 1 && (e = e * 100 + "%"), e;
	}
	function G0(e) {
		return Math.round(parseFloat(e) * 255).toString(16);
	}
	function N0(e) {
		return En(e) / 255;
	}
	var ti = (function() {
		var e = "(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)", i = "[\\s|\\(]+(" + e + ")[,|\\s]+(" + e + ")[,|\\s]+(" + e + ")\\s*\\)?", a = "[\\s|\\(]+(" + e + ")[,|\\s]+(" + e + ")[,|\\s]+(" + e + ")[,|\\s]+(" + e + ")\\s*\\)?";
		return {
			CSS_UNIT: new RegExp(e),
			rgb: new RegExp("rgb" + i),
			rgba: new RegExp("rgba" + a),
			hsl: new RegExp("hsl" + i),
			hsla: new RegExp("hsla" + a),
			hsv: new RegExp("hsv" + i),
			hsva: new RegExp("hsva" + a),
			hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
			hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
			hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
			hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
		};
	})();
	function Ji(e) {
		return !!ti.CSS_UNIT.exec(e);
	}
	function n2(e) {
		e = e.replace(Pf, "").replace(Sf, "").toLowerCase();
		var i = !1;
		if (i1[e]) e = i1[e], i = !0;
		else if (e == "transparent") return {
			r: 0,
			g: 0,
			b: 0,
			a: 0,
			format: "name"
		};
		var a;
		return (a = ti.rgb.exec(e)) ? {
			r: a[1],
			g: a[2],
			b: a[3]
		} : (a = ti.rgba.exec(e)) ? {
			r: a[1],
			g: a[2],
			b: a[3],
			a: a[4]
		} : (a = ti.hsl.exec(e)) ? {
			h: a[1],
			s: a[2],
			l: a[3]
		} : (a = ti.hsla.exec(e)) ? {
			h: a[1],
			s: a[2],
			l: a[3],
			a: a[4]
		} : (a = ti.hsv.exec(e)) ? {
			h: a[1],
			s: a[2],
			v: a[3]
		} : (a = ti.hsva.exec(e)) ? {
			h: a[1],
			s: a[2],
			v: a[3],
			a: a[4]
		} : (a = ti.hex8.exec(e)) ? {
			r: En(a[1]),
			g: En(a[2]),
			b: En(a[3]),
			a: N0(a[4]),
			format: i ? "name" : "hex8"
		} : (a = ti.hex6.exec(e)) ? {
			r: En(a[1]),
			g: En(a[2]),
			b: En(a[3]),
			format: i ? "name" : "hex"
		} : (a = ti.hex4.exec(e)) ? {
			r: En(a[1] + "" + a[1]),
			g: En(a[2] + "" + a[2]),
			b: En(a[3] + "" + a[3]),
			a: N0(a[4] + "" + a[4]),
			format: i ? "name" : "hex8"
		} : (a = ti.hex3.exec(e)) ? {
			r: En(a[1] + "" + a[1]),
			g: En(a[2] + "" + a[2]),
			b: En(a[3] + "" + a[3]),
			format: i ? "name" : "hex"
		} : !1;
	}
	function i2(e) {
		var i, a;
		return e = e || {
			level: "AA",
			size: "small"
		}, i = (e.level || "AA").toUpperCase(), a = (e.size || "small").toLowerCase(), i !== "AA" && i !== "AAA" && (i = "AA"), a !== "small" && a !== "large" && (a = "small"), {
			level: i,
			size: a
		};
	}
	function r2(e, i) {
		"txml";
		i = i || {};
		var a = i.pos || 0, h = !!i.keepComments, o = !!i.keepWhitespace, r = "<", d = 60, s = ">", g = 62, f = 45, D = 47, T = 33, w = 39, m = 34, x = 91, b = 93;
		function L(N) {
			for (var ke = []; e[a];) if (e.charCodeAt(a) == d) {
				if (e.charCodeAt(a + 1) === D) {
					var ve = a + 2;
					if (a = e.indexOf(s, a), e.substring(ve, a).indexOf(N) == -1) {
						var S = e.substring(0, a).split(`
`);
						throw new Error(`Unexpected close tag
Line: ` + (S.length - 1) + `
Column: ` + (S[S.length - 1].length + 1) + `
Char: ` + e[a]);
					}
					return a + 1 && (a += 1), ke;
				} else if (e.charCodeAt(a + 1) === T) {
					if (e.charCodeAt(a + 2) == f) {
						let n = a;
						for (; a !== -1 && !(e.charCodeAt(a) === g && e.charCodeAt(a - 1) == f && e.charCodeAt(a - 2) == f && a != -1);) a = e.indexOf(s, a + 1);
						a === -1 && (a = e.length), h && ke.push(e.substring(n, a + 1));
					} else if (e.charCodeAt(a + 2) === x && e.charCodeAt(a + 8) === x && e.substr(a + 3, 5).toLowerCase() === "cdata") {
						var K = e.indexOf("]]>", a);
						K == -1 ? (ke.push(e.substr(a + 9)), a = e.length) : (ke.push(e.substring(a + 9, K)), a = K + 3);
						continue;
					} else {
						let n = a + 1;
						a += 2;
						for (var y = !1; (e.charCodeAt(a) !== g || y === !0) && e[a];) e.charCodeAt(a) === x ? y = !0 : y === !0 && e.charCodeAt(a) === b && (y = !1), a++;
						ke.push(e.substring(n, a));
					}
					a++;
					continue;
				}
				var X = J();
				ke.push(X), X.tagName[0] === "?" && (ke.push(...X.children), X.children = []);
			} else {
				var le = v();
				if (o) le.length > 0 && ke.push(le);
				else {
					var t = le.trim();
					t.length > 0 && ke.push(t);
				}
				a++;
			}
			return ke;
		}
		function v() {
			var N = a;
			return a = e.indexOf(r, a) - 1, a === -2 && (a = e.length), e.slice(N, a + 1);
		}
		var p = `\r
	>/= `;
		function l() {
			for (var N = a; p.indexOf(e[a]) === -1 && e[a];) a++;
			return e.slice(N, a);
		}
		var M = i.noChildNodes || [
			"img",
			"br",
			"input",
			"meta",
			"link",
			"hr"
		];
		function J() {
			a++;
			let N = l(), ke = {}, ve = [];
			for (; e.charCodeAt(a) !== g && e[a];) {
				var S = e.charCodeAt(a);
				if (S > 64 && S < 91 || S > 96 && S < 123) {
					for (var K = l(), y = e.charCodeAt(a); y && y !== w && y !== m && !(y > 64 && y < 91 || y > 96 && y < 123) && y !== g;) a++, y = e.charCodeAt(a);
					if (y === w || y === m) {
						var X = se();
						if (a === -1) return {
							tagName: N,
							attributes: ke,
							children: ve
						};
					} else X = null, a--;
					ke[K] = X;
				}
				a++;
			}
			if (e.charCodeAt(a - 1) !== D) if (N == "script") {
				var le = a + 1;
				a = e.indexOf("<\/script>", a), ve = [e.slice(le, a)], a += 9;
			} else if (N == "style") {
				var le = a + 1;
				a = e.indexOf("</style>", a), ve = [e.slice(le, a)], a += 8;
			} else M.indexOf(N) === -1 ? (a++, ve = L(N)) : a++;
			else a++;
			return {
				tagName: N,
				attributes: ke,
				children: ve
			};
		}
		function se() {
			var N = e[a], ke = a + 1;
			return a = e.indexOf(N, ke), e.slice(ke, a);
		}
		function ne() {
			var N = new RegExp("\\s" + i.attrName + `\\s*=['"]` + i.attrValue + `['"]`).exec(e);
			return N ? N.index : -1;
		}
		var ce = null;
		if (i.attrValue !== void 0) {
			i.attrName = i.attrName || "id";
			for (var ce = []; (a = ne()) !== -1;) a = e.lastIndexOf("<", a), a !== -1 && ce.push(J()), e = e.substr(a), a = 0;
		} else i.parseNode ? ce = J() : ce = L("");
		return i.filter && (ce = filter(ce, i.filter)), i.simplify ? R0(Array.isArray(ce) ? ce : [ce]) : (i.setPos && (ce.pos = a), ce);
	}
	var d2 = 1;
	function R0(e) {
		let i = {};
		if (!e || !e.length) return {};
		if (e.length === 1 && typeof e[0] == "string") return e[0];
		e.forEach(function(h) {
			if (typeof h != "object") return;
			i[h.tagName] || (i[h.tagName] = []);
			let o = R0(h.children);
			i[h.tagName].push(o), typeof o != "string" && (Object.keys(h.attributes).length && (o.attrs = h.attributes), o.attrs || (o.attrs = {}), o.attrs.order = d2++);
		});
		for (var a in i) i[a].length == 1 && (i[a] = i[a][0]);
		return i;
	}
	var o2 = B0(Wf(), 1), X0 = {
		MsgQueue: [],
		isDone: !1
	}, H0 = !1, $0 = null, vr = 0, $o, J0 = [
		"he-IL",
		"ar-AE",
		"ar-SA",
		"dv-MV",
		"fa-IR",
		"ur-PK"
	], q0 = 96, c2 = 914400, s2 = 72, k = q0 / c2, h2 = (e, i = 150) => e >= 9525 ? e * k : i, qc = q0 / s2, ni = (e) => e == null ? [] : Array.isArray(e) ? e : [e], mt = (e, i = 0) => {
		let a = typeof e == "number" ? e : parseFloat(e);
		return Number.isFinite(a) ? a : i;
	}, g2 = 16, r1 = {
		cx: 9144e3,
		cy: 6858e3
	}, l2 = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/", f2 = "http://schemas.microsoft.com/office/2007/relationships/";
	function Vc(e) {
		let i = [];
		return String(e || "").split("/").forEach(function(a) {
			if (!(a === "" || a === ".")) {
				if (a === "..") {
					i.pop();
					return;
				}
				i.push(a);
			}
		}), i.join("/");
	}
	function d1(e) {
		let i = Vc(e), a = i.lastIndexOf("/");
		return a === -1 ? "" : i.slice(0, a);
	}
	function fd(e, i) {
		return i ? /^[a-z][a-z0-9+.-]*:/i.test(i) || i.charAt(0) === "#" ? i : i.charAt(0) === "/" ? Vc(i.slice(1)) : Vc((d1(e) ? d1(e) + "/" : "") + i) : "";
	}
	function pd(e) {
		let i = d1(e), a = Vc(e).split("/").pop();
		return (i ? i + "/_rels/" : "_rels/") + a + ".rels";
	}
	function bd(e) {
		return ni(c(e, ["Relationships", "Relationship"]));
	}
	function Jo(e) {
		return String(e || "").replace(l2, "").replace(f2, "");
	}
	function qo(e, i, a) {
		let h = i && i.attrs ? i.attrs : {};
		h.Id && (e[h.Id] = {
			type: Jo(h.Type),
			target: fd(a, h.Target)
		});
	}
	function V0() {
		return {
			idTable: {},
			idxTable: {},
			typeTable: {}
		};
	}
	function Q0(e) {
		if (!e) return V0();
		try {
			return x2(e);
		} catch (i) {
			return console.warn("Unable to index PPTX layout/master nodes", i), V0();
		}
	}
	async function p2(e, i) {
		try {
			let a = await Wt(e, "ppt/presentation.xml"), h = await Wt(e, pd("ppt/presentation.xml")), o = {};
			bd(h).forEach(function(s) {
				let g = s && s.attrs ? s.attrs : {};
				g.Id && Jo(g.Type) === "slide" && (o[g.Id] = fd("ppt/presentation.xml", g.Target));
			});
			let r = ni(c(a, [
				"p:presentation",
				"p:sldIdLst",
				"p:sldId"
			])).map(function(s) {
				return o[c(s, ["attrs", "r:id"])];
			}).filter(function(s) {
				return s && i.indexOf(s) !== -1;
			});
			if (!r.length) return i;
			let d = new Set(r);
			return r.concat(i.filter(function(s) {
				return !d.has(s);
			}));
		} catch (a) {
			return console.warn("Unable to resolve PPTX slide order", a), i;
		}
	}
	var Y0 = 0, K0 = 0, o1 = !0, Mt = {}, Z0 = {}, Qc = {};
	console.log(Qc);
	var Yc = {
		set processFullTheme(e) {
			o1 = e;
		},
		set settings(e) {
			Qc = e;
		},
		set tableStyles(e) {
			Z0 = e;
		},
		set IE11(e) {
			H0 = e;
		}
	};
	async function Wt(e, i, a = !1) {
		try {
			let h = await e.file(i).async("text");
			a && $o <= 12 && (h = h.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1"));
			let o = r2(h, { simplify: !0 });
			return o["?xml"] && delete o["?xml"], o;
		} catch {
			return null;
		}
	}
	async function b2(e) {
		let i = ni(c(await Wt(e, "[Content_Types].xml"), ["Types", "Override"])), a = [], h = [];
		for (let o of i) {
			let r = o.attrs || {}, d = String(r.PartName || "").replace(/^\/+/, "");
			switch (r.ContentType) {
				case "application/vnd.openxmlformats-officedocument.presentationml.slide+xml":
					a.push(d);
					break;
				case "application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml":
					h.push(d);
					break;
				default:
			}
		}
		return {
			slides: await p2(e, a),
			slideLayouts: h
		};
	}
	async function u2(e) {
		let i = await Wt(e, "docProps/app.xml");
		$o = parseInt(c(i, ["Properties", "AppVersion"])), Number.isFinite($o) || ($o = g2), console.log("create by Office PowerPoint app verssion: ", $o);
		let a = await Wt(e, "ppt/presentation.xml"), h = c(a, [
			"p:presentation",
			"p:sldSz",
			"attrs"
		]) || r1, o = mt(h.cx, r1.cx), r = mt(h.cy, r1.cy), d = h.type;
		console.log("Presentation size type: ", d), $0 = c(a, ["p:presentation", "p:defaultTextStyle"]) || {};
		let s = Qc.incSlide || {};
		return Y0 = o * k + mt(s.width, 0) | 0, K0 = r * k + mt(s.height, 0) | 0, {
			width: Y0,
			height: K0
		};
	}
	async function m2(e, i, a, h) {
		self.postMessage({
			type: "INFO",
			data: "Processing slide" + (a + 1)
		});
		let o = await Wt(e, pd(i)), r = "", d = "", s = {};
		for (let _ of bd(o)) {
			let H = _.attrs || {}, Le = Jo(H.Type);
			Le === "slideLayout" ? r = fd(i, H.Target) : Le === "diagramDrawing" && (d = fd(i, H.Target)), qo(s, _, i);
		}
		let g = r ? await Wt(e, r) : null, f = Q0(g), D = c(g, [
			"p:sldLayout",
			"p:clrMapOvr",
			"a:overrideClrMapping"
		]);
		D !== void 0 && D.attrs;
		let T = r ? pd(r) : "", w = T ? await Wt(e, T) : null, m = "", x = {};
		for (let _ of bd(w)) {
			let H = _.attrs || {};
			Jo(H.Type) === "slideMaster" ? m = fd(r, H.Target) : qo(x, _, r);
		}
		let b = m ? await Wt(e, m) : null, L = c(b, ["p:sldMaster", "p:txStyles"]), v = Q0(b), p = m ? pd(m) : "", l = p ? await Wt(e, p) : null, M = "", J = {};
		for (let _ of bd(l)) {
			let H = _.attrs || {};
			Jo(H.Type) === "theme" ? M = fd(m, H.Target) : qo(J, _, m);
		}
		var se = {}, ne = null;
		if (M) {
			var ce = pd(M);
			ne = await Wt(e, M);
			var N = await Wt(e, ce);
			for (let _ of bd(N)) qo(se, _, M);
		}
		var ke = {}, ve = {};
		if (d) {
			var S = pd(d);
			if (ve = await Wt(e, d), ve != null && ve != "") {
				var K = JSON.stringify(ve);
				K = K.replace(/dsp:/g, "p:"), ve = JSON.parse(K);
			}
			var y = await Wt(e, S);
			if (y !== null) for (let _ of bd(y)) qo(ke, _, d);
		}
		var X = await Wt(e, i, !0), le = c(X, [
			"p:sld",
			"p:cSld",
			"p:spTree"
		]) || {}, t = {
			zip: e,
			slideLayoutContent: g,
			slideLayoutTables: f,
			slideMasterContent: b,
			slideMasterTables: v,
			slideContent: X,
			slideResObj: s,
			slideMasterTextStyles: L,
			layoutResObj: x,
			masterResObj: J,
			themeContent: ne,
			themeResObj: se,
			digramFileContent: ve,
			diagramResObj: ke,
			defaultTextStyle: $0
		}, n = "";
		o1 === !0 && (n = await ip(t, h, a));
		var pe = "";
		o1 == "colorsAndImageOnly" && (pe = await gg(t, a));
		var Be = "<div class='slide' style='width:" + h.width + "px; height:" + h.height + "px;" + pe + "'>";
		Be += n;
		for (let _ in le) if (le[_].constructor === Array) for (var W = 0; W < le[_].length; W++) Be += await Ur(_, le[_][W], le, t, "slide");
		else Be += await Ur(_, le[_], le, t, "slide");
		return Be + "</div>";
	}
	function x2(e) {
		let i = e[Object.keys(e)[0]]["p:cSld"]["p:spTree"], a = {}, h = {}, o = {}, r, d, s, g;
		for (let f in i) {
			if (f === "p:nvGrpSpPr" || f === "p:grpSpPr") continue;
			let D = i[f];
			if (D.constructor === Array) for (let T = 0; T < D.length; T++) g = D[T]["p:nvSpPr"], s = c(g, [
				"p:cNvPr",
				"attrs",
				"id"
			]), d = c(g, [
				"p:nvPr",
				"p:ph",
				"attrs",
				"idx"
			]), r = c(g, [
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]), s !== void 0 && (a[s] = D[T]), d !== void 0 && (h[d] = D[T]), r !== void 0 && (o[r] = D[T]);
			else g = D["p:nvSpPr"], s = c(g, [
				"p:cNvPr",
				"attrs",
				"id"
			]), d = c(g, [
				"p:nvPr",
				"p:ph",
				"attrs",
				"idx"
			]), r = c(g, [
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]), s !== void 0 && (a[s] = D), d !== void 0 && (h[d] = D), r !== void 0 && (o[r] = D);
		}
		return {
			idTable: a,
			idxTable: h,
			typeTable: o
		};
	}
	async function Ur(e, i, a, h, o, r, d) {
		var s = "";
		switch (e) {
			case "p:sp":
				s = await rg(i, a, h, o, r, d);
				break;
			case "p:cxnSp":
				s = await I2(i, a, h, o, r, d);
				break;
			case "p:pic":
				s = await B2(i, h, o, r, d);
				break;
			case "p:graphicFrame":
				s = await P2(i, h, o, r, d);
				break;
			case "p:grpSp":
				s = await s1(i, h, o, d);
				break;
			case "mc:AlternateContent":
				s = await s1(c(i, ["mc:Fallback"]), h, o, d);
				break;
			default:
		}
		return s;
	}
	function eg(e, i = 0) {
		var a = parseInt(e);
		return Number.isFinite(a) ? a * k : i;
	}
	function qi(e, i = 0) {
		var a = parseFloat(e);
		return Number.isFinite(a) ? a : i;
	}
	function ud(e, i, a) {
		var h = qi(e, NaN);
		if (!Number.isFinite(h)) return NaN;
		if (a === void 0) return eg(h);
		var o = i === "y" ? a.childOffsetY : a.childOffsetX, r = i === "y" ? a.scaleY : a.scaleX;
		return (h - o) * r;
	}
	function Vi(e, i, a) {
		var h = qi(e, NaN);
		return Number.isFinite(h) ? a === void 0 ? h2(h) : h * (i === "y" ? a.scaleY : a.scaleX) : NaN;
	}
	function ag(e, i, a, h) {
		var o = qi(e, NaN);
		return Number.isFinite(o) ? a === void 0 ? eg(o) : o * (i === "y" ? a.scaleY : a.scaleX) : h;
	}
	function tg(e) {
		return e === !0 || e === "1" || e === "true";
	}
	function y2(e, i) {
		var a = c(e, ["a:off", "attrs"]) || {}, h = c(e, ["a:ext", "attrs"]) || {}, o = c(e, ["a:chOff", "attrs"]) || {}, r = c(e, ["a:chExt", "attrs"]) || {}, d = Vi(h.cx, "x", i), s = Vi(h.cy, "y", i), g = qi(r.cx, NaN), f = qi(r.cy, NaN);
		return (!Number.isFinite(g) || g === 0) && (g = qi(h.cx, d || 1)), (!Number.isFinite(f) || f === 0) && (f = qi(h.cy, s || 1)), {
			x: ud(a.x, "x", i),
			y: ud(a.y, "y", i),
			width: d,
			height: s,
			childOffsetX: qi(o.x, 0),
			childOffsetY: qi(o.y, 0),
			childWidth: g,
			childHeight: f,
			scaleX: g ? d / g : 1,
			scaleY: f ? s / f : 1,
			rotate: Dd(c(e, ["attrs", "rot"])),
			flipH: tg(c(e, ["attrs", "flipH"])),
			flipV: tg(c(e, ["attrs", "flipV"]))
		};
	}
	function D2(e) {
		if (e === void 0) return "";
		var i = [];
		return e.rotate && i.push("rotate(" + e.rotate + "deg)"), (e.flipH || e.flipV) && i.push("scale(" + (e.flipH ? -1 : 1) + "," + (e.flipV ? -1 : 1) + ")"), i.length ? "transform:" + i.join(" ") + ";transform-origin:center;" : "";
	}
	function Nt(e) {
		return Math.round(e * 1e3) / 1e3;
	}
	function c1(e) {
		return [
			e & 255,
			e >> 8 & 255,
			e >> 16 & 255
		].map(function(i) {
			return ("0" + i.toString(16)).slice(-2);
		}).join("");
	}
	function v2(e) {
		switch (e) {
			case 2147483648: return {
				kind: "brush",
				style: 0,
				color: "ffffff"
			};
			case 2147483652: return {
				kind: "brush",
				style: 0,
				color: "000000"
			};
			case 2147483653: return {
				kind: "brush",
				style: 1,
				color: "none"
			};
			case 2147483654: return {
				kind: "pen",
				style: 0,
				width: 1,
				color: "ffffff"
			};
			case 2147483655: return {
				kind: "pen",
				style: 0,
				width: 1,
				color: "000000"
			};
			case 2147483656: return {
				kind: "pen",
				style: 5,
				width: 0,
				color: "none"
			};
			default: return;
		}
	}
	function U2(e) {
		return {
			windowOrgX: e.windowOrgX,
			windowOrgY: e.windowOrgY,
			viewportOrgX: e.viewportOrgX,
			viewportOrgY: e.viewportOrgY,
			windowExtX: e.windowExtX,
			windowExtY: e.windowExtY,
			viewportExtX: e.viewportExtX,
			viewportExtY: e.viewportExtY,
			polyFillMode: e.polyFillMode,
			currentBrush: e.currentBrush,
			currentPen: e.currentPen,
			currentX: e.currentX,
			currentY: e.currentY,
			inPath: e.inPath,
			pathD: e.pathD,
			lastPathD: e.lastPathD,
			clipId: e.clipId
		};
	}
	function Qi(e, i, a) {
		var h = e.windowExtX ? e.viewportExtX / e.windowExtX : 1, o = e.windowExtY ? e.viewportExtY / e.windowExtY : 1;
		return {
			x: e.viewportOrgX + (i - e.windowOrgX) * h,
			y: e.viewportOrgY + (a - e.windowOrgY) * o
		};
	}
	function ng(e, i, a) {
		var h = Qi(e, i, a);
		e.currentX = i, e.currentY = a;
		var o = "M" + Nt(h.x) + " " + Nt(h.y);
		return e.inPath && (e.pathD += (e.pathD ? " " : "") + o), o;
	}
	function L2(e, i, a) {
		var h = e.currentX, o = e.currentY, r = Qi(e, i, a);
		e.currentX = i, e.currentY = a;
		var d = "L" + Nt(r.x) + " " + Nt(r.y);
		return e.inPath && (e.pathD || ng(e, h, o), e.pathD += " " + d), d;
	}
	function k2(e, i, a, h) {
		var o = e.currentX, r = e.currentY, d = Qi(e, i.x, i.y), s = Qi(e, a.x, a.y), g = Qi(e, h.x, h.y);
		e.currentX = h.x, e.currentY = h.y;
		var f = "C" + Nt(d.x) + " " + Nt(d.y) + " " + Nt(s.x) + " " + Nt(s.y) + " " + Nt(g.x) + " " + Nt(g.y);
		if (e.inPath) {
			if (!e.pathD) {
				var D = Qi(e, o, r);
				e.pathD = "M" + Nt(D.x) + " " + Nt(D.y);
			}
			e.pathD += " " + f;
		}
		return f;
	}
	function T2(e, i) {
		var a = i && i.width ? i.width : 1, h = e.windowExtX ? Math.abs(e.viewportExtX / e.windowExtX) : 1, o = e.windowExtY ? Math.abs(e.viewportExtY / e.windowExtY) : 1;
		return Math.max(.5, a * ((h + o) / 2));
	}
	function w2(e, i) {
		var a = e.currentBrush || {
			style: 1,
			color: "none"
		}, h = e.currentPen || {
			style: 0,
			width: 1,
			color: "000000"
		}, o = h.style & 15, r = "none", d = "none", s = [];
		return i != "stroke" && a.style !== 1 && (r = "#" + a.color), i != "fillOnly" && o !== 5 && (d = "#" + h.color), s.push("fill=\"" + r + "\""), s.push("stroke=\"" + d + "\""), d != "none" && s.push("stroke-width=\"" + Nt(T2(e, h)) + "\""), s.push("fill-rule=\"" + (e.polyFillMode == 1 ? "evenodd" : "nonzero") + "\""), e.clipId && s.push("clip-path=\"url(#" + e.clipId + ")\""), s.join(" ");
	}
	function _2(e) {
		return typeof TextEncoder != "undefined" ? u1(new TextEncoder().encode(e).buffer) : btoa(unescape(encodeURIComponent(e)));
	}
	function M2(e) {
		try {
			let W = function(Le) {
				return {
					x: i.getInt16(Le, !0),
					y: i.getInt16(Le + 2, !0)
				};
			}, _ = function(Le, Te) {
				Le && f.push("<path d=\"" + Le + "\" " + w2(d, Te) + "/>");
			}, H = function(Le, Te, Ua) {
				for (var ya = i.getUint32(Le + 24, !0), pa = i.getUint32(Le + 28, !0), na = Le + 32, U = na + ya * 4, ga = "", Ba = 0; Ba < ya; Ba++) {
					var Ya = i.getUint32(na + Ba * 4, !0);
					if (Ya !== 0) {
						for (var u = 0; u < Ya && U + 4 <= Le + x; u++) {
							var De = W(U);
							U += 4;
							var de = Qi(d, De.x, De.y);
							ga += (ga ? " " : "") + (u === 0 ? "M" : "L") + Nt(de.x) + " " + Nt(de.y), d.currentX = De.x, d.currentY = De.y;
						}
						Te && (ga += " Z");
					}
				}
				pa > 0 && _(ga, Ua ? "stroke" : "fillStroke");
			};
			var i = new DataView(e);
			if (i.byteLength < 16 || i.getUint32(0, !0) !== 1) return;
			for (var a = i.getInt32(8, !0), h = i.getInt32(12, !0), o = i.getInt32(16, !0), r = i.getInt32(20, !0), d = {
				windowOrgX: 0,
				windowOrgY: 0,
				viewportOrgX: 0,
				viewportOrgY: 0,
				windowExtX: 1,
				windowExtY: 1,
				viewportExtX: 1,
				viewportExtY: 1,
				polyFillMode: 1,
				currentBrush: {
					kind: "brush",
					style: 1,
					color: "none"
				},
				currentPen: {
					kind: "pen",
					style: 0,
					width: 1,
					color: "000000"
				},
				currentX: 0,
				currentY: 0,
				inPath: !1,
				pathD: "",
				lastPathD: "",
				clipId: void 0
			}, s = {}, g = [], f = [], D = [], T = 0, w = 0; w + 8 <= i.byteLength;) {
				var m = i.getUint32(w, !0), x = i.getUint32(w + 4, !0);
				if (x < 8 || w + x > i.byteLength) break;
				switch (m) {
					case 1: break;
					case 9:
						d.windowExtX = i.getInt32(w + 8, !0) || 1, d.windowExtY = i.getInt32(w + 12, !0) || 1;
						break;
					case 10:
						d.windowOrgX = i.getInt32(w + 8, !0), d.windowOrgY = i.getInt32(w + 12, !0);
						break;
					case 11:
						d.viewportExtX = i.getInt32(w + 8, !0) || 1, d.viewportExtY = i.getInt32(w + 12, !0) || 1;
						break;
					case 12:
						d.viewportOrgX = i.getInt32(w + 8, !0), d.viewportOrgY = i.getInt32(w + 12, !0);
						break;
					case 19:
						d.polyFillMode = i.getUint32(w + 8, !0);
						break;
					case 33:
						g.push(U2(d));
						break;
					case 34:
						if (g.length) {
							var b = g.pop();
							Object.assign(d, b);
						}
						break;
					case 37:
						var L = i.getUint32(w + 8, !0), v = s[L] || v2(L);
						v !== void 0 && (v.kind == "brush" ? d.currentBrush = v : v.kind == "pen" && (d.currentPen = v));
						break;
					case 38:
						var p = i.getUint32(w + 8, !0);
						s[p] = {
							kind: "pen",
							style: i.getUint32(w + 12, !0),
							width: i.getInt32(w + 16, !0),
							color: c1(i.getUint32(w + 20, !0))
						};
						break;
					case 39:
						var l = i.getUint32(w + 8, !0);
						s[l] = {
							kind: "brush",
							style: i.getUint32(w + 12, !0),
							color: c1(i.getUint32(w + 16, !0))
						};
						break;
					case 40:
						delete s[i.getUint32(w + 8, !0)];
						break;
					case 59:
						d.inPath = !0, d.pathD = "";
						break;
					case 60:
						d.inPath = !1, d.lastPathD = d.pathD;
						break;
					case 61:
						d.inPath && (d.pathD += " Z");
						break;
					case 62:
						_(d.lastPathD || d.pathD, "fillOnly");
						break;
					case 63:
						_(d.lastPathD || d.pathD, "fillStroke");
						break;
					case 64:
						_(d.lastPathD || d.pathD, "stroke");
						break;
					case 67:
						if (d.lastPathD || d.pathD) {
							var M = "emfClip" + ++T;
							D.push("<clipPath id=\"" + M + "\"><path d=\"" + (d.lastPathD || d.pathD) + "\"/></clipPath>"), d.clipId = M;
						}
						break;
					case 27:
						ng(d, i.getInt32(w + 8, !0), i.getInt32(w + 12, !0));
						break;
					case 6:
						var J = i.getUint32(w + 24, !0), se = "";
						if (!d.inPath) {
							var ne = Qi(d, d.currentX, d.currentY);
							se = "M" + Nt(ne.x) + " " + Nt(ne.y);
						}
						for (var ce = 0; ce < J; ce++) {
							var N = w + 28 + ce * 8, ke = L2(d, i.getInt32(N, !0), i.getInt32(N + 4, !0));
							d.inPath || (se += " " + ke);
						}
						d.inPath || _(se, "stroke");
						break;
					case 88:
						var ve = i.getUint32(w + 24, !0), S = "";
						if (!d.inPath) {
							var K = Qi(d, d.currentX, d.currentY);
							S = "M" + Nt(K.x) + " " + Nt(K.y);
						}
						for (var y = [], X = 0; X < ve; X++) y.push(W(w + 28 + X * 4));
						for (var le = 0; le + 2 < y.length; le += 3) {
							var t = k2(d, y[le], y[le + 1], y[le + 2]);
							d.inPath || (S += " " + t);
						}
						d.inPath || _(S, "stroke");
						break;
					case 90:
						H(w, !1, !0);
						break;
					case 91:
						H(w, !0, !1);
						break;
					case 95:
						var n = i.getUint32(w + 8, !0);
						s[n] = {
							kind: "pen",
							style: i.getUint32(w + 28, !0),
							width: i.getInt32(w + 32, !0),
							color: c1(i.getUint32(w + 40, !0))
						};
						break;
					case 14:
						w = i.byteLength;
						continue;
					default: break;
				}
				w += x;
			}
			if (!f.length) return;
			var pe = Math.max(1, o - a), Be = Math.max(1, r - h);
			return "data:image/svg+xml;base64," + _2("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"" + a + " " + h + " " + pe + " " + Be + "\" width=\"" + pe + "\" height=\"" + Be + "\" preserveAspectRatio=\"none\">" + (D.length ? "<defs>" + D.join("") + "</defs>" : "") + f.join("") + "</svg>");
		} catch (W) {
			console.warn("Unable to convert EMF image", W);
			return;
		}
	}
	function ig(e, i) {
		var a = (e || "").toLowerCase();
		if (a == "emf") {
			var h = M2(i);
			if (h !== void 0) return h;
		}
		return "data:" + rs(a) + ";base64," + u1(i);
	}
	function F2(e) {
		var i = c(e, ["a:srcRect", "attrs"]);
		if (i === void 0) return {
			container: "overflow:hidden;",
			image: "display:block;width:100%;height:100%;object-fit:fill;max-width:none;max-height:none;"
		};
		var a = parseInt(i.l || 0) / 1e3, h = parseInt(i.t || 0) / 1e3, o = parseInt(i.r || 0) / 1e3, r = parseInt(i.b || 0) / 1e3, d = 100 - a - o, s = 100 - h - r;
		return d <= 0 || s <= 0 ? {
			container: "overflow:hidden;",
			image: "display:block;width:100%;height:100%;object-fit:fill;max-width:none;max-height:none;"
		} : {
			container: "overflow:hidden;",
			image: "position:absolute;max-width:none;max-height:none;width:" + 1e4 / d + "%;height:" + 1e4 / s + "%;left:" + -a / d * 100 + "%;top:" + -h / s * 100 + "%;"
		};
	}
	async function s1(e, i, a, h) {
		var o = c(e, ["p:grpSpPr", "a:xfrm"]), r = o !== void 0 ? y2(o, h) : void 0, d = c(e, ["attrs", "order"]), s = d !== void 0 ? "z-index: " + d + ";" : "";
		o !== void 0 && (s += Yi(o, e, void 0, void 0, "group", h), s += Ki(o, void 0, void 0, h), s += D2(r));
		var g = "<div class='block group' style='" + s + "'>";
		r !== void 0 && (g += "<div class='group-content' style='position:absolute;top:0;left:0;width:100%;height:100%;'>");
		for (var f in e) if (e[f].constructor === Array) for (var D = 0; D < e[f].length; D++) g += await Ur(f, e[f][D], e, i, a, "group", r);
		else g += await Ur(f, e[f], e, i, a, "group", r);
		return r !== void 0 && (g += "</div>"), g += "</div>", g;
	}
	async function rg(e, i, a, h, o, r) {
		var d = c(e, [
			"p:nvSpPr",
			"p:cNvPr",
			"attrs",
			"id"
		]), s = c(e, [
			"p:nvSpPr",
			"p:cNvPr",
			"attrs",
			"name"
		]), g = c(e, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"idx"
		]) === void 0 ? void 0 : c(e, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"idx"
		]), f = c(e, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"type"
		]) === void 0 ? void 0 : c(e, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"type"
		]), D = c(e, ["attrs", "order"]), T;
		(h == "slideLayoutBg" || h == "slideMasterBg") && (c(e, [
			"p:nvSpPr",
			"p:nvPr",
			"attrs",
			"userDrawn"
		]) == "1" ? T = !0 : T = !1);
		var w = void 0, m = void 0;
		return g !== void 0 ? (w = a.slideLayoutTables.idxTable[g], f !== void 0 ? m = a.slideMasterTables.typeTable[f] : m = a.slideMasterTables.idxTable[g]) : f !== void 0 && (w = a.slideLayoutTables.typeTable[f], m = a.slideMasterTables.typeTable[f]), f === void 0 && c(e, [
			"p:nvSpPr",
			"p:cNvSpPr",
			"attrs",
			"txBox"
		]) == "1" && (f = "textBox"), f === void 0 && (f = c(w, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"type"
		]), f === void 0 && (h == "diagramBg" ? f = "diagram" : f = "obj")), dg(e, i, w, m, d, s, g, f, D, a, T, o, h, r);
	}
	async function I2(e, i, a, h, o, r) {
		var d = e["p:nvCxnSpPr"]["p:cNvPr"].attrs.id, s = e["p:nvCxnSpPr"]["p:cNvPr"].attrs.name, g = e["p:nvCxnSpPr"]["p:nvPr"]["p:ph"] === void 0 ? void 0 : e["p:nvSpPr"]["p:nvPr"]["p:ph"].attrs.idx, f = e["p:nvCxnSpPr"]["p:nvPr"]["p:ph"] === void 0 ? void 0 : e["p:nvSpPr"]["p:nvPr"]["p:ph"].attrs.type, D = e.attrs.order;
		return dg(e, i, void 0, void 0, d, s, g, f, D, a, void 0, o, h, r);
	}
	async function dg(e, i, a, h, o, r, d, s, g, f, D, T, w, m) {
		var x = ["p:spPr", "a:xfrm"], b = c(e, x), L = c(a, x), v = c(h, x), p = "", l = c(e, ["attrs", "order"]), M = c(e, [
			"p:spPr",
			"a:prstGeom",
			"attrs",
			"prst"
		]), J = c(e, ["p:spPr", "a:custGeom"]), se = !1, ne = !1, ce = "";
		c(b, ["attrs", "flipV"]) === "1" && (se = !0), c(b, ["attrs", "flipH"]) === "1" && (ne = !0), ne && !se ? ce = " scale(-1,1)" : !ne && se ? ce = " scale(1,-1)" : ne && se && (ce = " scale(-1,-1)");
		var N = Dd(c(b, ["attrs", "rot"])), ke, ve = c(e, ["p:txXfrm"]);
		if (ve !== void 0) {
			var S = c(ve, ["attrs", "rot"]);
			S !== void 0 && (ke = Dd(S) + 90);
		} else ke = N;
		if (M !== void 0 || J !== void 0) {
			var K = c(b, ["a:off", "attrs"]) || {
				x: 0,
				y: 0
			}, y = ud(K.x, "x", m), X = ud(K.y, "y", m), le = c(b, ["a:ext", "attrs"]) || {
				cx: 0,
				cy: 0
			}, t = Vi(le.cx, "x", m), n = Vi(le.cy, "y", m);
			Number.isFinite(y) || (y = 0), Number.isFinite(X) || (X = 0), Number.isFinite(t) || (t = 0), Number.isFinite(n) || (n = 0);
			var pe = "_svg_css_" + (Object.keys(Mt).length + 1) + "_" + Math.floor(Math.random() * 1001), Be = pe + "_effects";
			p += "<svg class='drawing " + pe + " " + Be + " ' _id='" + o + "' _idx='" + d + "' _type='" + s + "' _name='" + r + "'' style='" + Yi(b, i, void 0, void 0, T, m) + Ki(b, void 0, void 0, m) + " z-index: " + g + ";transform: rotate(" + (N !== void 0 ? N : 0) + "deg)" + ce + ";'>", p += "<defs>";
			var W = await ns(e, i, !0, f, w), _ = !1, H = !1, Le = zn(c(e, ["p:spPr"]));
			if (Le == "GROUP_FILL" && (Le = zn(c(i, ["p:grpSpPr"]))), Le == "GRADIENT_FILL") {
				_ = !0;
				var Te = W.color, Ua = W.rot + 90, ya = mp(t, n, Ua, Te, l);
				p += ya;
			} else if (Le == "PIC_FILL") {
				H = !0;
				var pa = await Dp(e, W, l, f);
				p += pa;
			} else if (Le == "PATTERN_FILL") {
				var na = W;
				na in Mt && (na += "do-nothing: " + pe + ";"), Mt[na] = {
					name: pe,
					text: na
				}, W = "none";
			} else Le != "SOLID_FILL" && Le != "PATTERN_FILL" && (M == "arc" || M == "bracketPair" || M == "bracePair" || M == "leftBracket" || M == "leftBrace" || M == "rightBrace" || M == "rightBracket") && (W = "none");
			var U = ii(e, i, !0, "shape", f), ga = c(e, [
				"p:spPr",
				"a:ln",
				"a:headEnd",
				"attrs"
			]), Ba = c(e, [
				"p:spPr",
				"a:ln",
				"a:tailEnd",
				"attrs"
			]), Ya = c(e, [
				"p:spPr",
				"a:effectLst",
				"a:outerShdw"
			]), u = "";
			if (Ya !== void 0) {
				var De = ua(Ya, void 0, void 0, f), de = Ya.attrs, z = de.dir ? parseInt(de.dir) / 6e4 : 0, E = parseInt(de.dist) * k, Q = de.blurRad ? parseInt(de.blurRad) * k : "", Fe = E * Math.sin(z * Math.PI / 180), Ce = "filter:drop-shadow(" + E * Math.cos(z * Math.PI / 180) + "px " + Fe + "px " + Q + "px #" + De + ");";
				Ce in Mt && (Ce += "do-nothing: " + pe + ";"), Mt[Ce] = {
					name: Be,
					text: Ce
				};
			}
			if (ga !== void 0 && (ga.type === "triangle" || ga.type === "arrow") || Ba !== void 0 && (Ba.type === "triangle" || Ba.type === "arrow")) {
				var re = "<marker id='markerTriangle_" + l + "' viewBox='0 0 10 10' refX='1' refY='5' markerWidth='5' markerHeight='5' stroke='" + U.color + "' fill='" + U.color + "' orient='auto-start-reverse' markerUnits='strokeWidth'><path d='M 0 0 L 10 5 L 0 10 z' /></marker>";
				p += re;
			}
			p += "</defs>";
		}
		if (M !== void 0 && J === void 0) {
			switch (M) {
				case "rect":
				case "flowChartProcess":
				case "flowChartPredefinedProcess":
				case "flowChartInternalStorage":
				case "actionButtonBlank":
					p += "<rect x='0' y='0' width='" + t + "' height='" + n + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' " + u + "  />", M == "flowChartPredefinedProcess" ? p += "<rect x='" + t * (1 / 8) + "' y='0' width='" + t * (6 / 8) + "' height='" + n + "' fill='none' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />" : M == "flowChartInternalStorage" && (p += " <polyline points='" + t * (1 / 8) + " 0," + t * (1 / 8) + " " + n + "' fill='none' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />", p += " <polyline points='0 " + n * (1 / 8) + "," + t + " " + n * (1 / 8) + "' fill='none' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />");
					break;
				case "flowChartCollate":
					var Ie = "M 0,0 L" + t + ",0 L0," + n + " L" + t + "," + n + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "flowChartDocument":
					var P, O, V, I = t * 10800 / 21600;
					P = n * 17322 / 21600, O = n * 20172 / 21600, V = n * 23922 / 21600;
					var Ie = "M0,0 L" + t + ",0 L" + t + "," + P + " C" + I + "," + P + " " + I + "," + V + " 0," + O + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "flowChartMultidocument":
					var P = n * 18022 / 21600, O = n * 3675 / 21600, V = n * 23542 / 21600, ie = n * 1815 / 21600, Re = n * 16252 / 21600, ha = n * 16352 / 21600, Pa = n * 14392 / 21600, Lt = n * 20782 / 21600, An = n * 14467 / 21600, I = t * 1532 / 21600, G = t * 2e4 / 21600, Z = t * 9298 / 21600, he = t * 19298 / 21600, Oe = t * 18595 / 21600, Ke = t * 2972 / 21600, xa = t * 20800 / 21600, Ie = "M0," + O + " L" + Oe + "," + O + " L" + Oe + "," + P + " C" + Z + "," + P + " " + Z + "," + V + " 0," + Lt + " zM" + I + "," + O + " L" + I + "," + ie + " L" + G + "," + ie + " L" + G + "," + Re + " C" + he + "," + Re + " " + Oe + "," + ha + " " + Oe + "," + ha + "M" + Ke + "," + ie + " L" + Ke + ",0 L" + t + ",0 L" + t + "," + Pa + " C" + xa + "," + Pa + " " + G + "," + An + " " + G + "," + An;
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonBackPrevious":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, Ha = B + oe, aa = C - oe, ja = C + oe, Ie = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " zM" + aa + "," + B + " L" + ja + "," + da + " L" + ja + "," + Ha + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonBeginning":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, Ha = B + oe, aa = C - oe, ja = C + oe, Ne = ue * 3 / 4, at = Ne / 8, ht = Ne / 4, xt = aa + at, ot = aa + ht, Ie = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " zM" + ot + "," + B + " L" + ja + "," + da + " L" + ja + "," + Ha + " zM" + xt + "," + da + " L" + aa + "," + da + " L" + aa + "," + Ha + " L" + xt + "," + Ha + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonDocument":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, Ha = B + oe, Se = ue * 9 / 32, aa = C - Se, ja = C + Se, Ne = ue * 3 / 16, at = ja - Ne, ht = da + Ne, Ie = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " zM" + aa + "," + da + " L" + at + "," + da + " L" + ja + "," + ht + " L" + ja + "," + Ha + " L" + aa + "," + Ha + " zM" + at + "," + da + " L" + at + "," + ht + " L" + ja + "," + ht + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonEnd":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, Ha = B + oe, aa = C - oe, ja = C + oe, Ne = ue * 3 / 4, at = Ne * 3 / 4, ht = Ne * 7 / 8, xt = aa + at, ot = aa + ht, Ie = "M0," + n + " L" + t + "," + n + " L" + t + ",0 L0,0 z M" + ot + "," + da + " L" + ja + "," + da + " L" + ja + "," + Ha + " L" + ot + "," + Ha + " z M" + xt + "," + B + " L" + aa + "," + da + " L" + aa + "," + Ha + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonForwardNext":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, Ha = B + oe, aa = C - oe, ja = C + oe, Ie = "M0," + n + " L" + t + "," + n + " L" + t + ",0 L0,0 z M" + ja + "," + B + " L" + aa + "," + da + " L" + aa + "," + Ha + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonHelp":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, aa = C - oe, Ne = ue * 3 / 4, at = Ne / 7, ht = Ne * 3 / 14, xt = Ne * 2 / 7, yn = Ne * 3 / 7, Vt = Ne * 4 / 7, Rt = Ne * 17 / 28, In = Ne * 21 / 28, Xt = Ne * 11 / 14, Ft = da + xt, He = da + Rt, We = da + In, ia = da + Xt, Ia = aa + ht, dn = aa + yn, Mn = aa + Vt, gn = Ne / 14, ri = Ne * 3 / 28, pi = Ia + xt, Cr = dn + at, Bs = ia + ri, cc = (Mn + dn + xt) / 2, Ie = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " zM" + Ia + "," + Ft + ae(pi, Ft, xt, xt, 180, 360, !1).replace("M", "L") + ae(cc, Ft, at, ht, 0, 90, !1).replace("M", "L") + ae(cc, He, gn, ri, 270, 180, !1).replace("M", "L") + " L" + Mn + "," + We + " L" + dn + "," + We + " L" + dn + "," + He + ae(Cr, He, at, ht, 180, 270, !1).replace("M", "L") + ae(Mn, Ft, gn, ri, 90, 0, !1).replace("M", "L") + ae(pi, Ft, at, at, 0, -180, !1).replace("M", "L") + " zM" + C + "," + ia + ae(C, Bs, ri, ri, 270, 630, !1).replace("M", "L") + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonHome":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, Ha = B + oe, aa = C - oe, ja = C + oe, Ne = ue * 3 / 4, at = Ne / 16, ht = Ne / 8, xt = Ne * 3 / 16, ot = Ne * 5 / 16, ln = Ne * 7 / 16, yn = Ne * 9 / 16, Vt = Ne * 11 / 16, Rt = Ne * 3 / 4, Fn = Ne * 13 / 16, In = Ne * 7 / 8, Xt = da + at, Qt = da + xt, Dn = da + ot, Ft = da + Rt, Pe = aa + ht, He = aa + ln, We = aa + yn, ia = aa + Vt, za = aa + Fn, Ia = aa + In, Ie = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " z M" + C + "," + da + " L" + aa + "," + B + " L" + Pe + "," + B + " L" + Pe + "," + Ha + " L" + Ia + "," + Ha + " L" + Ia + "," + B + " L" + ja + "," + B + " L" + za + "," + Dn + " L" + za + "," + Xt + " L" + ia + "," + Xt + " L" + ia + "," + Qt + " z M" + He + "," + Ft + " L" + We + "," + Ft + " L" + We + "," + Ha + " L" + He + "," + Ha + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonInformation":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, aa = C - oe, Ne = ue * 3 / 4, at = Ne / 32, ot = Ne * 5 / 16, ln = Ne * 3 / 8, yn = Ne * 13 / 32, Vt = Ne * 19 / 32, Fn = Ne * 11 / 16, In = Ne * 13 / 16, Xt = Ne * 7 / 8, Qt = da + at, Pe = da + ot, He = da + ln, We = da + In, ia = da + Xt, za = aa + ot, rn = aa + yn, jn = aa + Vt, Mn = aa + Fn, dt = Ne * 3 / 32, cr = da + oe, Ir = Qt + dt, Ie = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " zM" + C + "," + da + ae(C, cr, oe, oe, 270, 630, !1).replace("M", "L") + " zM" + C + "," + Qt + ae(C, Ir, dt, dt, 270, 630, !1).replace("M", "L") + "M" + za + "," + Pe + " L" + jn + "," + Pe + " L" + jn + "," + We + " L" + Mn + "," + We + " L" + Mn + "," + ia + " L" + za + "," + ia + " L" + za + "," + We + " L" + rn + "," + We + " L" + rn + "," + He + " L" + za + "," + He + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonMovie":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, Ha = B + oe, aa = C - oe, ja = C + oe, Ne = ue * 3 / 4, at = Ne * 1455 / 21600, ht = Ne * 1905 / 21600, xt = Ne * 2325 / 21600, ot = Ne * 16155 / 21600, ln = Ne * 17010 / 21600, yn = Ne * 19335 / 21600, Vt = Ne * 19725 / 21600, Rt = Ne * 20595 / 21600, Fn = Ne * 5280 / 21600, In = Ne * 5730 / 21600, Xt = Ne * 6630 / 21600, Qt = Ne * 7492 / 21600, Dn = Ne * 9067 / 21600, Ft = Ne * 9555 / 21600, Pe = Ne * 13342 / 21600, He = Ne * 14580 / 21600, We = Ne * 15592 / 21600, ia = aa + at, za = aa + ht, Ia = aa + xt, rn = aa + ot, jn = aa + ln, dn = aa + yn, Mn = aa + Vt, dt = aa + Rt, Rr = da + Fn, vd = da + In, gn = da + Xt, ri = da + Qt, os = da + Dn, cs = da + Ft, ss = da + Pe, Zo = da + He, Lr = da + We;
					da + ia;
					var Ie = "M0," + n + " L" + t + "," + n + " L" + t + ",0 L0,0 zM" + aa + "," + Rr + " L" + aa + "," + cs + " L" + ia + "," + cs + " L" + za + "," + os + " L" + Ia + "," + os + " L" + Ia + "," + Lr + " L" + jn + "," + Lr + " L" + jn + "," + ss + " L" + dn + "," + ss + " L" + dt + "," + Zo + " L" + ja + "," + Zo + " L" + ja + "," + gn + " L" + dt + "," + gn + " L" + Mn + "," + ri + " L" + jn + "," + ri + " L" + jn + "," + gn + " L" + rn + "," + vd + " L" + za + "," + vd + " L" + ia + "," + Rr + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonReturn":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, Ha = B + oe, aa = C - oe, ja = C + oe, Ne = ue * 3 / 4, at = Ne * 7 / 8, ht = Ne * 3 / 4, xt = Ne * 5 / 8, ot = Ne * 3 / 8, ln = Ne / 4, yn = da + ht, Vt = da + xt, Rt = da + ln, Fn = aa + at, In = aa + ht, Xt = aa + xt, Qt = aa + ot, Dn = aa + ln, Ft = Ne / 8, pi = Xt - Ft, Ir = yn - Ft, Ws = aa + ot, Ps = Ha - ot, Ie = "M0," + n + " L" + t + "," + n + " L" + t + ",0 L0,0 z M" + ja + "," + Rt + " L" + In + "," + da + " L" + C + "," + Rt + " L" + Xt + "," + Rt + " L" + Xt + "," + Vt + ae(pi, Vt, Ft, Ft, 0, 90, !1).replace("M", "L") + " L" + Qt + "," + yn + ae(Qt, Ir, Ft, Ft, 90, 180, !1).replace("M", "L") + " L" + Dn + "," + Rt + " L" + aa + "," + Rt + " L" + aa + "," + Vt + ae(Ws, Vt, ot, ot, 180, 90, !1).replace("M", "L") + " L" + C + "," + Ha + ae(C, Ps, ot, ot, 90, 0, !1).replace("M", "L") + " L" + Fn + "," + Rt + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "actionButtonSound":
					var C = t / 2, B = n / 2, ue = Math.min(t, n), oe = ue * 3 / 8, da = B - oe, Ha = B + oe, aa = C - oe, ja = C + oe, Ne = ue * 3 / 4, at = Ne / 8, ht = Ne * 5 / 16, xt = Ne * 5 / 8, ot = Ne * 11 / 16, ln = Ne * 3 / 4, yn = Ne * 7 / 8, Vt = da + at, Rt = da + ht, Fn = da + ot, In = da + yn, Xt = aa + ht, Qt = aa + xt, Dn = aa + ln, Ie = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " z M" + aa + "," + Rt + " L" + Xt + "," + Rt + " L" + Qt + "," + da + " L" + Qt + "," + Ha + " L" + Xt + "," + Fn + " L" + aa + "," + Fn + " z M" + Dn + "," + Rt + " L" + ja + "," + Vt + " M" + Dn + "," + B + " L" + ja + "," + B + " M" + Dn + "," + Fn + " L" + ja + "," + In;
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "irregularSeal1":
				case "irregularSeal2":
					if (M == "irregularSeal1") var Ie = "M" + t * 10800 / 21600 + "," + n * 5800 / 21600 + " L" + t * 14522 / 21600 + ",0 L" + t * 14155 / 21600 + "," + n * 5325 / 21600 + " L" + t * 18380 / 21600 + "," + n * 4457 / 21600 + " L" + t * 16702 / 21600 + "," + n * 7315 / 21600 + " L" + t * 21097 / 21600 + "," + n * 8137 / 21600 + " L" + t * 17607 / 21600 + "," + n * 10475 / 21600 + " L" + t + "," + n * 13290 / 21600 + " L" + t * 16837 / 21600 + "," + n * 12942 / 21600 + " L" + t * 18145 / 21600 + "," + n * 18095 / 21600 + " L" + t * 14020 / 21600 + "," + n * 14457 / 21600 + " L" + t * 13247 / 21600 + "," + n * 19737 / 21600 + " L" + t * 10532 / 21600 + "," + n * 14935 / 21600 + " L" + t * 8485 / 21600 + "," + n + " L" + t * 7715 / 21600 + "," + n * 15627 / 21600 + " L" + t * 4762 / 21600 + "," + n * 17617 / 21600 + " L" + t * 5667 / 21600 + "," + n * 13937 / 21600 + " L" + t * 135 / 21600 + "," + n * 14587 / 21600 + " L" + t * 3722 / 21600 + "," + n * 11775 / 21600 + " L0," + n * 8615 / 21600 + " L" + t * 4627 / 21600 + "," + n * 7617 / 21600 + " L" + t * 370 / 21600 + "," + n * 2295 / 21600 + " L" + t * 7312 / 21600 + "," + n * 6320 / 21600 + " L" + t * 8352 / 21600 + "," + n * 2295 / 21600 + " z";
					else if (M == "irregularSeal2") var Ie = "M" + t * 11462 / 21600 + "," + n * 4342 / 21600 + " L" + t * 14790 / 21600 + ",0 L" + t * 14525 / 21600 + "," + n * 5777 / 21600 + " L" + t * 18007 / 21600 + "," + n * 3172 / 21600 + " L" + t * 16380 / 21600 + "," + n * 6532 / 21600 + " L" + t + "," + n * 6645 / 21600 + " L" + t * 16985 / 21600 + "," + n * 9402 / 21600 + " L" + t * 18270 / 21600 + "," + n * 11290 / 21600 + " L" + t * 16380 / 21600 + "," + n * 12310 / 21600 + " L" + t * 18877 / 21600 + "," + n * 15632 / 21600 + " L" + t * 14640 / 21600 + "," + n * 14350 / 21600 + " L" + t * 14942 / 21600 + "," + n * 17370 / 21600 + " L" + t * 12180 / 21600 + "," + n * 15935 / 21600 + " L" + t * 11612 / 21600 + "," + n * 18842 / 21600 + " L" + t * 9872 / 21600 + "," + n * 17370 / 21600 + " L" + t * 8700 / 21600 + "," + n * 19712 / 21600 + " L" + t * 7527 / 21600 + "," + n * 18125 / 21600 + " L" + t * 4917 / 21600 + "," + n + " L" + t * 4805 / 21600 + "," + n * 18240 / 21600 + " L" + t * 1285 / 21600 + "," + n * 17825 / 21600 + " L" + t * 3330 / 21600 + "," + n * 15370 / 21600 + " L0," + n * 12877 / 21600 + " L" + t * 3935 / 21600 + "," + n * 11592 / 21600 + " L" + t * 1172 / 21600 + "," + n * 8270 / 21600 + " L" + t * 5372 / 21600 + "," + n * 7817 / 21600 + " L" + t * 4502 / 21600 + "," + n * 3625 / 21600 + " L" + t * 8550 / 21600 + "," + n * 6382 / 21600 + " L" + t * 9722 / 21600 + "," + n * 1887 / 21600 + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "flowChartTerminator":
					var I, G, P, ba = 180, ka = 90, La = 270;
					I = t * 3475 / 21600, G = t * 18125 / 21600, P = n * 10800 / 21600;
					var Ie = "M" + I + ",0 L" + G + ",0" + ae(G, n / 2, I, P, La, La + ba, !1).replace("M", "L") + " L" + I + "," + n + ae(I, n / 2, I, P, ka, ka + ba, !1).replace("M", "L") + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "flowChartPunchedTape":
					var I, I, P, O, ba = 180;
					I = t * 5 / 20, P = n * 2 / 20, O = n * 18 / 20;
					var Ie = "M0," + P + ae(I, P, I, P, ba, 0, !1).replace("M", "L") + ae(t * (3 / 4), P, I, P, ba, 360, !1).replace("M", "L") + " L" + t + "," + O + ae(t * (3 / 4), O, I, P, 0, -ba, !1).replace("M", "L") + ae(I, O, I, P, 0, ba, !1).replace("M", "L") + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "flowChartOnlineStorage":
					var I, P, La = 270, ka = 90;
					I = t * 1 / 6, P = n * 3 / 6;
					var Ie = "M" + I + ",0 L" + t + ",0" + ae(t, n / 2, I, P, La, 90, !1).replace("M", "L") + " L" + I + "," + n + ae(I, n / 2, I, P, ka, 270, !1).replace("M", "L") + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "flowChartDisplay":
					var I, G, P, La = 270, ba = 180;
					I = t * 1 / 6, G = t * 5 / 6, P = n * 3 / 6;
					var Ie = "M0," + P + " L" + I + ",0 L" + G + ",0" + ae(t, n / 2, I, P, La, La + ba, !1).replace("M", "L") + " L" + I + "," + n + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "flowChartDelay":
					var ze = t / 2, Ae = n / 2, ba = 180, La = 270, ka = 90, Ie = "M0,0 L" + ze + ",0" + ae(ze, Ae, ze, Ae, La, La + ba, !1).replace("M", "L") + " L0," + n + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "flowChartMagneticTape":
					var ze = t / 2, Ae = n / 2, ba = 180, La = 270, ka = 90, yt = Ae * Math.sin(Math.PI / 4), fi = Ae + yt, Tp = Math.atan(n / t) * 180 / Math.PI, Ie = "M" + ze + "," + n + ae(ze, Ae, ze, Ae, ka, ba, !1).replace("M", "L") + ae(ze, Ae, ze, Ae, ba, La, !1).replace("M", "L") + ae(ze, Ae, ze, Ae, La, 360, !1).replace("M", "L") + ae(ze, Ae, ze, Ae, 0, Tp, !1).replace("M", "L") + " L" + t + "," + fi + " L" + t + "," + n + " z";
					p += "<path d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "ellipse":
				case "flowChartConnector":
				case "flowChartSummingJunction":
				case "flowChartOr":
					if (p += "<ellipse cx='" + t / 2 + "' cy='" + n / 2 + "' rx='" + t / 2 + "' ry='" + n / 2 + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />", M == "flowChartOr") p += " <polyline points='" + t / 2 + " 0," + t / 2 + " " + n + "' fill='none' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />", p += " <polyline points='0 " + n / 2 + "," + t + " " + n / 2 + "' fill='none' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					else if (M == "flowChartSummingJunction") {
						var wt, yt, ar, nr, tr, fi, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, pg = Math.PI / 4;
						wt = ze * Math.cos(pg), yt = Ae * Math.sin(pg), ar = C - wt, nr = C + wt, tr = B - yt, fi = B + yt, p += " <polyline points='" + ar + " " + tr + "," + nr + " " + fi + "' fill='none' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />", p += " <polyline points='" + nr + " " + tr + "," + ar + " " + fi + "' fill='none' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					}
					break;
				case "roundRect":
				case "round1Rect":
				case "round2DiagRect":
				case "round2SameRect":
				case "snip1Rect":
				case "snip2DiagRect":
				case "snip2SameRect":
				case "flowChartAlternateProcess":
				case "flowChartPunchedCard":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je, xe, qe, kr, Tr;
					if (F !== void 0 && F.constructor === Array) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), Je = parseInt(be.substr(4)) / 5e4) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), qe = parseInt(xe.substr(4)) / 5e4);
					}
					else if (F !== void 0 && F.constructor !== Array) {
						var wp = c(F, ["attrs", "fmla"]);
						Je = parseInt(wp.substr(4)) / 5e4, qe = 0;
					}
					var yi = "";
					switch (M) {
						case "roundRect":
						case "flowChartAlternateProcess":
							kr = "round", Tr = "cornrAll", Je === void 0 && (Je = .33334), qe = 0;
							break;
						case "round1Rect":
							kr = "round", Tr = "cornr1", Je === void 0 && (Je = .33334), qe = 0;
							break;
						case "round2DiagRect":
							kr = "round", Tr = "diag", Je === void 0 && (Je = .33334), qe === void 0 && (qe = 0);
							break;
						case "round2SameRect":
							kr = "round", Tr = "cornr2", Je === void 0 && (Je = .33334), qe === void 0 && (qe = 0);
							break;
						case "snip1Rect":
						case "flowChartPunchedCard":
							kr = "snip", Tr = "cornr1", Je === void 0 && (Je = .33334), qe = 0, M == "flowChartPunchedCard" && (yi = "transform='translate(" + t + ",0) scale(-1,1)'");
							break;
						case "snip2DiagRect":
							kr = "snip", Tr = "diag", Je === void 0 && (Je = 0), qe === void 0 && (qe = .33334);
							break;
						case "snip2SameRect":
							kr = "snip", Tr = "cornr2", Je === void 0 && (Je = .33334), qe === void 0 && (qe = 0);
							break;
					}
					var _e = W2(t, n, Je, qe, kr, Tr);
					p += "<path " + yi + "  d='" + _e + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "snipRoundRect":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = .33334, xe, qe = .33334;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), Je = parseInt(be.substr(4)) / 5e4) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), qe = parseInt(xe.substr(4)) / 5e4);
					}
					var _e = "M0," + n + " L" + t + "," + n + " L" + t + "," + n / 2 * qe + " L" + (t / 2 + t / 2 * (1 - qe)) + ",0 L" + t / 2 * Je + ",0 Q0,0 0," + n / 2 * Je + " z";
					p += "<path   d='" + _e + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "bentConnector2":
					var Ie = "";
					Ie = "M " + t + " 0 L " + t + " " + n + " L 0 " + n, p += "<path d='" + Ie + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' fill='none' ", ga !== void 0 && (ga.type === "triangle" || ga.type === "arrow") && (p += "marker-start='url(#markerTriangle_" + l + ")' "), Ba !== void 0 && (Ba.type === "triangle" || Ba.type === "arrow") && (p += "marker-end='url(#markerTriangle_" + l + ")' "), p += "/>";
					break;
				case "rtTriangle":
					p += " <polygon points='0 0,0 " + n + "," + t + " " + n + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "triangle":
				case "flowChartExtract":
				case "flowChartMerge":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), _d = .5;
					me !== void 0 && (_d = parseInt(me.substr(4)) * k);
					var yi = "";
					M == "flowChartMerge" && (yi = "transform='rotate(180 " + t / 2 + "," + n / 2 + ")'"), p += " <polygon " + yi + " points='" + t * _d + " 0,0 " + n + "," + t + " " + n + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "diamond":
				case "flowChartDecision":
				case "flowChartSort":
					p += " <polygon points='" + t / 2 + " 0,0 " + n / 2 + "," + t / 2 + " " + n + "," + t + " " + n / 2 + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />", M == "flowChartSort" && (p += " <polyline points='0 " + n / 2 + "," + t + " " + n / 2 + "' fill='none' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />");
					break;
				case "trapezoid":
				case "flowChartManualOperation":
				case "flowChartManualInput":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), wr = .2, ec = .7407;
					if (me !== void 0) {
						var x1 = parseInt(me.substr(4)) * k;
						wr = x1 * .5 / ec;
					}
					var y1 = 0, yi = "";
					M == "flowChartManualOperation" && (yi = "transform='rotate(180 " + t / 2 + "," + n / 2 + ")'"), M == "flowChartManualInput" && (wr = 0, y1 = n / 5), p += " <polygon " + yi + " points='" + t * wr + " " + y1 + ",0 " + n + "," + t + " " + n + "," + (1 - wr) * t + " 0' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "parallelogram":
				case "flowChartInputOutput":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), wr = .25, ec;
					if (t > n ? ec = t / n : ec = n / t, me !== void 0) {
						var x1 = parseInt(me.substr(4)) / 1e5;
						wr = x1 / ec;
					}
					p += " <polygon points='" + wr * t + " 0,0 " + n + "," + (1 - wr) * t + " " + n + "," + t + " 0' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "pentagon":
					p += " <polygon points='" + .5 * t + " 0,0 " + .375 * n + "," + .15 * t + " " + n + "," + .85 * t + " " + n + "," + t + " " + .375 * n + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "hexagon":
				case "flowChartPreparation":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 25e3 * k, er = 115470 * k, q = 5e4 * k, ee = 1e5 * k, dd = 60 * Math.PI / 180;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var ta, Me, On, I, G, we, P, O, B = n / 2, Ae = n / 2, ue = Math.min(t, n);
					ta = q * t / ue, Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, On = Ae * er / ee, I = ue * Me / ee, G = t - I, we = On * Math.sin(dd), P = B - we, O = B + we;
					var Ie = "M0," + B + " L" + I + "," + P + " L" + G + "," + P + " L" + t + "," + B + " L" + G + "," + O + " L" + I + "," + O + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "heptagon":
					p += " <polygon points='" + .5 * t + " 0," + t / 8 + " " + n / 4 + ",0 " + 5 / 8 * n + "," + t / 4 + " " + n + "," + 3 / 4 * t + " " + n + "," + t + " " + 5 / 8 * n + "," + 7 / 8 * t + " " + n / 4 + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "octagon":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), j = .25;
					me !== void 0 && (j = parseInt(me.substr(4)) / 1e5);
					var R = 1 - j;
					p += " <polygon points='" + j * t + " 0,0 " + j * n + ",0 " + R * n + "," + j * t + " " + n + "," + R * t + " " + n + "," + t + " " + R * n + "," + t + " " + j * n + "," + R * t + " 0' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "decagon":
					p += " <polygon points='" + 3 / 8 * t + " 0," + t / 8 + " " + n / 8 + ",0 " + n / 2 + "," + t / 8 + " " + 7 / 8 * n + "," + 3 / 8 * t + " " + n + "," + 5 / 8 * t + " " + n + "," + 7 / 8 * t + " " + 7 / 8 * n + "," + t + " " + n / 2 + "," + 7 / 8 * t + " " + n / 8 + "," + 5 / 8 * t + " 0' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "dodecagon":
					p += " <polygon points='" + 3 / 8 * t + " 0," + t / 8 + " " + n / 8 + ",0 " + 3 / 8 * n + ",0 " + 5 / 8 * n + "," + t / 8 + " " + 7 / 8 * n + "," + 3 / 8 * t + " " + n + "," + 5 / 8 * t + " " + n + "," + 7 / 8 * t + " " + 7 / 8 * n + "," + t + " " + 5 / 8 * n + "," + t + " " + 3 / 8 * n + "," + 7 / 8 * t + " " + n / 8 + "," + 5 / 8 * t + " 0' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star4":
					var Me, $e, je, Wd, Bd, Ca, Ma, wa, _a, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, Ue = 19098 * k, q = 5e4 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (me !== void 0) {
						var r = me.attrs.name;
						r == "adj" && (Ue = parseInt(me.attrs.fmla.substr(4)) * k);
					}
					Me = Ue < 0 ? 0 : Ue > q ? q : Ue, $e = ze * Me / q, je = Ae * Me / q, Wd = $e * Math.cos(.7853981634), Bd = je * Math.sin(.7853981634), Ca = C - Wd, Ma = C + Wd, wa = B - Bd, _a = B + Bd, B - je;
					var Ie = "M0," + B + " L" + Ca + "," + wa + " L" + C + ",0 L" + Ma + "," + wa + " L" + t + "," + B + " L" + Ma + "," + _a + " L" + C + "," + n + " L" + Ca + "," + _a + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star5":
					var Me, Ht, On, on, Se, oe, we, Ee, I, G, Z, he, P, O, $e, je, Ka, Na, Ra, nt, Ca, Ma, Xa, $a, wa, _a, et, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, Ue = 19098 * k, di = 105146 * k, er = 110557 * k, ta = 5e4 * k, q = 1e5 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					me !== void 0 && Object.keys(me).forEach(function(Gt) {
						var Za = me[Gt].attrs.name;
						Za == "adj" ? Ue = parseInt(me[Gt].attrs.fmla.substr(4)) * k : Za == "hf" ? di = parseInt(me[Gt].attrs.fmla.substr(4)) * k : Za == "vf" && (er = parseInt(me[Gt].attrs.fmla.substr(4)) * k);
					}), Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, Ht = ze * di / q, On = Ae * er / q, on = B * er / q, Se = Ht * Math.cos(.31415926536), oe = Ht * Math.cos(5.3407075111), we = On * Math.sin(.31415926536), Ee = On * Math.sin(5.3407075111), I = C - Se, G = C - oe, Z = C + oe, he = C + Se, P = on - we, O = on - Ee, $e = Ht * Me / ta, je = On * Me / ta, Ka = $e * Math.cos(5.9690260418), Na = $e * Math.cos(.94247779608), Ra = je * Math.sin(.94247779608), nt = je * Math.sin(5.9690260418), Ca = C - Ka, Ma = C - Na, Xa = C + Na, $a = C + Ka, wa = on - Ra, _a = on - nt, et = on + je, on - je;
					var Ie = "M" + I + "," + P + " L" + Ma + "," + wa + " L" + C + ",0 L" + Xa + "," + wa + " L" + he + "," + P + " L" + $a + "," + _a + " L" + Z + "," + O + " L" + C + "," + et + " L" + G + "," + O + " L" + Ca + "," + _a + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star6":
					var Me, Ht, Se, I, G, O, $e, je, Na, Ca, Ma, Xa, $a, Ra, wa, _a, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, ir = n / 4, Ue = 28868 * k, di = 115470 * k, ta = 5e4 * k, q = 1e5 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					me !== void 0 && Object.keys(me).forEach(function(Gt) {
						var Za = me[Gt].attrs.name;
						Za == "adj" ? Ue = parseInt(me[Gt].attrs.fmla.substr(4)) * k : Za == "hf" && (di = parseInt(me[Gt].attrs.fmla.substr(4)) * k);
					}), Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, Ht = ze * di / q, Se = Ht * Math.cos(.5235987756), I = C - Se, G = C + Se, O = B + ir, $e = Ht * Me / ta, je = Ae * Me / ta, Na = $e / 2, Ca = C - $e, Ma = C - Na, Xa = C + Na, $a = C + $e, Ra = je * Math.sin(1.0471975512), wa = B - Ra, _a = B + Ra, B - je;
					var Ie = "M" + I + "," + ir + " L" + Ma + "," + wa + " L" + C + ",0 L" + Xa + "," + wa + " L" + G + "," + ir + " L" + $a + "," + B + " L" + G + "," + O + " L" + Xa + "," + _a + " L" + C + "," + n + " L" + Ma + "," + _a + " L" + I + "," + O + " L" + Ca + "," + B + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star7":
					var Me, Ht, On, on, Se, oe, ma, we, Ee, Ga, I, G, Z, he, Oe, Ke, P, O, V, $e, je, Ka, Na, $t, Ca, Ma, Xa, $a, It, Bt, Ra, nt, Yt, wa, _a, et, pt, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, Ue = 34601 * k, di = 102572 * k, er = 105210 * k, ta = 5e4 * k, q = 1e5 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					me !== void 0 && Object.keys(me).forEach(function(Gt) {
						var Za = me[Gt].attrs.name;
						Za == "adj" ? Ue = parseInt(me[Gt].attrs.fmla.substr(4)) * k : Za == "hf" ? di = parseInt(me[Gt].attrs.fmla.substr(4)) * k : Za == "vf" && (er = parseInt(me[Gt].attrs.fmla.substr(4)) * k);
					}), Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, Ht = ze * di / q, On = Ae * er / q, on = B * er / q, Se = Ht * 97493 / 1e5, oe = Ht * 78183 / 1e5, ma = Ht * 43388 / 1e5, we = On * 62349 / 1e5, Ee = On * 22252 / 1e5, Ga = On * 90097 / 1e5, I = C - Se, G = C - oe, Z = C - ma, he = C + ma, Oe = C + oe, Ke = C + Se, P = on - we, O = on + Ee, V = on + Ga, $e = Ht * Me / ta, je = On * Me / ta, Ka = $e * 97493 / 1e5, Na = $e * 78183 / 1e5, $t = $e * 43388 / 1e5, Ca = C - Ka, Ma = C - Na, Xa = C - $t, $a = C + $t, It = C + Na, Bt = C + Ka, Ra = je * 90097 / 1e5, nt = je * 22252 / 1e5, Yt = je * 62349 / 1e5, wa = on - Ra, _a = on - nt, et = on + Yt, pt = on + je, on - je;
					var Ie = "M" + I + "," + O + " L" + Ca + "," + _a + " L" + G + "," + P + " L" + Xa + "," + wa + " L" + C + ",0 L" + $a + "," + wa + " L" + Oe + "," + P + " L" + Bt + "," + _a + " L" + Ke + "," + O + " L" + It + "," + et + " L" + he + "," + V + " L" + C + "," + pt + " L" + Z + "," + V + " L" + Ma + "," + et + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star8":
					var Me, Se, I, G, we, P, O, $e, je, Ka, Na, Ra, nt, Ca, Ma, Xa, $a, wa, _a, et, pt, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, Ue = 37500 * k, ta = 5e4 * k, q = 1e5 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (me !== void 0) {
						var r = me.attrs.name;
						r == "adj" && (Ue = parseInt(me.attrs.fmla.substr(4)) * k);
					}
					Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, Se = ze * Math.cos(.7853981634), I = C - Se, G = C + Se, we = Ae * Math.sin(.7853981634), P = B - we, O = B + we, $e = ze * Me / ta, je = Ae * Me / ta, Ka = $e * 92388 / 1e5, Na = $e * 38268 / 1e5, Ra = je * 92388 / 1e5, nt = je * 38268 / 1e5, Ca = C - Ka, Ma = C - Na, Xa = C + Na, $a = C + Ka, wa = B - Ra, _a = B - nt, et = B + nt, pt = B + Ra, B - je;
					var Ie = "M0," + B + " L" + Ca + "," + _a + " L" + I + "," + P + " L" + Ma + "," + wa + " L" + C + ",0 L" + Xa + "," + wa + " L" + G + "," + P + " L" + $a + "," + _a + " L" + t + "," + B + " L" + $a + "," + et + " L" + G + "," + O + " L" + Xa + "," + pt + " L" + C + "," + n + " L" + Ma + "," + pt + " L" + I + "," + O + " L" + Ca + "," + et + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star10":
					var Me, Ht, Se, oe, I, G, Z, he, we, Ee, P, O, V, ie, $e, je, Ka, Na, Ra, nt, Ca, Ma, Xa, $a, It, Bt, wa, _a, et, pt, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, Ue = 42533 * k, di = 105146 * k, ta = 5e4 * k, q = 1e5 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					me !== void 0 && Object.keys(me).forEach(function(Gt) {
						var Za = me[Gt].attrs.name;
						Za == "adj" ? Ue = parseInt(me[Gt].attrs.fmla.substr(4)) * k : Za == "hf" && (di = parseInt(me[Gt].attrs.fmla.substr(4)) * k);
					}), Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, Ht = ze * di / q, Se = Ht * 95106 / 1e5, oe = Ht * 58779 / 1e5, I = C - Se, G = C - oe, Z = C + oe, he = C + Se, we = Ae * 80902 / 1e5, Ee = Ae * 30902 / 1e5, P = B - we, O = B - Ee, V = B + Ee, ie = B + we, $e = Ht * Me / ta, je = Ae * Me / ta, Ka = $e * 80902 / 1e5, Na = $e * 30902 / 1e5, Ra = je * 95106 / 1e5, nt = je * 58779 / 1e5, Ca = C - $e, Ma = C - Ka, Xa = C - Na, $a = C + Na, It = C + Ka, Bt = C + $e, wa = B - Ra, _a = B - nt, et = B + nt, pt = B + Ra, B - je;
					var Ie = "M" + I + "," + O + " L" + Ma + "," + _a + " L" + G + "," + P + " L" + Xa + "," + wa + " L" + C + ",0 L" + $a + "," + wa + " L" + Z + "," + P + " L" + It + "," + _a + " L" + he + "," + O + " L" + Bt + "," + B + " L" + he + "," + V + " L" + It + "," + et + " L" + Z + "," + ie + " L" + $a + "," + pt + " L" + C + "," + n + " L" + Xa + "," + pt + " L" + G + "," + ie + " L" + Ma + "," + et + " L" + I + "," + V + " L" + Ca + "," + B + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star12":
					var Me, Se, we, I, Z, he, P, V, ie, $e, je, Ka, Na, $t, Ra, nt, Yt, Ca, Ma, Xa, $a, It, Bt, wa, _a, et, pt, vn, Un, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, ir = n / 4, ac = t / 4, Ue = 37500 * k, ta = 5e4 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (me !== void 0) {
						var r = me.attrs.name;
						r == "adj" && (Ue = parseInt(me.attrs.fmla.substr(4)) * k);
					}
					Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, Se = ze * Math.cos(.5235987756), we = Ae * Math.sin(1.0471975512), I = C - Se, Z = t * 3 / 4, he = C + Se, P = B - we, V = n * 3 / 4, ie = B + we, $e = ze * Me / ta, je = Ae * Me / ta, Ka = $e * Math.cos(.2617993878), Na = $e * Math.cos(.7853981634), $t = $e * Math.cos(1.308996939), Ra = je * Math.sin(1.308996939), nt = je * Math.sin(.7853981634), Yt = je * Math.sin(.2617993878), Ca = C - Ka, Ma = C - Na, Xa = C - $t, $a = C + $t, It = C + Na, Bt = C + Ka, wa = B - Ra, _a = B - nt, et = B - Yt, pt = B + Yt, vn = B + nt, Un = B + Ra, B - je;
					var Ie = "M0," + B + " L" + Ca + "," + et + " L" + I + "," + ir + " L" + Ma + "," + _a + " L" + ac + "," + P + " L" + Xa + "," + wa + " L" + C + ",0 L" + $a + "," + wa + " L" + Z + "," + P + " L" + It + "," + _a + " L" + he + "," + ir + " L" + Bt + "," + et + " L" + t + "," + B + " L" + Bt + "," + pt + " L" + he + "," + V + " L" + It + "," + vn + " L" + Z + "," + ie + " L" + $a + "," + Un + " L" + C + "," + n + " L" + Xa + "," + Un + " L" + ac + "," + ie + " L" + Ma + "," + vn + " L" + I + "," + V + " L" + Ca + "," + pt + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star16":
					var Me, Se, oe, ma, we, Ee, Ga, I, G, Z, he, Oe, Ke, P, O, V, ie, Re, ha, $e, je, Ka, Na, $t, oi, Ra, nt, Yt, ci, Ca, Ma, Xa, $a, It, Bt, si, hi, wa, _a, et, pt, vn, Un, gi, li, wt, yt, ar, tr, nr, fi, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, Ue = 37500 * k, ta = 5e4 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (me !== void 0) {
						var r = me.attrs.name;
						r == "adj" && (Ue = parseInt(me.attrs.fmla.substr(4)) * k);
					}
					Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, Se = ze * 92388 / 1e5, oe = ze * 70711 / 1e5, ma = ze * 38268 / 1e5, we = Ae * 92388 / 1e5, Ee = Ae * 70711 / 1e5, Ga = Ae * 38268 / 1e5, I = C - Se, G = C - oe, Z = C - ma, he = C + ma, Oe = C + oe, Ke = C + Se, P = B - we, O = B - Ee, V = B - Ga, ie = B + Ga, Re = B + Ee, ha = B + we, $e = ze * Me / ta, je = Ae * Me / ta, Ka = $e * 98079 / 1e5, Na = $e * 83147 / 1e5, $t = $e * 55557 / 1e5, oi = $e * 19509 / 1e5, Ra = je * 98079 / 1e5, nt = je * 83147 / 1e5, Yt = je * 55557 / 1e5, ci = je * 19509 / 1e5, Ca = C - Ka, Ma = C - Na, Xa = C - $t, $a = C - oi, It = C + oi, Bt = C + $t, si = C + Na, hi = C + Ka, wa = B - Ra, _a = B - nt, et = B - Yt, pt = B - ci, vn = B + ci, Un = B + Yt, gi = B + nt, li = B + Ra, wt = $e * Math.cos(.7853981634), yt = je * Math.sin(.7853981634), ar = C - wt, tr = B - yt, nr = C + wt, fi = B + yt, B - je;
					var Ie = "M0," + B + " L" + Ca + "," + pt + " L" + I + "," + V + " L" + Ma + "," + et + " L" + G + "," + O + " L" + Xa + "," + _a + " L" + Z + "," + P + " L" + $a + "," + wa + " L" + C + ",0 L" + It + "," + wa + " L" + he + "," + P + " L" + Bt + "," + _a + " L" + Oe + "," + O + " L" + si + "," + et + " L" + Ke + "," + V + " L" + hi + "," + pt + " L" + t + "," + B + " L" + hi + "," + vn + " L" + Ke + "," + ie + " L" + si + "," + Un + " L" + Oe + "," + Re + " L" + Bt + "," + gi + " L" + he + "," + ha + " L" + It + "," + li + " L" + C + "," + n + " L" + $a + "," + li + " L" + Z + "," + ha + " L" + Xa + "," + gi + " L" + G + "," + Re + " L" + Ma + "," + Un + " L" + I + "," + ie + " L" + Ca + "," + vn + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star24":
					var Me, Se, oe, ma, Bn, Nn, we, Ee, Ga, Yn, ur, I, G, Z, he, Oe, Ke, xa, Ta, Ja, Ct, P, O, V, ie, Re, ha, Pa, Lt, An, Vn, $e, je, Ka, Na, $t, oi, Hr, $r, Ra, nt, Yt, ci, Jr, qr, Ca, Ma, Xa, $a, It, Bt, si, hi, Vr, Qr, Yr, Kr, wa, _a, et, pt, vn, Un, gi, li, Zr, ed, ad, td, wt, yt, ar, tr, nr, fi, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, ir = n / 4, ac = t / 4, Ue = 37500 * k, ta = 5e4 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (me !== void 0) {
						var r = me.attrs.name;
						r == "adj" && (Ue = parseInt(me.attrs.fmla.substr(4)) * k);
					}
					Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, Se = ze * Math.cos(.2617993878), oe = ze * Math.cos(.5235987756), ma = ze * Math.cos(.7853981634), Bn = ac, Nn = ze * Math.cos(1.308996939), we = Ae * Math.sin(1.308996939), Ee = Ae * Math.sin(1.0471975512), Ga = Ae * Math.sin(.7853981634), Yn = ir, ur = Ae * Math.sin(.2617993878), I = C - Se, G = C - oe, Z = C - ma, he = C - Bn, Oe = C - Nn, Ke = C + Nn, xa = C + Bn, Ta = C + ma, Ja = C + oe, Ct = C + Se, P = B - we, O = B - Ee, V = B - Ga, ie = B - Yn, Re = B - ur, ha = B + ur, Pa = B + Yn, Lt = B + Ga, An = B + Ee, Vn = B + we, $e = ze * Me / ta, je = Ae * Me / ta, Ka = $e * 99144 / 1e5, Na = $e * 92388 / 1e5, $t = $e * 79335 / 1e5, oi = $e * 60876 / 1e5, Hr = $e * 38268 / 1e5, $r = $e * 13053 / 1e5, Ra = je * 99144 / 1e5, nt = je * 92388 / 1e5, Yt = je * 79335 / 1e5, ci = je * 60876 / 1e5, Jr = je * 38268 / 1e5, qr = je * 13053 / 1e5, Ca = C - Ka, Ma = C - Na, Xa = C - $t, $a = C - oi, It = C - Hr, Bt = C - $r, si = C + $r, hi = C + Hr, Vr = C + oi, Qr = C + $t, Yr = C + Na, Kr = C + Ka, wa = B - Ra, _a = B - nt, et = B - Yt, pt = B - ci, vn = B - Jr, Un = B - qr, gi = B + qr, li = B + Jr, Zr = B + ci, ed = B + Yt, ad = B + nt, td = B + Ra, wt = $e * Math.cos(.7853981634), yt = je * Math.sin(.7853981634), ar = C - wt, tr = B - yt, nr = C + wt, fi = B + yt, B - je;
					var Ie = "M0," + B + " L" + Ca + "," + Un + " L" + I + "," + Re + " L" + Ma + "," + vn + " L" + G + "," + ie + " L" + Xa + "," + pt + " L" + Z + "," + V + " L" + $a + "," + et + " L" + he + "," + O + " L" + It + "," + _a + " L" + Oe + "," + P + " L" + Bt + "," + wa + " L" + C + ",0 L" + si + "," + wa + " L" + Ke + "," + P + " L" + hi + "," + _a + " L" + xa + "," + O + " L" + Vr + "," + et + " L" + Ta + "," + V + " L" + Qr + "," + pt + " L" + Ja + "," + ie + " L" + Yr + "," + vn + " L" + Ct + "," + Re + " L" + Kr + "," + Un + " L" + t + "," + B + " L" + Kr + "," + gi + " L" + Ct + "," + ha + " L" + Yr + "," + li + " L" + Ja + "," + Pa + " L" + Qr + "," + Zr + " L" + Ta + "," + Lt + " L" + Vr + "," + ed + " L" + xa + "," + An + " L" + hi + "," + ad + " L" + Ke + "," + Vn + " L" + si + "," + td + " L" + C + "," + n + " L" + Bt + "," + td + " L" + Oe + "," + Vn + " L" + It + "," + ad + " L" + he + "," + An + " L" + $a + "," + ed + " L" + Z + "," + Lt + " L" + Xa + "," + Zr + " L" + G + "," + Pa + " L" + Ma + "," + li + " L" + I + "," + ha + " L" + Ca + "," + gi + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "star32":
					var Me, Se, oe, ma, Bn, Nn, qs, Xr, we, Ee, Ga, Yn, ur, D1, v1, I, G, Z, he, Oe, Ke, xa, Ta, Ja, Ct, Fr, dr, or, Mr, P, O, V, ie, Re, ha, Pa, Lt, An, Vn, Ad, Fd, Id, Cd, $e, je, Ka, Na, $t, oi, Hr, $r, U1, L1, Ra, nt, Yt, ci, Jr, qr, k1, T1, Ca, Ma, Xa, $a, It, Bt, si, hi, Vr, Qr, Yr, Kr, w1, _1, M1, F1, wa, _a, et, pt, vn, Un, gi, li, Zr, ed, ad, td, I1, C1, A1, W1, wt, yt, ar, tr, nr, fi, C = t / 2, B = n / 2, ze = t / 2, Ae = n / 2, ir = n / 4, ac = t / 4, Ue = 37500 * k, ta = 5e4 * k, me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (me !== void 0) {
						var r = me.attrs.name;
						r == "adj" && (Ue = parseInt(me.attrs.fmla.substr(4)) * k);
					}
					Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, Se = ze * 98079 / 1e5, oe = ze * 92388 / 1e5, ma = ze * 83147 / 1e5, Bn = ze * Math.cos(.7853981634), Nn = ze * 55557 / 1e5, qs = ze * 38268 / 1e5, Xr = ze * 19509 / 1e5, we = Ae * 98079 / 1e5, Ee = Ae * 92388 / 1e5, Ga = Ae * 83147 / 1e5, Yn = Ae * Math.sin(.7853981634), ur = Ae * 55557 / 1e5, D1 = Ae * 38268 / 1e5, v1 = Ae * 19509 / 1e5, I = C - Se, G = C - oe, Z = C - ma, he = C - Bn, Oe = C - Nn, Ke = C - qs, xa = C - Xr, Ta = C + Xr, Ja = C + qs, Ct = C + Nn, Fr = C + Bn, dr = C + ma, or = C + oe, Mr = C + Se, P = B - we, O = B - Ee, V = B - Ga, ie = B - Yn, Re = B - ur, ha = B - D1, Pa = B - v1, Lt = B + v1, An = B + D1, Vn = B + ur, Ad = B + Yn, Fd = B + Ga, Id = B + Ee, Cd = B + we, $e = ze * Me / ta, je = Ae * Me / ta, Ka = $e * 99518 / 1e5, Na = $e * 95694 / 1e5, $t = $e * 88192 / 1e5, oi = $e * 77301 / 1e5, Hr = $e * 63439 / 1e5, $r = $e * 47140 / 1e5, U1 = $e * 29028 / 1e5, L1 = $e * 9802 / 1e5, Ra = je * 99518 / 1e5, nt = je * 95694 / 1e5, Yt = je * 88192 / 1e5, ci = je * 77301 / 1e5, Jr = je * 63439 / 1e5, qr = je * 47140 / 1e5, k1 = je * 29028 / 1e5, T1 = je * 9802 / 1e5, Ca = C - Ka, Ma = C - Na, Xa = C - $t, $a = C - oi, It = C - Hr, Bt = C - $r, si = C - U1, hi = C - L1, Vr = C + L1, Qr = C + U1, Yr = C + $r, Kr = C + Hr, w1 = C + oi, _1 = C + $t, M1 = C + Na, F1 = C + Ka, wa = B - Ra, _a = B - nt, et = B - Yt, pt = B - ci, vn = B - Jr, Un = B - qr, gi = B - k1, li = B - T1, Zr = B + T1, ed = B + k1, ad = B + qr, td = B + Jr, I1 = B + ci, C1 = B + Yt, A1 = B + nt, W1 = B + Ra, wt = $e * Math.cos(.7853981634), yt = je * Math.sin(.7853981634), ar = C - wt, tr = B - yt, nr = C + wt, fi = B + yt, B - je;
					var Ie = "M0," + B + " L" + Ca + "," + li + " L" + I + "," + Pa + " L" + Ma + "," + gi + " L" + G + "," + ha + " L" + Xa + "," + Un + " L" + Z + "," + Re + " L" + $a + "," + vn + " L" + he + "," + ie + " L" + It + "," + pt + " L" + Oe + "," + V + " L" + Bt + "," + et + " L" + Ke + "," + O + " L" + si + "," + _a + " L" + xa + "," + P + " L" + hi + "," + wa + " L" + C + ",0 L" + Vr + "," + wa + " L" + Ta + "," + P + " L" + Qr + "," + _a + " L" + Ja + "," + O + " L" + Yr + "," + et + " L" + Ct + "," + V + " L" + Kr + "," + pt + " L" + Fr + "," + ie + " L" + w1 + "," + vn + " L" + dr + "," + Re + " L" + _1 + "," + Un + " L" + or + "," + ha + " L" + M1 + "," + gi + " L" + Mr + "," + Pa + " L" + F1 + "," + li + " L" + t + "," + B + " L" + F1 + "," + Zr + " L" + Mr + "," + Lt + " L" + M1 + "," + ed + " L" + or + "," + An + " L" + _1 + "," + ad + " L" + dr + "," + Vn + " L" + w1 + "," + td + " L" + Fr + "," + Ad + " L" + Kr + "," + I1 + " L" + Ct + "," + Fd + " L" + Yr + "," + C1 + " L" + Ja + "," + Id + " L" + Qr + "," + A1 + " L" + Ta + "," + Cd + " L" + Vr + "," + W1 + " L" + C + "," + n + " L" + hi + "," + W1 + " L" + xa + "," + Cd + " L" + si + "," + A1 + " L" + Ke + "," + Id + " L" + Bt + "," + C1 + " L" + Oe + "," + Fd + " L" + It + "," + I1 + " L" + he + "," + Ad + " L" + $a + "," + td + " L" + Z + "," + Vn + " L" + Xa + "," + ad + " L" + G + "," + An + " L" + Ma + "," + ed + " L" + I + "," + Lt + " L" + Ca + "," + Zr + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "pie":
				case "pieWedge":
				case "arc":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), j, R, hs, Ud, gs, tc;
					M == "pie" ? (j = 0, R = 270, hs = n, tc = !0) : M == "pieWedge" ? (j = 180, R = 270, hs = 2 * n, tc = !0) : M == "arc" && (j = 270, R = 0, hs = n, tc = !1), me !== void 0 && (Ud = c(me, ["attrs", "fmla"]), gs = Ud, Ud === void 0 && (Ud = me[0].attrs.fmla, gs = me[1].attrs.fmla), Ud !== void 0 && (j = parseInt(Ud.substr(4)) / 6e4), gs !== void 0 && (R = parseInt(gs.substr(4)) / 6e4));
					var bg = C2(hs, t, j, R, tc);
					p += "<path   d='" + bg[0] + "' transform='" + bg[1] + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "chord":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = 45, xe, qe = 270;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), Je = parseInt(be.substr(4)) / 6e4) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), qe = parseInt(xe.substr(4)) / 6e4);
					}
					var Ve = n / 2, Sa = t / 2, _e = ae(Sa, Ve, Sa, Ve, Je, qe, !0);
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "frame":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), j = 12500 * k, q = 5e4 * k, ee = 1e5 * k;
					me !== void 0 && (j = parseInt(me.substr(4)) * k);
					var te, I, he, ie;
					j < 0 ? te = 0 : j > q ? te = q : te = j, I = Math.min(t, n) * te / ee, he = t - I, ie = n - I;
					var Ie = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " zM" + I + "," + I + " L" + I + "," + ie + " L" + he + "," + ie + " L" + he + "," + I + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "donut":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 25e3 * k, q = 5e4 * k, ee = 1e5 * k;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var Me, qn, $e, je;
					Ue < 0 ? Me = 0 : Ue > q ? Me = q : Me = Ue, qn = Math.min(t, n) * Me / ee, $e = t / 2 - qn, je = n / 2 - qn;
					var Ie = "M0," + n / 2 + ae(t / 2, n / 2, t / 2, n / 2, 180, 270, !1).replace("M", "L") + ae(t / 2, n / 2, t / 2, n / 2, 270, 360, !1).replace("M", "L") + ae(t / 2, n / 2, t / 2, n / 2, 0, 90, !1).replace("M", "L") + ae(t / 2, n / 2, t / 2, n / 2, 90, 180, !1).replace("M", "L") + " zM" + qn + "," + n / 2 + ae(t / 2, n / 2, $e, je, 180, 90, !1).replace("M", "L") + ae(t / 2, n / 2, $e, je, 90, 0, !1).replace("M", "L") + ae(t / 2, n / 2, $e, je, 0, -90, !1).replace("M", "L") + ae(t / 2, n / 2, $e, je, 270, 180, !1).replace("M", "L") + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "noSmoking":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 18750 * k, q = 5e4 * k, ee = 1e5 * k;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var Me, qn, $e, je, ls, B1, P1, ug, mg, xg, S1, Et, Va, Pd, Ar, br;
					Ue < 0 ? Me = 0 : Ue > q ? Me = q : Me = Ue, qn = Math.min(t, n) * Me / ee, $e = t / 2 - qn, je = n / 2 - qn, ls = Math.atan(n / t), B1 = je * Math.cos(ls), P1 = $e * Math.sin(ls), ug = Math.sqrt(B1 * B1 + P1 * P1), mg = $e * je / ug, xg = qn / 2, S1 = Math.atan(xg / mg), Et = S1 * 2, Va = -Math.PI + Et, Ar = ls - S1, br = Ar - Math.PI;
					var yg = je * Math.cos(Ar), Dg = $e * Math.sin(Ar), _p = Math.sqrt(yg * yg + Dg * Dg), vg = $e * je / _p, Se = vg * Math.cos(Ar), we = vg * Math.sin(Ar), I = t / 2 + Se, P, P = n / 2 + we, O;
					G = t / 2 - Se, O = n / 2 - we;
					var Ug = Ar * 180 / Math.PI, Lg = br * 180 / Math.PI, kg = Va * 180 / Math.PI, Ie = "M0," + n / 2 + ae(t / 2, n / 2, t / 2, n / 2, 180, 270, !1).replace("M", "L") + ae(t / 2, n / 2, t / 2, n / 2, 270, 360, !1).replace("M", "L") + ae(t / 2, n / 2, t / 2, n / 2, 0, 90, !1).replace("M", "L") + ae(t / 2, n / 2, t / 2, n / 2, 90, 180, !1).replace("M", "L") + " zM" + I + "," + P + ae(t / 2, n / 2, $e, je, Ug, Ug + kg, !1).replace("M", "L") + " zM" + G + "," + O + ae(t / 2, n / 2, $e, je, Lg, Lg + kg, !1).replace("M", "L") + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "halfFrame":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = 3.5, xe, qe = 3.5, Cn = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), Je = parseInt(be.substr(4)) * k) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), qe = parseInt(xe.substr(4)) * k);
					}
					var Ze = Math.min(t, n), fa = Cn * t / Ze, te, ye;
					qe < 0 ? ye = 0 : qe > fa ? ye = fa : ye = qe;
					var I = Ze * ye / Cn, ms = n * I / t, id = n - ms, ea = Cn * id / Ze;
					Je < 0 ? te = 0 : Je > ea ? te = ea : te = Je;
					var P = Ze * te / Cn, oe = P * t / n, G = t - oe, Ee = I * n / t, O = n - Ee, Ie = "M0,0 L" + t + ",0 L" + G + "," + P + " L" + I + "," + P + " L" + I + "," + O + " L0," + n + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "blockArc":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 180, xe, R = 0, Ye, fe = 25e3 * k, q = 5e4 * k, ee = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) / 6e4) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) / 6e4) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var Ea, $n, Xe, fs, Tg, Va, ld, nc = 360;
					j < 0 ? Ea = 0 : j > nc ? Ea = nc : Ea = j, R < 0 ? $n = 0 : R > nc ? $n = nc : $n = R, fe < 0 ? Xe = 0 : fe > q ? Xe = q : Xe = fe, fs = $n - Ea, Tg = fs + nc, Va = fs > 0 ? fs : Tg, ld = -Va;
					var ki = Ea + Va, Mp = $n + ld, Ld, kd, Se, we, I, P, ps = Ea * Math.PI / 180, bs = $n * Math.PI / 180, ze = t / 2, Ae = n / 2, C = t / 2, B = n / 2;
					Ea > 90 && Ea < 270 ? (Ld = ze * Math.sin(Math.PI / 2 - ps), kd = Ae * Math.cos(Math.PI / 2 - ps), Se = ze * Math.cos(Math.atan(kd / Ld)), we = Ae * Math.sin(Math.atan(kd / Ld)), I = C - Se, P = B - we) : (Ld = ze * Math.sin(ps), kd = Ae * Math.cos(ps), Se = ze * Math.cos(Math.atan(Ld / kd)), we = Ae * Math.sin(Math.atan(Ld / kd)), I = C + Se, P = B + we);
					var qn = Math.min(t, n) * Xe / ee, $e = ze - qn, je = Ae - qn, Td, wd, oe, Ee, G, O;
					ki <= 450 && ki > 270 || ki >= 630 && ki < 720 ? (Td = $e * Math.sin(bs), wd = je * Math.cos(bs), oe = $e * Math.cos(Math.atan(Td / wd)), Ee = je * Math.sin(Math.atan(Td / wd)), G = C + oe, O = B + Ee) : (Td = $e * Math.sin(Math.PI / 2 - bs), wd = je * Math.cos(Math.PI / 2 - bs), oe = $e * Math.cos(Math.atan(wd / Td)), Ee = je * Math.sin(Math.atan(wd / Td)), G = C - oe, O = B - Ee);
					var Ie = "M" + I + "," + P + ae(ze, Ae, ze, Ae, Ea, ki, !1).replace("M", "L") + " L" + G + "," + O + ae(ze, Ae, $e, je, $n, Mp, !1).replace("M", "L") + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "bracePair":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 8333 * k, q = 25e3 * k, ee = 5e4 * k, la = 1e5 * k;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var B = n / 2, ic = 360, ba = 180, ka = 90, La = 270, Me, I, G, Z, he, O, V, ie;
					Ue < 0 ? Me = 0 : Ue > q ? Me = q : Me = Ue;
					var Ze = Math.min(t, n);
					I = Ze * Me / la, G = Ze * Me / ee, Z = t - G, he = t - I, O = B - I, V = B + I, ie = n - I;
					var Ie = "M" + G + "," + n + ae(G, ie, I, I, ka, ba, !1).replace("M", "L") + " L" + I + "," + V + ae(0, V, I, I, 0, -ka, !1).replace("M", "L") + ae(0, O, I, I, ka, 0, !1).replace("M", "L") + " L" + I + "," + I + ae(G, I, I, I, ba, La, !1).replace("M", "L") + " M" + Z + ",0" + ae(Z, I, I, I, La, ic, !1).replace("M", "L") + " L" + he + "," + O + ae(t, O, I, I, ba, ka, !1).replace("M", "L") + ae(t, V, I, I, La, ba, !1).replace("M", "L") + " L" + he + "," + ie + ae(Z, ie, I, I, 0, ka, !1).replace("M", "L");
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftBrace":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 8333 * k, xe, R = 5e4 * k, ee = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k);
					}
					var B = n / 2, ba = 180, ka = 90, La = 270, te, ye, Aa, Fa, Dt, P, O, V, ie;
					R < 0 ? ye = 0 : R > ee ? ye = ee : ye = R;
					var Ze = Math.min(t, n);
					Aa = ee - ye, Aa < ye ? Fa = Aa : Fa = ye, Dt = Fa / 2;
					var ea = Dt * n / Ze;
					j < 0 ? te = 0 : j > ea ? te = ea : te = j, P = Ze * te / ee, V = n * ye / ee, O = V - P, ie = V + P;
					var Ie = "M" + t + "," + n + ae(t, n - P, t / 2, P, ka, ba, !1).replace("M", "L") + " L" + t / 2 + "," + ie + ae(0, ie, t / 2, P, 0, -ka, !1).replace("M", "L") + ae(0, O, t / 2, P, ka, 0, !1).replace("M", "L") + " L" + t / 2 + "," + P + ae(t, P, t / 2, P, ba, La, !1).replace("M", "L");
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "rightBrace":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 8333 * k, xe, R = 5e4 * k, ee = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k);
					}
					var B = n / 2, ic = 360, ba = 180, ka = 90, La = 270, te, ye, Aa, Fa, Dt, P, O, V, ie;
					R < 0 ? ye = 0 : R > ee ? ye = ee : ye = R;
					var Ze = Math.min(t, n);
					Aa = ee - ye, Aa < ye ? Fa = Aa : Fa = ye, Dt = Fa / 2;
					var ea = Dt * n / Ze;
					j < 0 ? te = 0 : j > ea ? te = ea : te = j, P = Ze * te / ee, V = n * ye / ee, O = V - P, ie = n - P;
					var Ie = "M0,0" + ae(0, P, t / 2, P, La, ic, !1).replace("M", "L") + " L" + t / 2 + "," + O + ae(t, O, t / 2, P, ba, ka, !1).replace("M", "L") + ae(t, V + P, t / 2, P, La, ba, !1).replace("M", "L") + " L" + t / 2 + "," + ie + ae(0, ie, t / 2, P, 0, ka, !1).replace("M", "L");
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "bracketPair":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 16667 * k, q = 5e4 * k, ee = 1e5 * k;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var ra = t, Qe = n, ba = 180, ka = 90, La = 270, Me, I, G, O;
					Ue < 0 ? Me = 0 : Ue > q ? Me = q : Me = Ue, I = Math.min(t, n) * Me / ee, G = ra - I, O = Qe - I;
					var Ie = ae(I, I, I, I, La, ba, !1) + ae(I, O, I, I, ba, ka, !1).replace("M", "L") + ae(G, I, I, I, La, La + ka, !1) + ae(G, O, I, I, 0, ka, !1).replace("M", "L");
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftBracket":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 8333 * k, q = 5e4 * k, ee = 1e5 * k, ta = q * n / Math.min(t, n);
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var ra = t, Qe = n, ba = 180, ka = 90, La = 270, Me, P, O;
					Ue < 0 ? Me = 0 : Ue > ta ? Me = ta : Me = Ue, P = Math.min(t, n) * Me / ee, P > t && (P = t), O = Qe - P;
					var Ie = "M" + ra + "," + Qe + ae(P, O, P, P, ka, ba, !1).replace("M", "L") + " L0," + P + ae(P, P, P, P, ba, La, !1).replace("M", "L") + " L" + ra + ",0";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "rightBracket":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 8333 * k, q = 5e4 * k, ee = 1e5 * k, ta = q * n / Math.min(t, n);
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var ic = 360, ba = 180, ka = 90, La = 270, Me, P, O, V;
					Ue < 0 ? Me = 0 : Ue > ta ? Me = ta : Me = Ue, P = Math.min(t, n) * Me / ee, O = n - P, V = t - P;
					var Ie = "M0," + n + ae(V, O, P, P, ka, 0, !1).replace("M", "L") + " L" + t + "," + n / 2 + ae(V, P, P, P, ic, La, !1).replace("M", "L") + " L0,0";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "moon":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = .5;
					me !== void 0 && (Ue = parseInt(me.substr(4)) / 1e5);
					var Ae = n / 2, ba = 180, ka = 90, R = (1 - Ue) * t, Ie = "M" + t + "," + n + ae(t, Ae, t, Ae, ka, ka + ba, !1).replace("M", "L") + ae(t, Ae, R, Ae, ka + ba, ka, !1).replace("M", "L") + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "corner":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = 5e4 * k, xe, qe = 5e4 * k, Cn = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), Je = parseInt(be.substr(4)) * k) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), qe = parseInt(xe.substr(4)) * k);
					}
					var Ze = Math.min(t, n), ea = Cn * n / Ze, fa = Cn * t / Ze, te, ye, I, we, P;
					Je < 0 ? te = 0 : Je > ea ? te = ea : te = Je, qe < 0 ? ye = 0 : qe > fa ? ye = fa : ye = qe, I = Ze * ye / Cn, we = Ze * te / Cn, P = n - we;
					var Ie = "M0,0 L" + I + ",0 L" + I + "," + P + " L" + t + "," + P + " L" + t + "," + n + " L0," + n + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "diagStripe":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Je = 5e4 * k, Cn = 1e5 * k;
					me !== void 0 && (Je = parseInt(me.substr(4)) * k);
					var te, G, O;
					Je < 0 ? te = 0 : Je > Cn ? te = Cn : te = Je, G = t * te / Cn, O = n * te / Cn;
					var Ie = "M0," + O + " L" + G + ",0 L" + t + ",0 L0," + n + " z";
					p += "<path   d='" + Ie + "'  fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "gear6":
				case "gear9":
					ke = 0;
					var Fp = M.substr(4), Ie = A2(t, n / 3.5, parseInt(Fp));
					p += "<path   d='" + Ie + "' transform='rotate(20," + 3 / 7 * n + "," + 3 / 7 * n + ")' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "bentConnector3":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), _d = .5;
					me !== void 0 && (_d = parseInt(me.substr(4)) / 1e5, p += " <polyline points='0 0," + _d * t + " 0," + _d * t + " " + n + "," + t + " " + n + "' fill='transparent'' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' ", ga !== void 0 && (ga.type === "triangle" || ga.type === "arrow") && (p += "marker-start='url(#markerTriangle_" + l + ")' "), Ba !== void 0 && (Ba.type === "triangle" || Ba.type === "arrow") && (p += "marker-end='url(#markerTriangle_" + l + ")' "), p += "/>");
					break;
				case "plus":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), j = .25;
					me !== void 0 && (j = parseInt(me.substr(4)) / 1e5);
					var R = 1 - j;
					p += " <polygon points='" + j * t + " 0," + j * t + " " + j * n + ",0 " + j * n + ",0 " + R * n + "," + j * t + " " + R * n + "," + j * t + " " + n + "," + R * t + " " + n + "," + R * t + " " + R * n + "," + t + " " + R * n + "," + +t + " " + j * n + "," + R * t + " " + j * n + "," + R * t + " 0' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "teardrop":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), j = 1e5 * k, rc = j, us = 2e5 * k;
					me !== void 0 && (j = parseInt(me.substr(4)) * k);
					var te, E1, wg, ca, _g, Mg, Se, we, I, P, G, O, z1;
					j < 0 ? te = 0 : j > us ? te = us : te = j, E1 = Math.sqrt(2), wg = E1 * (t / 2), ca = E1 * (n / 2), _g = wg * te / rc, Mg = ca * te / rc, z1 = 45 * Math.PI / 180, Se = _g * Math.cos(z1), we = Mg * Math.cos(z1), I = t / 2 + Se, P = n / 2 - we, G = (t / 2 + I) / 2, O = (n / 2 + P) / 2;
					var _e = ae(t / 2, n / 2, t / 2, n / 2, 180, 270, !1) + "Q " + G + ",0 " + I + "," + P + "Q " + t + "," + O + " " + t + "," + n / 2 + ae(t / 2, n / 2, t / 2, n / 2, 0, 90, !1).replace("M", "L") + ae(t / 2, n / 2, t / 2, n / 2, 90, 180, !1).replace("M", "L") + " z";
					p += "<path   d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "plaque":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), j = 16667 * k, rc = 5e4 * k, us = 1e5 * k;
					me !== void 0 && (j = parseInt(me.substr(4)) * k);
					var te, I, G, O;
					j < 0 ? te = 0 : j > rc ? te = rc : te = j, I = te * Math.min(t, n) / us, G = t - I, O = n - I;
					var _e = "M0," + I + ae(0, 0, I, I, 90, 0, !1).replace("M", "L") + " L" + G + ",0" + ae(t, 0, I, I, 180, 90, !1).replace("M", "L") + " L" + t + "," + O + ae(t, n, I, I, 270, 180, !1).replace("M", "L") + " L" + I + "," + n + ae(0, n, I, I, 0, -90, !1).replace("M", "L") + " z";
					p += "<path   d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "sun":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), ge = k, j = 25e3 * ge, q = 12500 * ge, ee = 46875 * ge;
					me !== void 0 && (j = parseInt(me.substr(4)) * ge);
					var te;
					j < q ? te = q : j > ee ? te = ee : te = j;
					var nd = 5e4 * ge, st = 1e5 * ge, dc = nd - te, ms = dc * (30274 * ge) / (32768 * ge), id = dc * (12540 * ge) / (32768 * ge), j1 = ms + nd, xs = id + nd, oc = nd - ms, rd = nd - id, _r = dc * (23170 * ge) / (32768 * ge), rr = nd + _r, da = nd - _r, Ha = oc * 3 / 4, aa = rd * 3 / 4, ja = Ha + 3662 * ge, Ne = aa + 36620 * ge, at = aa + 12500 * ge, ht = st - Ha, xt = st - ja, ot = st - Ne, ln = st - at, Fg = t * (18436 * ge) / (21600 * ge), Ig = n * (3163 * ge) / (21600 * ge), Cg = t * (3163 * ge) / (21600 * ge), Ag = n * (18436 * ge) / (21600 * ge), Ta = t * rr / st, Ja = t * da / st, Ct = t * Ha / st, dr = t * ja / st, or = t * Ne / st, Mr = t * at / st, Md = t * ht / st, Wg = t * xt / st, Bg = t * ot / st, Pg = t * ln / st, Ip = t * te / st, Sa = t * dc / st, Ve = n * dc / st, Lt = n * rr / st, An = n * da / st, Vn = n * Ha / st, Fd = n * ja / st, Id = n * Ne / st, Cd = n * at / st, Sg = n * ht / st, Eg = n * xt / st, zg = n * ot / st, jg = n * ln / st, _e = "M" + t + "," + n / 2 + " L" + Md + "," + jg + " L" + Md + "," + Cd + "z M" + Fg + "," + Ig + " L" + Wg + "," + zg + " L" + or + "," + Fd + "z M" + t / 2 + ",0 L" + Pg + "," + Vn + " L" + Mr + "," + Vn + "z M" + Cg + "," + Ig + " L" + Bg + "," + Fd + " L" + dr + "," + zg + "z M0," + n / 2 + " L" + Ct + "," + Cd + " L" + Ct + "," + jg + "z M" + Cg + "," + Ag + " L" + dr + "," + Id + " L" + Bg + "," + Eg + "z M" + t / 2 + "," + n + " L" + Mr + "," + Sg + " L" + Pg + "," + Sg + "z M" + Fg + "," + Ag + " L" + or + "," + Eg + " L" + Wg + "," + Id + " z M" + Ip + "," + n / 2 + ae(t / 2, n / 2, Sa, Ve, 180, 540, !1).replace("M", "L") + " z";
					p += "<path   d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "heart":
					var Se = t * 49 / 48, oe = t * 10 / 48, I = t / 2 - Se, G = t / 2 - oe, Z = t / 2 + oe, he = t / 2 + Se, P = -n / 3, _e = "M" + t / 2 + "," + n / 4 + "C" + Z + "," + P + " " + he + "," + n / 4 + " " + t / 2 + "," + n + "C" + I + "," + n / 4 + " " + G + "," + P + " " + t / 2 + "," + n / 4 + " z";
					p += "<path   d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "lightningBolt":
					var I = t * 5022 / 21600, G = t * 11050 / 21600, Z = t * 8472 / 21600, he = t * 8757 / 21600, Oe = t * 10012 / 21600, Ke = t * 14767 / 21600, xa = t * 12222 / 21600, Ta = t * 12860 / 21600, Ja = t * 13917 / 21600, Ct = t * 7602 / 21600, Fr = t * 16577 / 21600, P = n * 3890 / 21600, O = n * 6080 / 21600, V = n * 6797 / 21600, ie = n * 7437 / 21600, Re = n * 12877 / 21600, ha = n * 9705 / 21600, Pa = n * 12007 / 21600, Lt = n * 13987 / 21600, An = n * 8382 / 21600, Vn = n * 14277 / 21600, Ad = n * 14915 / 21600, _e = "M" + Z + ",0 L" + Ta + "," + O + " L" + G + "," + V + " L" + Fr + "," + Pa + " L" + Ke + "," + Re + " L" + t + "," + n + " L" + Oe + "," + Ad + " L" + xa + "," + Lt + " L" + I + "," + ha + " L" + Ct + "," + An + " L0," + P + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "cube":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), ge = k, Ue = 25e3 * ge;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * ge);
					var _e, ee = 1e5 * ge, ue = Math.min(t, n), Me = Ue < 0 ? 0 : Ue > ee ? ee : Ue, P = ue * Me / ee, ie = n - P, he = t - P;
					_e = "M0," + P + " L" + P + ",0 L" + t + ",0 L" + t + "," + ie + " L" + he + "," + n + " L0," + n + " zM0," + P + " L" + he + "," + P + " M" + he + "," + P + " L" + t + ",0M" + he + "," + P + " L" + he + "," + n, p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "bevel":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), ge = k, Ue = 12500 * ge;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * ge);
					var _e, q = 5e4 * ge, ee = 1e5 * ge, ue = Math.min(t, n), Me = Ue < 0 ? 0 : Ue > q ? q : Ue, I = ue * Me / ee, G = t - I, O = n - I;
					_e = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " z M" + I + "," + I + " L" + G + "," + I + " L" + G + "," + O + " L" + I + "," + O + " z M0,0 L" + I + "," + I + " M0," + n + " L" + I + "," + O + " M" + t + ",0 L" + G + "," + I + " M" + t + "," + n + " L" + G + "," + O, p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "foldedCorner":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), ge = k, Ue = 16667 * ge;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * ge);
					var _e, q = 5e4 * ge, ee = 1e5 * ge, ue = Math.min(t, n), Me = Ue < 0 ? 0 : Ue > q ? q : Ue, Ee = ue * Me / ee, we = Ee / 5, I = t - Ee, G = I + we, O = n - Ee, P = O + we;
					_e = "M" + I + "," + n + " L" + G + "," + P + " L" + t + "," + O + " L" + I + "," + n + " L0," + n + " L0,0 L" + t + ",0 L" + t + "," + O, p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "cloud":
				case "cloudCallout":
					var Og = t * 3900 / 43200, I = t * 4693 / 43200, G = t * 6928 / 43200, Z = t * 16478 / 43200, he = t * 28827 / 43200, Oe = t * 34129 / 43200, Ke = t * 41798 / 43200, xa = t * 38324 / 43200, Ta = t * 29078 / 43200, Ja = t * 22141 / 43200, Ct = t * 14e3 / 43200, Fr = t * 4127 / 43200, Gg = n * 14370 / 43200, P = n * 26177 / 43200, O = n * 34899 / 43200, V = n * 39090 / 43200, ie = n * 34751 / 43200, Re = n * 22954 / 43200, ha = n * 15354 / 43200, Pa = n * 5426 / 43200, Lt = n * 3952 / 43200, An = n * 4720 / 43200, Vn = n * 5192 / 43200, Ad = n * 15789 / 43200, O1, G1, N1, R1, ys, i0, Pc, n0, Wc, Ng = t * 6753 / 43200, Rg = n * 9190 / 43200, Ds = t * 5333 / 43200, Xg = n * 7267 / 43200, Hg = t * 4365 / 43200, vs = n * 5945 / 43200, $g = t * 4857 / 43200, Jg = n * 6595 / 43200, qg = n * 7273 / 43200, Vg = t * 6775 / 43200, Qg = n * 9220 / 43200, Yg = t * 5785 / 43200, Kg = n * 7867 / 43200, Zg = t * 6752 / 43200, el = n * 9215 / 43200, al = t * 7720 / 43200, tl = n * 10543 / 43200, nl = t * 4360 / 43200, il = n * 5918 / 43200, rl = t * 4345 / 43200, Us = -11429249 / 6e4, Cp = 7426832 / 6e4, Ls = -8646143 / 6e4, Ap = 5396714 / 6e4, ks = -8748475 / 6e4, Wp = 5983381 / 6e4, Ts = -7859164 / 6e4, Bp = 7034504 / 6e4, ws = -4722533 / 6e4, Pp = 6541615 / 6e4, _s = -2776035 / 6e4, Sp = 7816140 / 6e4, Ms = 37501 / 6e4, Ep = 6842e3 / 6e4, Fs = 1347096 / 6e4, zp = 6910353 / 6e4, Is = 3974558 / 6e4, jp = 4542661 / 6e4, Cs = -16496525 / 6e4, Op = 8804134 / 6e4, As = -14809710 / 6e4, Gp = 9151131 / 6e4, Np = Og - Ng * Math.cos(Us * Math.PI / 180), pi, Cr, Ws, cc, dl, ol, cl, sl, hl, gl, Rp = Gg - Rg * Math.sin(Us * Math.PI / 180), cr, Ir, Bs, Ps, ll, fl, pl, bl, ul, ml, X1 = ae(Np, Rp, Ng, Rg, Us, Us + Cp, !1).replace("M", "L"), Ss, Es, zs, js, Os, Gs, Ns, Rs, Xs, xl, yl = X1.substr(X1.lastIndexOf("L") + 1).split(" "), H1, $1, J1, q1, V1, Q1, Y1, K1, Z1;
					pi = parseInt(yl[0]) - Ds * Math.cos(Ls * Math.PI / 180), cr = parseInt(yl[1]) - Xg * Math.sin(Ls * Math.PI / 180), Ss = ae(pi, cr, Ds, Xg, Ls, Ls + Ap, !1).replace("M", "L"), H1 = Ss.substr(Ss.lastIndexOf("L") + 1).split(" "), Cr = parseInt(H1[0]) - Hg * Math.cos(ks * Math.PI / 180), Ir = parseInt(H1[1]) - vs * Math.sin(ks * Math.PI / 180), Es = ae(Cr, Ir, Hg, vs, ks, ks + Wp, !1).replace("M", "L"), $1 = Es.substr(Es.lastIndexOf("L") + 1).split(" "), Ws = parseInt($1[0]) - $g * Math.cos(Ts * Math.PI / 180), Bs = parseInt($1[1]) - Jg * Math.sin(Ts * Math.PI / 180), zs = ae(Ws, Bs, $g, Jg, Ts, Ts + Bp, !1).replace("M", "L"), J1 = zs.substr(zs.lastIndexOf("L") + 1).split(" "), cc = parseInt(J1[0]) - Ds * Math.cos(ws * Math.PI / 180), Ps = parseInt(J1[1]) - qg * Math.sin(ws * Math.PI / 180), js = ae(cc, Ps, Ds, qg, ws, ws + Pp, !1).replace("M", "L"), q1 = js.substr(js.lastIndexOf("L") + 1).split(" "), dl = parseInt(q1[0]) - Vg * Math.cos(_s * Math.PI / 180), ll = parseInt(q1[1]) - Qg * Math.sin(_s * Math.PI / 180), Os = ae(dl, ll, Vg, Qg, _s, _s + Sp, !1).replace("M", "L"), V1 = Os.substr(Os.lastIndexOf("L") + 1).split(" "), ol = parseInt(V1[0]) - Yg * Math.cos(Ms * Math.PI / 180), fl = parseInt(V1[1]) - Kg * Math.sin(Ms * Math.PI / 180), Gs = ae(ol, fl, Yg, Kg, Ms, Ms + Ep, !1).replace("M", "L"), Q1 = Gs.substr(Gs.lastIndexOf("L") + 1).split(" "), cl = parseInt(Q1[0]) - Zg * Math.cos(Fs * Math.PI / 180), pl = parseInt(Q1[1]) - el * Math.sin(Fs * Math.PI / 180), Ns = ae(cl, pl, Zg, el, Fs, Fs + zp, !1).replace("M", "L"), Y1 = Ns.substr(Ns.lastIndexOf("L") + 1).split(" "), sl = parseInt(Y1[0]) - al * Math.cos(Is * Math.PI / 180), bl = parseInt(Y1[1]) - tl * Math.sin(Is * Math.PI / 180), Rs = ae(sl, bl, al, tl, Is, Is + jp, !1).replace("M", "L"), K1 = Rs.substr(Rs.lastIndexOf("L") + 1).split(" "), hl = parseInt(K1[0]) - nl * Math.cos(Cs * Math.PI / 180), ul = parseInt(K1[1]) - il * Math.sin(Cs * Math.PI / 180), Xs = ae(hl, ul, nl, il, Cs, Cs + Op, !1).replace("M", "L"), Z1 = Xs.substr(Xs.lastIndexOf("L") + 1).split(" "), gl = parseInt(Z1[0]) - rl * Math.cos(As * Math.PI / 180), ml = parseInt(Z1[1]) - vs * Math.sin(As * Math.PI / 180), xl = ae(gl, ml, rl, vs, As, As + Gp, !1).replace("M", "L");
					var Dl = "M" + Og + "," + Gg + X1 + Ss + Es + zs + js + Os + Gs + Ns + Rs + Xs + xl + " z";
					if (M == "cloudCallout") {
						var F = c(e, [
							"p:spPr",
							"a:prstGeom",
							"a:avLst",
							"a:gd"
						]), ge = k, be, j = -20833 * ge, xe, R = 62500 * ge;
						if (F !== void 0) for (var A = 0; A < F.length; A++) {
							var Y = c(F[A], ["attrs", "name"]);
							Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * ge) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * ge);
						}
						var _e, ee = 1e5 * ge, ue = Math.min(t, n), ze = t / 2, Ae = n / 2, rt = t * j / ee, ct = n * R / ee, Pt = ze + rt, St = Ae + ct, vl = Ae * Math.cos(Math.atan(ct / rt)), Ul = ze * Math.sin(Math.atan(ct / rt)), id = ze * Math.cos(Math.atan(Ul / vl)), j1 = Ae * Math.sin(Math.atan(Ul / vl)), xs, oc, rd, _r, rr, da, Ha, aa, ja, Ne, at, ht, xt, ot, ln, yn, Vt, Rt, Fn, In, Xt, Qt, Dn, Ll, e0, a0;
						j >= 0 ? (xs = ze + id, oc = Ae + j1) : (xs = ze - id, oc = Ae - j1), rd = xs - Pt, _r = oc - St, rr = Math.sqrt(rd * rd + _r * _r), da = ue * 6600 / 21600, Ha = rr - da, aa = Ha / 3, ja = ue * 1800 / 21600, Ne = aa + ja, at = Ne * rd / rr, ht = Ne * _r / rr, xt = at + Pt, ot = ht + St, ln = ue * 4800 / 21600, yn = aa * 2, Vt = ln + yn, Rt = Vt * rd / rr, Fn = Vt * _r / rr, In = Rt + Pt, Xt = Fn + St, Qt = ue * 1200 / 21600, Dn = ue * 600 / 21600, Ll = Pt + Dn, e0 = xt + Qt, a0 = In + ja, _e = ae(Ll - Dn, St, Dn, Dn, 0, 360, !1) + " z M" + e0 + "," + ot + ae(e0 - Qt, ot, Qt, Qt, 0, 360, !1).replace("M", "L") + " z M" + a0 + "," + Xt + ae(a0 - ja, Xt, ja, ja, 0, 360, !1).replace("M", "L") + " z", Dl += _e;
					}
					p += "<path d='" + Dl + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "smileyFace":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), ge = k, Ue = 4653 * ge;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * ge);
					var _e, q = 5e4 * ge, ee = 1e5 * ge, la = 4653 * ge, ue = Math.min(t, n), Me, I, G, Z, he, P, V, Ee, O, ie, Ga, Re, Sa, Ve, ze = t / 2, Ae = n / 2;
					Me = Ue < -la ? -la : Ue > la ? la : Ue, I = t * 4969 / 21699, G = t * 6215 / 21600, Z = t * 13135 / 21600, he = t * 16640 / 21600, P = n * 7570 / 21600, V = n * 16515 / 21600, Ee = n * Me / ee, O = V - Ee, ie = V + Ee, Ga = n * Me / q, Re = ie + Ga, Sa = t * 1125 / 21600, Ve = n * 1125 / 21600;
					var pi = G - Sa * Math.cos(Math.PI), cr = P - Ve * Math.sin(Math.PI), Cr = Z - Sa * Math.cos(Math.PI);
					_e = ae(pi, cr, Sa, Ve, 180, 540, !1) + ae(Cr, cr, Sa, Ve, 180, 540, !1) + " M" + I + "," + O + " Q" + ze + "," + Re + " " + he + "," + O + " Q" + ze + "," + Re + " " + I + "," + O + " M0," + Ae + ae(ze, Ae, ze, Ae, 180, 540, !1).replace("M", "L") + " z", p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "verticalScroll":
				case "horizontalScroll":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), ge = k, Ue = 12500 * ge;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * ge);
					var _e, q = 25e3 * ge, ee = 1e5 * ge, ue = Math.min(t, n), Wa = 0, va = 0, Qe = n, ra = t, Me, it, Da, sr;
					if (Me = Ue < 0 ? 0 : Ue > q ? q : Ue, it = ue * Me / ee, Da = it / 2, sr = it / 4, M == "verticalScroll") {
						var Z = it + Da, he = it + it, Ke = ra - it, xa = ra - Da, Oe = Ke - Da, V = Qe - it, ie = Qe - Da;
						_e = "M" + it + "," + V + " L" + it + "," + Da + ae(Z, Da, Da, Da, 180, 270, !1).replace("M", "L") + " L" + xa + "," + Wa + ae(xa, Da, Da, Da, 270, 450, !1).replace("M", "L") + " L" + Ke + "," + it + " L" + Ke + "," + ie + ae(Oe, ie, Da, Da, 0, 90, !1).replace("M", "L") + " L" + Da + "," + Qe + ae(Da, ie, Da, Da, 90, 270, !1).replace("M", "L") + " z M" + Z + "," + Wa + ae(Z, Da, Da, Da, 270, 450, !1).replace("M", "L") + ae(Z, Z / 2, sr, sr, 90, 270, !1).replace("M", "L") + " L" + he + "," + Da + " M" + Ke + "," + it + " L" + Z + "," + it + " M" + it + "," + ie + ae(Da, ie, Da, Da, 0, 270, !1).replace("M", "L") + ae(Da, (ie + V) / 2, sr, sr, 270, 450, !1).replace("M", "L") + " z M" + it + "," + ie + " L" + it + "," + V;
					} else if (M == "horizontalScroll") {
						var V = it + Da, ie = it + it, ha = Qe - it, Pa = Qe - Da, Re = ha - Da, Z = ra - it, he = ra - Da;
						_e = "M" + va + "," + V + ae(Da, V, Da, Da, 180, 270, !1).replace("M", "L") + " L" + Z + "," + it + " L" + Z + "," + Da + ae(he, Da, Da, Da, 180, 360, !1).replace("M", "L") + " L" + ra + "," + Re + ae(he, Re, Da, Da, 0, 90, !1).replace("M", "L") + " L" + it + "," + ha + " L" + it + "," + Pa + ae(Da, Pa, Da, Da, 0, 180, !1).replace("M", "L") + " zM" + he + "," + it + ae(he, Da, Da, Da, 90, -180, !1).replace("M", "L") + ae((Z + he) / 2, Da, sr, sr, 180, 0, !1).replace("M", "L") + " z M" + he + "," + it + " L" + Z + "," + it + " M" + Da + "," + ie + " L" + Da + "," + V + ae(V / 2, V, sr, sr, 180, 360, !1).replace("M", "L") + ae(Da, V, Da, Da, 0, 180, !1).replace("M", "L") + " M" + it + "," + V + " L" + it + "," + ha;
					}
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "wedgeEllipseCallout":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), ge = k, be, j = -20833 * ge, xe, R = 62500 * ge;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * ge) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * ge);
					}
					var _e, q = 1e5 * k, dd = 11 * Math.PI / 180, ue = Math.min(t, n), rt, ct, Pt, St, Wd, Bd, t0, Ea, Pn, Se, we, I, P, oe, Ee, G, O, Ar, Rn, Va, B = n / 2, C = t / 2;
					rt = t * j / q, ct = n * R / q, Pt = C + rt, St = B + ct, Wd = rt * n, Bd = ct * t, t0 = Math.atan(Bd / Wd), Ea = t0 + dd, Pn = t0 - dd, console.log("dxPos: ", rt, "dyPos: ", ct), Se = C * Math.cos(Ea), we = B * Math.sin(Ea), oe = C * Math.cos(Pn), Ee = B * Math.sin(Pn), rt >= 0 ? (I = C + Se, P = B + we, G = C + oe, O = B + Ee) : (I = C - Se, P = B - we, G = C - oe, O = B - Ee), _e = "M" + I + "," + P + " L" + Pt + "," + St + " L" + G + "," + O + ae(C, B, C, B, 0, 360, !0), p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "wedgeRectCallout":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), ge = k, be, j = -20833 * ge, xe, R = 62500 * ge;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * ge) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * ge);
					}
					var _e, q = 1e5 * k, rt, ct, Pt, St, fr, lr, sc, hc, gc, Jt, lc, fc, I, G, pc, bc, P, O, uc, mc, xc, yc, Pd, Dc, vc, Uc, Lc, kc, Tc, wc, _c, Mc, Fc, Ic, B = n / 2, C = t / 2;
					rt = t * j / q, ct = n * R / q, Pt = C + rt, St = B + ct, fr = Pt - C, lr = St - B, sc = rt * n / t, hc = Math.abs(ct), gc = Math.abs(sc), Jt = hc - gc, lc = rt > 0 ? 7 : 2, fc = rt > 0 ? 10 : 5, I = t * lc / 12, G = t * fc / 12, pc = ct > 0 ? 7 : 2, bc = ct > 0 ? 10 : 5, P = n * pc / 12, O = n * bc / 12, uc = rt > 0 ? 0 : Pt, mc = Jt > 0 ? 0 : uc, xc = ct > 0 ? I : Pt, yc = Jt > 0 ? xc : I, Pd = rt > 0 ? Pt : t, Dc = Jt > 0 ? t : Pd, vc = ct > 0 ? Pt : I, Uc = Jt > 0 ? vc : I, Lc = rt > 0 ? P : St, kc = Jt > 0 ? P : Lc, Tc = ct > 0 ? 0 : St, wc = Jt > 0 ? Tc : 0, _c = rt > 0 ? St : P, Mc = Jt > 0 ? P : _c, Fc = ct > 0 ? St : n, Ic = Jt > 0 ? Fc : n, _e = "M0,0 L" + I + ",0 L" + yc + "," + wc + " L" + G + ",0 L" + t + ",0 L" + t + "," + P + " L" + Dc + "," + Mc + " L" + t + "," + O + " L" + t + "," + n + " L" + G + "," + n + " L" + Uc + "," + Ic + " L" + I + "," + n + " L0," + n + " L0," + O + " L" + mc + "," + kc + " L0," + P + " z", p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "wedgeRoundRectCallout":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), ge = k, be, j = -20833 * ge, xe, R = 62500 * ge, Ye, fe = 16667 * ge;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * ge) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * ge) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * ge);
					}
					var _e, q = 1e5 * k, ue = Math.min(t, n), rt, ct, Pt, St, sc, hc, gc, Jt, lc, fc, I, G, pc, bc, P, O, uc, mc, xc, yc, Pd, Dc, vc, Uc, Lc, kc, Tc, wc, _c, Mc, Fc, Ic, ft, Xn, xr, B = n / 2, C = t / 2;
					rt = t * j / q, ct = n * R / q, Pt = C + rt, St = B + ct, sc = rt * n / t, hc = Math.abs(ct), gc = Math.abs(sc), Jt = hc - gc, lc = rt > 0 ? 7 : 2, fc = rt > 0 ? 10 : 5, I = t * lc / 12, G = t * fc / 12, pc = ct > 0 ? 7 : 2, bc = ct > 0 ? 10 : 5, P = n * pc / 12, O = n * bc / 12, uc = rt > 0 ? 0 : Pt, mc = Jt > 0 ? 0 : uc, xc = ct > 0 ? I : Pt, yc = Jt > 0 ? xc : I, Pd = rt > 0 ? Pt : t, Dc = Jt > 0 ? t : Pd, vc = ct > 0 ? Pt : I, Uc = Jt > 0 ? vc : I, Lc = rt > 0 ? P : St, kc = Jt > 0 ? P : Lc, Tc = ct > 0 ? 0 : St, wc = Jt > 0 ? Tc : 0, _c = rt > 0 ? St : P, Mc = Jt > 0 ? P : _c, Fc = ct > 0 ? St : n, Ic = Jt > 0 ? Fc : n, ft = ue * fe / q, Xn = t - ft, xr = n - ft, _e = "M0," + ft + ae(ft, ft, ft, ft, 180, 270, !1).replace("M", "L") + " L" + I + ",0 L" + yc + "," + wc + " L" + G + ",0 L" + Xn + ",0" + ae(Xn, ft, ft, ft, 270, 360, !1).replace("M", "L") + " L" + t + "," + P + " L" + Dc + "," + Mc + " L" + t + "," + O + " L" + t + "," + xr + ae(Xn, xr, ft, ft, 0, 90, !1).replace("M", "L") + " L" + G + "," + n + " L" + Uc + "," + Ic + " L" + I + "," + n + " L" + ft + "," + n + ae(ft, xr, ft, ft, 90, 180, !1).replace("M", "L") + " L0," + O + " L" + mc + "," + kc + " L0," + P + " z", p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "accentBorderCallout1":
				case "accentBorderCallout2":
				case "accentBorderCallout3":
				case "borderCallout1":
				case "borderCallout2":
				case "borderCallout3":
				case "accentCallout1":
				case "accentCallout2":
				case "accentCallout3":
				case "callout1":
				case "callout2":
				case "callout3":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), ge = k, be, j = 18750 * ge, xe, R = -8333 * ge, Ye, fe = 18750 * ge, qa, oa = -16667 * ge, Di, kt = 1e5 * ge, kl, hr = -16667 * ge, Tl, Cc = 112963 * ge, wl, Ac = -8333 * ge;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * ge) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * ge) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * ge) : Y == "adj4" ? (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) * ge) : Y == "adj5" ? (Di = c(F[A], ["attrs", "fmla"]), kt = parseInt(Di.substr(4)) * ge) : Y == "adj6" ? (kl = c(F[A], ["attrs", "fmla"]), hr = parseInt(kl.substr(4)) * ge) : Y == "adj7" ? (Tl = c(F[A], ["attrs", "fmla"]), Cc = parseInt(Tl.substr(4)) * ge) : Y == "adj8" && (wl = c(F[A], ["attrs", "fmla"]), Ac = parseInt(wl.substr(4)) * ge);
					}
					var _e, q = 1e5 * ge;
					switch (M) {
						case "borderCallout1":
						case "callout1":
							F === void 0 && (j = 18750 * ge, R = -8333 * ge, fe = 112500 * ge, oa = -38333 * ge);
							var P = n * j / q, I = t * R / q, O = n * fe / q, G = t * oa / q;
							_e = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " z M" + I + "," + P + " L" + G + "," + O;
							break;
						case "borderCallout2":
						case "callout2":
							F === void 0 && (j = 18750 * ge, R = -8333 * ge, fe = 18750 * ge, oa = -16667 * ge, kt = 112500 * ge, hr = -46667 * ge);
							var P = n * j / q, I = t * R / q, O = n * fe / q, G = t * oa / q, V = n * kt / q, Z = t * hr / q;
							_e = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " z M" + I + "," + P + " L" + G + "," + O + " L" + Z + "," + V + " L" + G + "," + O;
							break;
						case "borderCallout3":
						case "callout3":
							F === void 0 && (j = 18750 * ge, R = -8333 * ge, fe = 18750 * ge, oa = -16667 * ge, kt = 1e5 * ge, hr = -16667 * ge, Cc = 112963 * ge, Ac = -8333 * ge);
							var P = n * j / q, I = t * R / q, O = n * fe / q, G = t * oa / q, V = n * kt / q, Z = t * hr / q, ie = n * Cc / q, he = t * Ac / q;
							_e = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " z M" + I + "," + P + " L" + G + "," + O + " L" + Z + "," + V + " L" + he + "," + ie + " L" + Z + "," + V + " L" + G + "," + O;
							break;
						case "accentBorderCallout1":
						case "accentCallout1":
							F === void 0 && (j = 18750 * ge, R = -8333 * ge, fe = 112500 * ge, oa = -38333 * ge);
							var P = n * j / q, I = t * R / q, O = n * fe / q, G = t * oa / q;
							_e = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " z M" + I + "," + P + " L" + G + "," + O + " M" + I + ",0 L" + I + "," + n;
							break;
						case "accentBorderCallout2":
						case "accentCallout2":
							F === void 0 && (j = 18750 * ge, R = -8333 * ge, fe = 18750 * ge, oa = -16667 * ge, kt = 112500 * ge, hr = -46667 * ge);
							var P = n * j / q, I = t * R / q, O = n * fe / q, G = t * oa / q, V = n * kt / q, Z = t * hr / q;
							_e = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " z M" + I + "," + P + " L" + G + "," + O + " L" + Z + "," + V + " L" + G + "," + O + " M" + I + ",0 L" + I + "," + n;
							break;
						case "accentBorderCallout3":
						case "accentCallout3":
							F === void 0 && (j = 18750 * ge, R = -8333 * ge, fe = 18750 * ge, oa = -16667 * ge, kt = 1e5 * ge, hr = -16667 * ge, Cc = 112963 * ge, Ac = -8333 * ge);
							var P = n * j / q, I = t * R / q, O = n * fe / q, G = t * oa / q, V = n * kt / q, Z = t * hr / q, ie = n * Cc / q, he = t * Ac / q;
							_e = "M0,0 L" + t + ",0 L" + t + "," + n + " L0," + n + " z M" + I + "," + P + " L" + G + "," + O + " L" + Z + "," + V + " L" + he + "," + ie + " L" + Z + "," + V + " L" + G + "," + O + " M" + I + ",0 L" + I + "," + n;
							break;
					}
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftRightRibbon":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), ge = k, be, j = 5e4 * ge, xe, R = 5e4 * ge, Ye, fe = 16667 * ge;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * ge) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * ge) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * ge);
					}
					var _e, q = 33333 * ge, ee = 1e5 * ge, la = 2e5 * ge, lt = 4e5 * ge, ue = Math.min(t, n), Xe, ea, te, _l, fa, ye, I, he, we, Ee, Sd, Wc, Hs, n0, $s, i0, Bc, Pc, Ve, G, Z, P, O, Ut = t / 32, B = n / 2, C = t / 2;
					Xe = fe < 0 ? 0 : fe > q ? q : fe, ea = ee - Xe, te = j < 0 ? 0 : j > ea ? ea : j, _l = C - Ut, fa = ee * _l / ue, ye = R < 0 ? 0 : R > fa ? fa : R, I = ue * ye / ee, he = t - I, we = n * te / la, Ee = n * Xe / -la, Sd = B + Ee - we, Wc = B + we - Ee, Hs = Sd + we, n0 = n - Hs, $s = Hs * 2, i0 = n - $s, Bc = $s - Sd, Pc = n - Bc, Ve = Xe * ue / lt, G = C - Ut, Z = C + Ut, P = Sd + Ve, O = Pc - Ve, _e = "M0," + Hs + "L" + I + ",0L" + I + "," + Sd + "L" + C + "," + Sd + ae(C, P, Ut, Ve, 270, 450, !1).replace("M", "L") + ae(C, O, Ut, Ve, 270, 90, !1).replace("M", "L") + "L" + he + "," + Pc + "L" + he + "," + i0 + "L" + t + "," + n0 + "L" + he + "," + n + "L" + he + "," + Wc + "L" + C + "," + Wc + ae(C, Wc - Ve, Ut, Ve, 90, 180, !1).replace("M", "L") + "L" + G + "," + Bc + "L" + I + "," + Bc + "L" + I + "," + $s + " zM" + Z + "," + P + "L" + Z + "," + Pc + "M" + G + "," + O + "L" + G + "," + Bc, p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "ribbon":
				case "ribbon2":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 16667 * k, xe, R = 5e4 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k);
					}
					var _e, q = 25e3 * k, ee = 33333 * k, la = 75e3 * k, lt = 1e5 * k, Ln = 2e5 * k, Kt = 4e5 * k, C = t / 2, Wa = 0, va = 0, Qe = n, ra = t, bi = t / 8, Ut = t / 32, te, ye, Ct, oe, G, Ja, Z, Ta, Oe, Ke, he, xa, P, O, ie, V, Ve, ha;
					if (te = j < 0 ? 0 : j > ee ? ee : j, ye = R < q ? q : R > la ? la : R, Ct = ra - bi, oe = t * ye / Ln, G = C - oe, Ja = C + oe, Z = G + Ut, Ta = Ja - Ut, Oe = G + bi, Ke = Ja - bi, he = Oe - Ut, xa = Ke + Ut, Ve = n * te / Kt, M == "ribbon2") {
						var we = n * te / Ln, Ee, Pa;
						P = Qe - we, Ee = n * te / lt, O = Qe - Ee, ie = Wa + Ee, V = (ie + Qe) / 2, ha = Qe - Ve, Pa = P - Ve, _e = "M" + va + "," + Qe + " L" + bi + "," + V + " L" + va + "," + ie + " L" + G + "," + ie + " L" + G + "," + Ve + ae(Z, Ve, Ut, Ve, 180, 270, !1).replace("M", "L") + " L" + Ta + "," + Wa + ae(Ta, Ve, Ut, Ve, 270, 360, !1).replace("M", "L") + " L" + Ja + "," + ie + " L" + Ja + "," + ie + " L" + ra + "," + ie + " L" + Ct + "," + V + " L" + ra + "," + Qe + " L" + xa + "," + Qe + ae(xa, ha, Ut, Ve, 90, 270, !1).replace("M", "L") + " L" + Ta + "," + P + ae(Ta, Pa, Ut, Ve, 90, -90, !1).replace("M", "L") + " L" + Z + "," + O + ae(Z, Pa, Ut, Ve, 270, 90, !1).replace("M", "L") + " L" + he + "," + P + ae(he, ha, Ut, Ve, 270, 450, !1).replace("M", "L") + " z M" + Oe + "," + O + " L" + Oe + "," + ha + "M" + Ke + "," + ha + " L" + Ke + "," + O + "M" + G + "," + Pa + " L" + G + "," + ie + "M" + Ja + "," + ie + " L" + Ja + "," + Pa;
					} else if (M == "ribbon") {
						var Re;
						P = n * te / Ln, O = n * te / lt, ie = Qe - O, V = ie / 2, Re = Qe - Ve, ha = O - Ve, _e = "M" + va + "," + Wa + " L" + he + "," + Wa + ae(he, Ve, Ut, Ve, 270, 450, !1).replace("M", "L") + " L" + Z + "," + P + ae(Z, ha, Ut, Ve, 270, 90, !1).replace("M", "L") + " L" + Ta + "," + O + ae(Ta, ha, Ut, Ve, 90, -90, !1).replace("M", "L") + " L" + xa + "," + P + ae(xa, Ve, Ut, Ve, 90, 270, !1).replace("M", "L") + " L" + ra + "," + Wa + " L" + Ct + "," + V + " L" + ra + "," + ie + " L" + Ja + "," + ie + " L" + Ja + "," + Re + ae(Ta, Re, Ut, Ve, 0, 90, !1).replace("M", "L") + " L" + Z + "," + Qe + ae(Z, Re, Ut, Ve, 90, 180, !1).replace("M", "L") + " L" + G + "," + ie + " L" + va + "," + ie + " L" + bi + "," + V + " z M" + Oe + "," + Ve + " L" + Oe + "," + O + "M" + Ke + "," + O + " L" + Ke + "," + Ve + "M" + G + "," + ie + " L" + G + "," + ha + "M" + Ja + "," + ha + " L" + Ja + "," + ie;
					}
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "doubleWave":
				case "wave":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = M == "doubleWave" ? 6250 * k : 12500 * k, xe, R = 0;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k);
					}
					var _e, ee = -1e4 * k, la = 5e4 * k, lt = 1e5 * k, C = t / 2, Wa = 0, va = 0, Qe = n, ra = t, bi = t / 8, Ut = t / 32;
					if (M == "doubleWave") {
						var q = 12500 * k, te = j < 0 ? 0 : j > q ? q : j, ye = R < ee ? ee : R > lt ? lt : R, P = n * te / lt, Ee = P * 10 / 3, O = P - Ee, V = P + Ee, ie = Qe - P, Re = ie - Ee, ha = ie + Ee, gr = t * ye / la, oe = gr > 0 ? 0 : gr, G = va - oe, Ml = gr > 0 ? gr : 0, Ta = ra - Ml, ma = (oe + Ta) / 6, Z = G + ma, Bn = (oe + Ta) / 3, he = G + Bn, Oe = (G + Ta) / 2, Ke = Oe + ma, xa = (Ke + Ta) / 2, Ja = va + Ml, Md = ra + oe, Ct = Ja + ma, Fr = Ja + Bn, dr = (Ja + Md) / 2, or = dr + ma, Mr = (or + Md) / 2;
						_e = "M" + G + "," + P + " C" + Z + "," + O + " " + he + "," + V + " " + Oe + "," + P + " C" + Ke + "," + O + " " + xa + "," + V + " " + Ta + "," + P + " L" + Md + "," + ie + " C" + Mr + "," + ha + " " + or + "," + Re + " " + dr + "," + ie + " C" + Fr + "," + ha + " " + Ct + "," + Re + " " + Ja + "," + ie + " z";
					} else if (M == "wave") {
						var Ln = 2e4 * k, te = j < 0 ? 0 : j > Ln ? Ln : j, ye = R < ee ? ee : R > lt ? lt : R, P = n * te / lt, Ee = P * 10 / 3, O = P - Ee, V = P + Ee, ie = Qe - P, Re = ie - Ee, ha = ie + Ee, gr = t * ye / la, oe = gr > 0 ? 0 : gr, G = va - oe, Nn = gr > 0 ? gr : 0, Oe = ra - Nn, ma = (oe + Oe) / 3, Z = G + ma, he = (Z + Oe) / 2, Ke = va + Nn, Ct = ra + oe, xa = Ke + ma, Ta = (xa + Ct) / 2;
						_e = "M" + G + "," + P + " C" + Z + "," + O + " " + he + "," + V + " " + Oe + "," + P + " L" + Ct + "," + ie + " C" + Ta + "," + ha + " " + xa + "," + Re + " " + Ke + "," + ie + " z";
					}
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "ellipseRibbon":
				case "ellipseRibbon2":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 5e4 * k, Ye, fe = 12500 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var _e, q = 25e3 * k, la = 75e3 * k, lt = 1e5 * k, Ln = 2e5 * k, C = t / 2, Wa = 0, va = 0, Qe = n, ra = t, bi = t / 8, te, ye, sn, hn, Ot, r0, Xe, oe, G, Z, he, Oe, Ke, we, od, Aa, Fa, Ed, d0, Aa, Ga, Dt, _t, qt, Wn, cn, Sc, xn, o0;
					if (te = j < 0 ? 0 : j > lt ? lt : j, ye = R < q ? q : R > la ? la : R, sn = lt - te, hn = sn / 2, Ot = te - hn, r0 = 0 > Ot ? 0 : Ot, Xe = fe < r0 ? r0 : fe > te ? te : fe, oe = t * ye / Ln, G = C - oe, Z = G + bi, he = ra - Z, Oe = ra - G, Ke = ra - bi, we = n * Xe / lt, od = 4 * we / t, Aa = Z * Z / t, Fa = Z - Aa, Ed = Z / 2, d0 = ra - Ed, Aa = n * te / lt, Ga = Aa - we, Dt = G * G / t, _t = G - Dt, qt = od * _t, Wn = Qe - Aa, cn = we * 14 / 16, Sc = G / 2, xn = od * Sc, o0 = ra - Sc, M == "ellipseRibbon") {
						var P = od * Fa, Ec = od * Ed, V = qt + Ga, mn = we + Ga - V, bt = mn + we, Js = bt + Ga, O = (cn + Wn) / 2, Re = qt + Wn, ha = V + Wn, zc = xn + Wn, c0 = Js + Wn, Pa = P + Ga, Lt;
						Aa + Aa - Pa, Lt = Qe - we, _e = "M" + va + "," + Wa + " Q" + Ed + "," + Ec + " " + Z + "," + P + " L" + G + "," + V + " Q" + C + "," + Js + " " + Oe + "," + V + " L" + he + "," + P + " Q" + d0 + "," + Ec + " " + ra + "," + Wa + " L" + Ke + "," + O + " L" + ra + "," + Wn + " Q" + o0 + "," + zc + " " + Oe + "," + Re + " L" + Oe + "," + ha + " Q" + C + "," + c0 + " " + G + "," + ha + " L" + G + "," + Re + " Q" + Sc + "," + zc + " " + va + "," + Wn + " L" + bi + "," + O + " zM" + G + "," + Re + " L" + G + "," + V + "M" + Oe + "," + V + " L" + Oe + "," + Re + "M" + Z + "," + P + " L" + Z + "," + Pa + "M" + he + "," + Pa + " L" + he + "," + P;
					} else if (M == "ellipseRibbon2") {
						var ft = od * Fa, P = Qe - ft, Ec = Qe - od * Ed, Dt, qt, Ai = qt + Ga, V = Qe - Ai, mn = we + Ga - Ai, bt = mn + we, Fl = bt + Ga, Js = Qe - Fl, Wn, cn, Xn = (cn + Wn) / 2, O = Qe - Xn, Hd = qt + Wn, Re = Qe - Hd, $d = Ai + Wn, ha = Qe - $d, zc = Qe - (xn + Wn), c0 = Qe - (Fl + Wn), gd = ft + Ga, Pa = Qe - gd;
						Qe - (Aa + Aa - gd), _e = "M" + va + "," + Qe + " L" + bi + "," + O + " L" + va + "," + Aa + " Q" + Sc + "," + zc + " " + G + "," + Re + " L" + G + "," + ha + " Q" + C + "," + c0 + " " + Oe + "," + ha + " L" + Oe + "," + Re + " Q" + o0 + "," + zc + " " + ra + "," + Aa + " L" + Ke + "," + O + " L" + ra + "," + Qe + " Q" + d0 + "," + Ec + " " + he + "," + P + " L" + Oe + "," + V + " Q" + C + "," + Js + " " + G + "," + V + " L" + Z + "," + P + " Q" + Ed + "," + Ec + " " + va + "," + Qe + " zM" + G + "," + V + " L" + G + "," + Re + "M" + Oe + "," + Re + " L" + Oe + "," + V + "M" + Z + "," + Pa + " L" + Z + "," + P + "M" + he + "," + P + " L" + he + "," + Pa;
					}
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "line":
				case "straightConnector1":
				case "bentConnector4":
				case "bentConnector5":
				case "curvedConnector2":
				case "curvedConnector3":
				case "curvedConnector4":
				case "curvedConnector5":
					var Xp = ag(c(b, [
						"a:ext",
						"attrs",
						"cx"
					]), "x", m, t), Hp = ag(c(b, [
						"a:ext",
						"attrs",
						"cy"
					]), "y", m, n);
					p += "<line x1='0' y1='0' x2='" + Xp + "' y2='" + Hp + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' ", ga !== void 0 && (ga.type === "triangle" || ga.type === "arrow") && (p += "marker-start='url(#markerTriangle_" + l + ")' "), Ba !== void 0 && (Ba.type === "triangle" || Ba.type === "arrow") && (p += "marker-end='url(#markerTriangle_" + l + ")' "), p += "/>";
					break;
				case "rightArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = .25, xe, qe = .5, mi = t / n;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						if (Y == "adj1") be = c(F[A], ["attrs", "fmla"]), Je = .5 - parseInt(be.substr(4)) / 2e5;
						else if (Y == "adj2") {
							xe = c(F[A], ["attrs", "fmla"]);
							var ui = parseInt(xe.substr(4)) / 1e5;
							qe = 1 - ui / mi;
						}
					}
					p += " <polygon points='" + t + " " + n / 2 + "," + qe * t + " 0," + qe * t + " " + Je * n + ",0 " + Je * n + ",0 " + (1 - Je) * n + "," + qe * t + " " + (1 - Je) * n + ", " + qe * t + " " + n + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = .25, xe, qe = .5, mi = t / n;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						if (Y == "adj1") be = c(F[A], ["attrs", "fmla"]), Je = .5 - parseInt(be.substr(4)) / 2e5;
						else if (Y == "adj2") {
							xe = c(F[A], ["attrs", "fmla"]);
							var ui = parseInt(xe.substr(4)) / 1e5;
							qe = ui / mi;
						}
					}
					p += " <polygon points='0 " + n / 2 + "," + qe * t + " " + n + "," + qe * t + " " + (1 - Je) * n + "," + t + " " + (1 - Je) * n + "," + t + " " + Je * n + "," + qe * t + " " + Je * n + ", " + qe * t + " 0' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "downArrow":
				case "flowChartOffpageConnector":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = .25, xe, qe = .5, mi = n / t;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						if (Y == "adj1") be = c(F[A], ["attrs", "fmla"]), Je = parseInt(be.substr(4)) / 2e5;
						else if (Y == "adj2") {
							xe = c(F[A], ["attrs", "fmla"]);
							var ui = parseInt(xe.substr(4)) / 1e5;
							qe = ui / mi;
						}
					}
					M == "flowChartOffpageConnector" && (Je = .5, qe = .212), p += " <polygon points='" + (.5 - Je) * t + " 0," + (.5 - Je) * t + " " + (1 - qe) * n + ",0 " + (1 - qe) * n + "," + t / 2 + " " + n + "," + t + " " + (1 - qe) * n + "," + (.5 + Je) * t + " " + (1 - qe) * n + ", " + (.5 + Je) * t + " 0' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "upArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = .25, xe, qe = .5, mi = n / t;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						if (Y == "adj1") be = c(F[A], ["attrs", "fmla"]), Je = parseInt(be.substr(4)) / 2e5;
						else if (Y == "adj2") {
							xe = c(F[A], ["attrs", "fmla"]);
							var ui = parseInt(xe.substr(4)) / 1e5;
							qe = ui / mi;
						}
					}
					p += " <polygon points='" + t / 2 + " 0,0 " + qe * n + "," + (.5 - Je) * t + " " + qe * n + "," + (.5 - Je) * t + " " + n + "," + (.5 + Je) * t + " " + n + "," + (.5 + Je) * t + " " + qe * n + ", " + t + " " + qe * n + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftRightArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = .25, xe, qe = .25, mi = t / n;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						if (Y == "adj1") be = c(F[A], ["attrs", "fmla"]), Je = .5 - parseInt(be.substr(4)) / 2e5;
						else if (Y == "adj2") {
							xe = c(F[A], ["attrs", "fmla"]);
							var ui = parseInt(xe.substr(4)) / 1e5;
							qe = ui / mi;
						}
					}
					p += " <polygon points='0 " + n / 2 + "," + qe * t + " " + n + "," + qe * t + " " + (1 - Je) * n + "," + (1 - qe) * t + " " + (1 - Je) * n + "," + (1 - qe) * t + " " + n + "," + t + " " + n / 2 + ", " + (1 - qe) * t + " 0," + (1 - qe) * t + " " + Je * n + "," + qe * t + " " + Je * n + "," + qe * t + " 0' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "upDownArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, Je = .25, xe, qe = .25, mi = n / t;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						if (Y == "adj1") be = c(F[A], ["attrs", "fmla"]), Je = .5 - parseInt(be.substr(4)) / 2e5;
						else if (Y == "adj2") {
							xe = c(F[A], ["attrs", "fmla"]);
							var ui = parseInt(xe.substr(4)) / 1e5;
							qe = ui / mi;
						}
					}
					p += " <polygon points='" + t / 2 + " 0,0 " + qe * n + "," + Je * t + " " + qe * n + "," + Je * t + " " + (1 - qe) * n + ",0 " + (1 - qe) * n + "," + t / 2 + " " + n + ", " + t + " " + (1 - qe) * n + "," + (1 - Je) * t + " " + (1 - qe) * n + "," + (1 - Je) * t + " " + qe * n + "," + t + " " + qe * n + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "quadArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 22500 * k, xe, R = 22500 * k, Ye, fe = 22500 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, te, ye, Xe, Aa, I, G, oe, Z, ma, he, Oe, Ke, O, V, ie, Re, ha, ea, sa, Ze = Math.min(t, n);
					R < 0 ? ye = 0 : R > q ? ye = q : ye = R, ea = 2 * ye, j < 0 ? te = 0 : j > ea ? te = ea : te = j, Aa = ee - ea, sa = Aa / 2, fe < 0 ? Xe = 0 : fe > sa ? Xe = sa : Xe = fe, I = Ze * Xe / ee, oe = Ze * ye / ee, G = C - oe, Oe = C + oe, ma = Ze * te / la, Z = C - ma, he = C + ma, Ke = t - I, O = B - oe, Re = B + oe, V = B - ma, ie = B + ma, ha = n - I;
					var _e = "M0," + B + " L" + I + "," + O + " L" + I + "," + V + " L" + Z + "," + V + " L" + Z + "," + I + " L" + G + "," + I + " L" + C + ",0 L" + Oe + "," + I + " L" + he + "," + I + " L" + he + "," + V + " L" + Ke + "," + V + " L" + Ke + "," + O + " L" + t + "," + B + " L" + Ke + "," + Re + " L" + Ke + "," + ie + " L" + he + "," + ie + " L" + he + "," + ha + " L" + Oe + "," + ha + " L" + C + "," + n + " L" + G + "," + ha + " L" + Z + "," + ha + " L" + Z + "," + ie + " L" + I + "," + ie + " L" + I + "," + Re + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftRightUpArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, te, ye, Xe, Aa, I, G, oe, Z, ma, he, Oe, Ke, O, Ee, V, ie, Re, ea, sa, Ze = Math.min(t, n);
					R < 0 ? ye = 0 : R > q ? ye = q : ye = R, ea = 2 * ye, j < 0 ? te = 0 : j > ea ? te = ea : te = j, Aa = ee - ea, sa = Aa / 2, fe < 0 ? Xe = 0 : fe > sa ? Xe = sa : Xe = fe, I = Ze * Xe / ee, oe = Ze * ye / ee, G = C - oe, Oe = C + oe, ma = Ze * te / la, Z = C - ma, he = C + ma, Ke = t - I, Ee = Ze * ye / q, O = n - Ee, ie = n - oe, V = ie - ma, Re = ie + ma;
					var _e = "M0," + ie + " L" + I + "," + O + " L" + I + "," + V + " L" + Z + "," + V + " L" + Z + "," + I + " L" + G + "," + I + " L" + C + ",0 L" + Oe + "," + I + " L" + he + "," + I + " L" + he + "," + V + " L" + Ke + "," + V + " L" + Ke + "," + O + " L" + t + "," + ie + " L" + Ke + "," + n + " L" + Ke + "," + Re + " L" + I + "," + Re + " L" + I + "," + n + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftUpArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, te, ye, Xe, I, G, Bn, ma, Z, he, Oe, O, V, ie, Re, ea, sa, Ze = Math.min(t, n);
					R < 0 ? ye = 0 : R > q ? ye = q : ye = R, ea = 2 * ye, j < 0 ? te = 0 : j > ea ? te = ea : te = j, sa = ee - ea, fe < 0 ? Xe = 0 : fe > sa ? Xe = sa : Xe = fe, I = Ze * Xe / ee, oe = Ze * ye / q, G = t - oe, O = n - oe, Bn = Ze * ye / ee, he = t - Bn, ie = n - Bn, ma = Ze * te / la, Z = he - ma, Oe = he + ma, V = ie - ma, Re = ie + ma;
					var _e = "M0," + ie + " L" + I + "," + O + " L" + I + "," + V + " L" + Z + "," + V + " L" + Z + "," + I + " L" + G + "," + I + " L" + he + ",0 L" + t + "," + I + " L" + Oe + "," + I + " L" + Oe + "," + Re + " L" + I + "," + Re + " L" + I + "," + n + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "bentUpArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, te, ye, Xe, Se, I, oe, G, ma, Z, he, P, O, Ee, Ze = Math.min(t, n);
					j < 0 ? te = 0 : j > q ? te = q : te = j, R < 0 ? ye = 0 : R > q ? ye = q : ye = R, fe < 0 ? Xe = 0 : fe > sa ? Xe = sa : Xe = fe, P = Ze * Xe / ee, Se = Ze * ye / q, I = t - Se, ma = Ze * ye / ee, Z = t - ma, oe = Ze * te / la, G = Z - oe, he = Z + oe, Ee = Ze * te / ee, O = n - Ee;
					var _e = "M0," + O + " L" + G + "," + O + " L" + G + "," + P + " L" + I + "," + P + " L" + Z + ",0 L" + t + "," + P + " L" + he + "," + P + " L" + he + "," + n + " L0," + n + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "bentArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, qa, oa = 43750 * k, q = 5e4 * k, ee = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k) : Y == "adj4" && (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) * k);
					}
					var te, ye, Xe, gt, Z, he, V, ie, Re, ha, ea, tt, Ze = Math.min(t, n);
					R < 0 ? ye = 0 : R > q ? ye = q : ye = R, ea = 2 * ye, j < 0 ? te = 0 : j > ea ? te = ea : te = j, fe < 0 ? Xe = 0 : fe > q ? Xe = q : Xe = fe;
					var ca, fn, bn, Ti, Oa, cd, s0, jc, Zt, sd, Gn, ca = Ze * te / ee;
					fn = Ze * ye / ee, bn = ca / 2, Ti = fn - bn, Oa = Ze * Xe / ee, cd = t - Oa, s0 = n - Ti, jc = cd < s0 ? cd : s0, tt = ee * jc / Ze, oa < 0 ? gt = 0 : oa > tt ? gt = tt : gt = oa, Zt = Ze * gt / ee, sd = Zt - ca, Gn = sd > 0 ? sd : 0, Z = ca + Gn, he = t - Oa, V = Ti + ca, ie = V + Ti, Re = Ti + Zt, ha = V + Gn;
					var _e = "M0," + n + " L0," + Re + ae(Zt, Re, Zt, Zt, 180, 270, !1).replace("M", "L") + " L" + he + "," + Ti + " L" + he + ",0 L" + t + "," + fn + " L" + he + "," + ie + " L" + he + "," + V + " L" + Z + "," + V + ae(Z, ha, Gn, Gn, 270, 180, !1).replace("M", "L") + " L" + ca + "," + n + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "uturnArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, qa, oa = 43750 * k, Di, kt = 75e3 * k, q = 25e3 * k, ee = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k) : Y == "adj4" ? (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) * k) : Y == "adj5" && (Di = c(F[A], ["attrs", "fmla"]), kt = parseInt(Di.substr(4)) * k);
					}
					var te, ye, Xe, gt, vi, Aa, Fa, Dt, Z, he, Oe, Ke, xa, Ta, Ja, ie, Re, h0, ea, sa, tt, Ze = Math.min(t, n);
					R < 0 ? ye = 0 : R > q ? ye = q : ye = R, ea = 2 * ye, j < 0 ? te = 0 : j > ea ? te = ea : te = j, Fa = te * Ze / n, Dt = ee - Fa, sa = Dt * n / Ze, fe < 0 ? Xe = 0 : fe > sa ? Xe = sa : Xe = fe, Aa = Xe + te, h0 = Aa * Ze / n, kt < h0 ? vi = h0 : kt > ee ? vi = ee : vi = kt;
					var ca, fn, bn, Ti, Oa, cd, jc, Zt, sd, Gn, ca = Ze * te / ee;
					fn = Ze * ye / ee, bn = ca / 2, Ti = fn - bn, Re = n * vi / ee, Oa = Ze * Xe / ee, ie = Re - Oa, Ja = t - Ti, cd = Ja / 2, jc = cd < ie ? cd : ie, tt = ee * jc / Ze, oa < 0 ? gt = 0 : oa > tt ? gt = tt : gt = oa, Zt = Ze * gt / ee, sd = Zt - ca, Gn = sd > 0 ? sd : 0, Z = ca + Gn, Ta = t - fn, Ke = Ta - fn, xa = Ke + Ti, he = Ja - Zt, Oe = xa - Gn, (ca + xa) / 2, (ie + ca) / 2;
					var _e = "M0," + n + " L0," + Zt + ae(Zt, Zt, Zt, Zt, 180, 270, !1).replace("M", "L") + " L" + he + ",0" + ae(he, Zt, Zt, Zt, 270, 360, !1).replace("M", "L") + " L" + Ja + "," + ie + " L" + t + "," + ie + " L" + Ta + "," + Re + " L" + Ke + "," + ie + " L" + xa + "," + ie + " L" + xa + "," + Z + ae(Oe, Z, Gn, Gn, 0, -90, !1).replace("M", "L") + " L" + Z + "," + ca + ae(Z, Z, Gn, Gn, 270, 180, !1).replace("M", "L") + " L" + ca + "," + n + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "stripedRightArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 5e4 * k, xe, R = 5e4 * k, q = 1e5 * k, ee = 2e5 * k, la = 84375 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k);
					}
					var te, ye, he, Oe, Nn, Ke, qs, P, we, O, fa, B = n / 2, Ze = Math.min(t, n);
					fa = la * t / Ze, j < 0 ? te = 0 : j > q ? te = q : te = j, R < 0 ? ye = 0 : R > fa ? ye = fa : ye = R, he = Ze * 5 / 32, Nn = Ze * ye / q, Oe = t - Nn, we = n * te / ee, P = B - we, O = B + we;
					var Od = Ze / 8, Il = Ze / 16, Cl = Ze / 32, _e = "M0," + P + " L" + Cl + "," + P + " L" + Cl + "," + O + " L0," + O + " z M" + Il + "," + P + " L" + Od + "," + P + " L" + Od + "," + O + " L" + Il + "," + O + " z M" + he + "," + P + " L" + Oe + "," + P + " L" + Oe + ",0 L" + t + "," + B + " L" + Oe + "," + n + " L" + Oe + "," + O + " L" + he + "," + O + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "notchedRightArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 5e4 * k, xe, R = 5e4 * k, q = 1e5 * k, ee = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k);
					}
					var te, ye, I, G, oe, P, we, O, fa, B = n / 2, Ae = B, Ze = Math.min(t, n);
					fa = q * t / Ze, j < 0 ? te = 0 : j > q ? te = q : te = j, R < 0 ? ye = 0 : R > fa ? ye = fa : ye = R, oe = Ze * ye / q, G = t - oe, we = n * te / ee, P = B - we, O = B + we, I = we * oe / Ae;
					var _e = "M0," + P + " L" + G + "," + P + " L" + G + ",0 L" + t + "," + B + " L" + G + "," + n + " L" + G + "," + O + " L0," + O + " L" + I + "," + B + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "homePlate":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 5e4 * k, q = 1e5 * k;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var Me, I, Se, ta, B = n / 2, Ze = Math.min(t, n);
					ta = q * t / Ze, Ue < 0 ? Me = 0 : Ue > ta ? Me = ta : Me = Ue, Se = Ze * Me / q, I = t - Se;
					var _e = "M0,0 L" + I + ",0 L" + t + "," + B + " L" + I + "," + n + " L0," + n + " z";
					p += "<path  d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "chevron":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 5e4 * k, q = 1e5 * k;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var Me, I, Se, G, ta, B = n / 2, Ze = Math.min(t, n);
					ta = q * t / Ze, Ue < 0 ? Me = 0 : Ue > ta ? Me = ta : Me = Ue, I = Ze * Me / q, G = t - I;
					var _e = "M0,0 L" + G + ",0 L" + t + "," + B + " L" + G + "," + n + " L0," + n + " L" + I + "," + B + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "rightArrowCallout":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, qa, oa = 64977 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k) : Y == "adj4" && (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) * k);
					}
					var fa, ye, ea, te, sa, Xe, Fa, tt, gt, we, Ee, P, O, V, ie, ma, Z, G, I, B = n / 2, ra = t, Qe = n, va = 0, Wa = 0, ue = Math.min(t, n);
					fa = q * n / ue, ye = R < 0 ? 0 : R > fa ? fa : R, ea = ye * 2, te = j < 0 ? 0 : j > ea ? ea : j, sa = ee * t / ue, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Fa = Xe * ue / t, tt = y1 - Fa, gt = oa < 0 ? 0 : oa > tt ? tt : oa, we = ue * ye / ee, Ee = ue * te / la, P = B - we, O = B - Ee, V = B + Ee, ie = B + we, ma = ue * Xe / ee, Z = ra - ma, G = t * gt / ee, I = G / 2;
					var _e = "M" + va + "," + Wa + " L" + G + "," + Wa + " L" + G + "," + O + " L" + Z + "," + O + " L" + Z + "," + P + " L" + ra + "," + B + " L" + Z + "," + ie + " L" + Z + "," + V + " L" + G + "," + V + " L" + G + "," + Qe + " L" + va + "," + Qe + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "downArrowCallout":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, qa, oa = 64977 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k) : Y == "adj4" && (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) * k);
					}
					var fa, ye, ea, te, sa, Xe, Fa, tt, gt, Se, oe, I, G, Z, he, Ga, V, O, P, C = t / 2, ra = t, Qe = n, va = 0, Wa = 0, ue = Math.min(t, n);
					fa = q * t / ue, ye = R < 0 ? 0 : R > fa ? fa : R, ea = ye * 2, te = j < 0 ? 0 : j > ea ? ea : j, sa = ee * n / ue, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Fa = Xe * ue / n, tt = ee - Fa, gt = oa < 0 ? 0 : oa > tt ? tt : oa, Se = ue * ye / ee, oe = ue * te / la, I = C - Se, G = C - oe, Z = C + oe, he = C + Se, Ga = ue * Xe / ee, V = Qe - Ga, O = n * gt / ee, P = O / 2;
					var _e = "M" + va + "," + Wa + " L" + ra + "," + Wa + " L" + ra + "," + O + " L" + Z + "," + O + " L" + Z + "," + V + " L" + he + "," + V + " L" + C + "," + Qe + " L" + I + "," + V + " L" + G + "," + V + " L" + G + "," + O + " L" + va + "," + O + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftArrowCallout":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, qa, oa = 64977 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k) : Y == "adj4" && (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) * k);
					}
					var fa, ye, ea, te, sa, Xe, Fa, tt, gt, we, Ee, P, O, V, ie, I, oe, G, Z, B = n / 2, ra = t, Qe = n, va = 0, Wa = 0, ue = Math.min(t, n);
					fa = q * n / ue, ye = R < 0 ? 0 : R > fa ? fa : R, ea = ye * 2, te = j < 0 ? 0 : j > ea ? ea : j, sa = ee * t / ue, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Fa = Xe * ue / t, tt = ee - Fa, gt = oa < 0 ? 0 : oa > tt ? tt : oa, we = ue * ye / ee, Ee = ue * te / la, P = B - we, O = B - Ee, V = B + Ee, ie = B + we, I = ue * Xe / ee, oe = t * gt / ee, G = ra - oe, Z = (G + ra) / 2;
					var _e = "M" + va + "," + B + " L" + I + "," + P + " L" + I + "," + O + " L" + G + "," + O + " L" + G + "," + Wa + " L" + ra + "," + Wa + " L" + ra + "," + Qe + " L" + G + "," + Qe + " L" + G + "," + V + " L" + I + "," + V + " L" + I + "," + ie + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "upArrowCallout":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, qa, oa = 64977 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k) : Y == "adj4" && (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) * k);
					}
					var fa, ye, ea, te, sa, Xe, Fa, tt, gt, Se, oe, I, G, Z, he, P, Ee, O, V, C = t / 2, ra = t, Qe = n, va = 0, Wa = 0, ue = Math.min(t, n);
					fa = q * t / ue, ye = R < 0 ? 0 : R > fa ? fa : R, ea = ye * 2, te = j < 0 ? 0 : j > ea ? ea : j, sa = ee * n / ue, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Fa = Xe * ue / n, tt = ee - Fa, gt = oa < 0 ? 0 : oa > tt ? tt : oa, Se = ue * ye / ee, oe = ue * te / la, I = C - Se, G = C - oe, Z = C + oe, he = C + Se, P = ue * Xe / ee, Ee = n * gt / ee, O = Qe - Ee, V = (O + Qe) / 2;
					var _e = "M" + va + "," + O + " L" + G + "," + O + " L" + G + "," + P + " L" + I + "," + P + " L" + C + "," + Wa + " L" + he + "," + P + " L" + Z + "," + P + " L" + Z + "," + O + " L" + ra + "," + O + " L" + ra + "," + Qe + " L" + va + "," + Qe + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftRightArrowCallout":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 25e3 * k, Ye, fe = 25e3 * k, qa, oa = 48123 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k) : Y == "adj4" && (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) * k);
					}
					var fa, ye, ea, te, sa, Xe, Fa, tt, gt, we, Ee, P, O, V, ie, I, he, oe, G, Z, B = n / 2, C = t / 2, ra = t, Qe = n, va = 0, Wa = 0, ue = Math.min(t, n);
					fa = q * n / ue, ye = R < 0 ? 0 : R > fa ? fa : R, ea = ye * 2, te = j < 0 ? 0 : j > ea ? ea : j, sa = q * t / ue, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Fa = Xe * ue / ze, tt = ee - Fa, gt = oa < 0 ? 0 : oa > tt ? tt : oa, we = ue * ye / ee, Ee = ue * te / la, P = B - we, O = B - Ee, V = B + Ee, ie = B + we, I = ue * Xe / ee, he = ra - I, oe = t * gt / la, G = C - oe, Z = C + oe;
					var _e = "M" + va + "," + B + " L" + I + "," + P + " L" + I + "," + O + " L" + G + "," + O + " L" + G + "," + Wa + " L" + Z + "," + Wa + " L" + Z + "," + O + " L" + he + "," + O + " L" + he + "," + P + " L" + ra + "," + B + " L" + he + "," + ie + " L" + he + "," + V + " L" + Z + "," + V + " L" + Z + "," + Qe + " L" + G + "," + Qe + " L" + G + "," + V + " L" + I + "," + V + " L" + I + "," + ie + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "quadArrowCallout":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 18515 * k, xe, R = 18515 * k, Ye, fe = 18515 * k, qa, oa = 48123 * k, q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k) : Y == "adj4" && (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, ra = t, Qe = n, va = 0, Wa = 0, ue = Math.min(t, n), ye = R < 0 ? 0 : R > q ? q : R, ea = ye * 2, te = j < 0 ? 0 : j > ea ? ea : j, sa = q - ye, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Fa = Xe * 2, tt = ee - Fa, gt = oa < te ? te : oa > tt ? tt : oa, oe = ue * ye / ee, ma = ue * te / la, Oa = ue * Xe / ee, Se = t * gt / la, we = n * gt / la, Ta = ra - Oa, G = C - Se, xa = C + Se, Z = C - oe, Ke = C + oe, he = C - ma, Oe = C + ma, Lt = Qe - Oa, O = B - we, Pa = B + we, V = B - oe, ha = B + oe, ie = B - ma, Re = B + ma, _e = "M" + va + "," + B + " L" + Oa + "," + V + " L" + Oa + "," + ie + " L" + G + "," + ie + " L" + G + "," + O + " L" + he + "," + O + " L" + he + "," + Oa + " L" + Z + "," + Oa + " L" + C + "," + Wa + " L" + Ke + "," + Oa + " L" + Oe + "," + Oa + " L" + Oe + "," + O + " L" + xa + "," + O + " L" + xa + "," + ie + " L" + Ta + "," + ie + " L" + Ta + "," + V + " L" + ra + "," + B + " L" + Ta + "," + ha + " L" + Ta + "," + Re + " L" + xa + "," + Re + " L" + xa + "," + Pa + " L" + Oe + "," + Pa + " L" + Oe + "," + Lt + " L" + Ke + "," + Lt + " L" + C + "," + Qe + " L" + Z + "," + Lt + " L" + he + "," + Lt + " L" + he + "," + Pa + " L" + G + "," + Pa + " L" + G + "," + Re + " L" + Oa + "," + Re + " L" + Oa + "," + ha + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "curvedDownArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 5e4 * k, Ye, fe = 25e3 * k, q = 5e4 * k, ee = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, ze = t / 2, ra = t, Qe = n, va = 0, Wa = 0, La = 270, ba = 180, ka = 90, ue = Math.min(t, n), fa = q * t / ue, ye = R < 0 ? 0 : R > fa ? fa : R, te = j < 0 ? 0 : j > ee ? ee : j, ca = ue * te / ee, kn = ue * ye / ee, Aa = (ca + kn) / 4, Sa = ze - Aa, bt = Sa * 2, cn = bt * bt, xn = ca * ca, sn = cn - xn, hn = Math.sqrt(sn), yt = hn * n / bt, sa = ee * yt / ue, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Oa = ue * fe / ee, Z = Sa + ca, Fa = n * n, Dt = Oa * Oa, _t = Fa - Dt, qt = Math.sqrt(_t), fr = qt * Sa / n, Oe = Sa + fr, xa = Z + fr, mn = kn - ca, xi = mn / 2, he = Oe - xi, Ta = xa + xi, fn = kn / 2, Ke = ra - fn, P = Qe - Oa, Va = Math.atan(fr / Oa), zd, Ot, Et, Ea, br, Rn, pr, g0 = Va * 180 / Math.PI;
					zd = -g0, Qe - yt, (Sa + Z) / 2, Ot = ca / 2, Et = Math.atan(Ot / yt);
					var l0 = Et * 180 / Math.PI;
					Ea = La + g0, br = La - l0, Rn = l0 - ka, pr = ka + l0;
					var _e = "M" + Ke + "," + Qe + " L" + he + "," + P + " L" + Oe + "," + P + ae(Sa, n, Sa, n, Ea, Ea + zd, !1).replace("M", "L") + " L" + Z + "," + Wa + ae(Z, n, Sa, n, La, La + g0, !1).replace("M", "L") + " L" + (Oe + ca) + "," + P + " L" + Ta + "," + P + " zM" + Z + "," + Wa + ae(Z, n, Sa, n, br, br + Rn, !1).replace("M", "L") + ae(Sa, n, Sa, n, ba, ba + pr, !1).replace("M", "L");
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "curvedLeftArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 5e4 * k, Ye, fe = 25e3 * k, q = 5e4 * k, ee = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, Ae = n / 2, ra = t, Qe = n, va = 0, Wa = 0, La = 270, ba = 180, ka = 90, ue = Math.min(t, n), fa = q * n / ue, ye = R < 0 ? 0 : R > fa ? fa : R, te = j < 0 ? 0 : j > ye ? ye : j, ca = ue * te / ee, kn = ue * ye / ee, Aa = (ca + kn) / 4, Ve = Ae - Aa, bt = Ve * 2, cn = bt * bt, xn = ca * ca, sn = cn - xn, hn = Math.sqrt(sn), wt = hn * t / bt, sa = ee * wt / ue, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Oa = ue * Xe / ee, V = Ve + ca, Fa = t * t, Dt = Oa * Oa, _t = Fa - Dt, qt = Math.sqrt(_t), lr = qt * Ve / t, Re = Ve + lr, Pa = V + lr, mn = kn - ca, xi = mn / 2, ie = Re - xi, Lt = Pa + xi, fn = kn / 2, ha = Qe - fn, I = va + Oa, Va = Math.atan(lr / Oa), zd = -Va, Ot, Et, Rn, pr, hd;
					va + wt, (Ve + V) / 2, Ot = ca / 2, Et = Math.atan(Ot / wt), Rn = Et - Va, pr = Va + Et, hd = -Et;
					var Wr = Va * 180 / Math.PI, $p = Rn * 180 / Math.PI, Vs;
					pr * 180 / Math.PI, Vs = hd * 180 / Math.PI;
					var _e = "M" + ra + "," + V + ae(va, Ve, t, Ve, 0, -ka, !1).replace("M", "L") + " L" + va + "," + Wa + ae(va, V, t, Ve, La, La + ka, !1).replace("M", "L") + " L" + ra + "," + V + ae(va, V, t, Ve, 0, Wr, !1).replace("M", "L") + " L" + I + "," + Pa + " L" + I + "," + Lt + " L" + va + "," + ha + " L" + I + "," + ie + " L" + I + "," + Re + ae(va, Ve, t, Ve, Wr, Wr + $p, !1).replace("M", "L") + ae(va, Ve, t, Ve, 0, -ka, !1).replace("M", "L") + ae(va, V, t, Ve, La, La + ka, !1).replace("M", "L");
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "curvedRightArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 5e4 * k, Ye, fe = 25e3 * k, q = 5e4 * k, ee = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, Ae = n / 2, ra = t, Qe = n, va = 0, Wa = 0, La = 270, ba = 180, ka = 90, ue = Math.min(t, n), fa = q * n / ue, ye = R < 0 ? 0 : R > fa ? fa : R, te = j < 0 ? 0 : j > ye ? ye : j, ca = ue * te / ee, kn = ue * ye / ee, Aa = (ca + kn) / 4, Ve = Ae - Aa, bt = Ve * 2, cn = bt * bt, xn = ca * ca, sn = cn - xn, hn = Math.sqrt(sn), wt = hn * t / bt, sa = ee * wt / ue, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Oa = ue * Xe / ee, V = Ve + ca, Fa = t * t, Dt = Oa * Oa, _t = Fa - Dt, qt = Math.sqrt(_t), lr = qt * Ve / t, Re = Ve + lr, Pa = V + lr, mn = kn - ca, xi = mn / 2, ie = Re - xi, Lt = Pa + xi, fn = kn / 2, ha = Qe - fn, I = ra - Oa, Va = Math.atan(lr / Oa), Ea = Math.PI + 0 - Va, zd = -Va, Ot, Et, Rn, pr, hd;
					ra - wt, (Ve + V) / 2, Ot = ca / 2, Et = Math.atan(Ot / wt), Rn = Et - Math.PI / 2, pr = Math.PI / 2 + Et, hd = Math.PI - Et;
					var Al = Ea * 180 / Math.PI, Jp = zd * 180 / Math.PI, Wr = Va * 180 / Math.PI, Qs = Rn * 180 / Math.PI, _e = "M" + va + "," + Ve + ae(t, Ve, t, Ve, ba, ba + Jp, !1).replace("M", "L") + " L" + I + "," + Re + " L" + I + "," + ie + " L" + ra + "," + ha + " L" + I + "," + Lt + " L" + I + "," + Pa + ae(t, V, t, Ve, Al, Al + Wr, !1).replace("M", "L") + " L" + va + "," + Ve + ae(t, Ve, t, Ve, ba, ba + ka, !1).replace("M", "L") + " L" + ra + "," + ca + ae(t, V, t, Ve, La, La + Qs, !1).replace("M", "L");
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "curvedUpArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 25e3 * k, xe, R = 5e4 * k, Ye, fe = 25e3 * k, q = 5e4 * k, ee = 1e5 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * k) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, ze = t / 2, ra = t, Qe = n, va = 0, Wa = 0, La = 270, ba = 180, ka = 90, ue = Math.min(t, n), fa = q * t / ue, ye = R < 0 ? 0 : R > fa ? fa : R, te = j < 0 ? 0 : j > ee ? ee : j, ca = ue * te / ee, kn = ue * ye / ee, Aa = (ca + kn) / 4, Sa = ze - Aa, bt = Sa * 2, cn = bt * bt, xn = ca * ca, sn = cn - xn, hn = Math.sqrt(sn), yt = hn * n / bt, sa = ee * yt / ue, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, Oa = ue * fe / ee, Z = Sa + ca, Fa = n * n, Dt = Oa * Oa, _t = Fa - Dt, qt = Math.sqrt(_t), fr = qt * Sa / n, Oe = Sa + fr, xa = Z + fr, mn = kn - ca, xi = mn / 2, he = Oe - xi, Ta = xa + xi, fn = kn / 2, Ke = ra - fn, P = Wa + Oa, Va = Math.atan(fr / Oa), zd = -Va, Ot, Et, Rn, hd, pr, br;
					Wa + yt, (Sa + Z) / 2, Ot = ca / 2, Et = Math.atan(Ot / yt), Rn = Et - Va, -Rn, hd = Math.PI / 2 - Va, pr = Va + Et, br = Math.PI / 2 - Et;
					var Wl = br * 180 / Math.PI, Qs, Wr, Qs = Rn * 180 / Math.PI;
					Vs = hd * 180 / Math.PI, Wr = Va * 180 / Math.PI;
					var _e = ae(Sa, 0, Sa, n, Wl, Wl + Qs, !1) + " L" + Oe + "," + P + " L" + he + "," + P + " L" + Ke + "," + Wa + " L" + Ta + "," + P + " L" + xa + "," + P + ae(Z, 0, Sa, n, Vs, Vs + Wr, !1).replace("M", "L") + " L" + Sa + "," + Qe + ae(Sa, 0, Sa, n, ka, ba, !1).replace("M", "L") + " L" + ca + "," + Wa + ae(Z, 0, Sa, n, ba, ka, !1).replace("M", "L");
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "mathDivide":
				case "mathEqual":
				case "mathMinus":
				case "mathMultiply":
				case "mathNotEqual":
				case "mathPlus":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j, xe, R, Ye, fe;
					if (F !== void 0) if (F.constructor === Array) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4))) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4))) : Y == "adj3" && (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)));
					}
					else be = c(F, ["attrs", "fmla"]), j = parseInt(be.substr(4));
					var q = 5e4 * k, ee = 1e5 * k, la = 2e5 * k, Kn, C = t / 2, B = n / 2, Ae = n / 2;
					if (M == "mathNotEqual") {
						F === void 0 ? (j = 23520 * k, R = 110 * Math.PI / 180, fe = 11760 * k) : (j = j * k, R = R / 6e4 * Math.PI / 180, fe = fe * k);
						var te, Bl, Ys, sa, Xe, we, Ee, Se, I, Ta, O, V, P, ie, jd, wi, Ks, Br, Pl, xa, Sl, Ke, El, Oe, zl, he, jl, Z, Ol, G, ys, R1, N1, G1, O1, Xr, Gl, Nl, Zs, eh, Ga, Yn, ah, th, f0, p0, b0, u0, dd = 70 * Math.PI / 180, Rl = 110 * Math.PI / 180, lt = 73490 * k;
						te = j < 0 ? 0 : j > q ? q : j, Bl = R < dd ? dd : R > Rl ? Rl : R, Ys = te * 2, sa = ee - Ys, Xe = fe < 0 ? 0 : fe > sa ? sa : fe, we = n * te / ee, Ee = n * Xe / la, Se = t * lt / la, I = C - Se, Ta = C + Se, O = B - Ee, V = B + Ee, P = O - we, ie = V + we, jd = Bl - Math.PI / 2, wi = Ae * Math.tan(jd), Ks = Math.sqrt(wi * wi + Ae * Ae), Br = Ks * we / Ae, Pl = Br / 2, xa = C + wi - Pl, Sl = wi * P / Ae, Ke = xa - Sl, El = wi * O / Ae, Oe = xa - El, zl = wi * V / Ae, he = xa - zl, jl = wi * ie / Ae, Z = xa - jl, Ol = wi * 2, G = xa - Ol, ys = xa + Br, R1 = Ke + Br, N1 = Oe + Br, G1 = he + Br, O1 = Z + Br, G + Br, Xr = we * Ae / Ks, Gl = xa + Xr, Nl = ys - Xr, Zs = jd > 0 ? Gl : ys, eh = jd > 0 ? xa : Nl, Ga = we * wi / Ks, Yn = -Ga, ah = jd > 0 ? Ga : 0, th = jd > 0 ? 0 : Yn, f0 = t - Zs, p0 = t - eh, b0 = n - ah, u0 = n - th, (Zs + eh) / 2, (p0 + f0) / 2, (ah + th) / 2, (P + O) / 2, (V + ie) / 2, (u0 + b0) / 2, Kn = "M" + I + "," + P + " L" + Ke + "," + P + " L" + eh + "," + th + " L" + Zs + "," + ah + " L" + R1 + "," + P + " L" + Ta + "," + P + " L" + Ta + "," + O + " L" + N1 + "," + O + " L" + G1 + "," + V + " L" + Ta + "," + V + " L" + Ta + "," + ie + " L" + O1 + "," + ie + " L" + p0 + "," + u0 + " L" + f0 + "," + b0 + " L" + Z + "," + ie + " L" + I + "," + ie + " L" + I + "," + V + " L" + he + "," + V + " L" + Oe + "," + O + " L" + I + "," + O + " z";
					} else if (M == "mathDivide") {
						F === void 0 ? (j = 23520 * k, R = 5880 * k, fe = 11760 * k) : (j = j * k, R = R * k, fe = fe * k);
						var te, Xl, m0, x0, sa, Xe, Hl, fa, ye, we, $l, Qn, Se, V, ie, Me, O, P, Re, I, Z, G, lt = 1e3 * k, Ln = 36745 * k, Kt = 73490 * k;
						te = j < lt ? lt : j > Ln ? Ln : j, Xl = -te, m0 = (Kt + Xl) / 4, x0 = Ln * t / n, sa = m0 < x0 ? m0 : x0, Xe = fe < lt ? lt : fe > sa ? sa : fe, Hl = -4 * Xe, fa = Kt + Hl - te, ye = R < 0 ? 0 : R > fa ? fa : R, we = n * te / la, $l = n * ye / ee, Qn = n * Xe / ee, Se = t * Kt / la, V = B - we, ie = B + we, Me = $l + Qn, O = V - Me, P = O - Qn, Re = n - P, I = C - Se, Z = C + Se, G = C - Qn;
						var ka = 90, La = 270, pi = C - Math.cos(La * Math.PI / 180) * Qn, cr = P - Math.sin(La * Math.PI / 180) * Qn, Cr = C - Math.cos(Math.PI / 2) * Qn, Ir = Re - Math.sin(Math.PI / 2) * Qn;
						Kn = "M" + C + "," + P + ae(pi, cr, Qn, Qn, La, La + 360, !1).replace("M", "L") + " z M" + C + "," + Re + ae(Cr, Ir, Qn, Qn, ka, ka + 360, !1).replace("M", "L") + " z M" + I + "," + V + " L" + Z + "," + V + " L" + Z + "," + ie + " L" + I + "," + ie + " z";
					} else if (M == "mathEqual") {
						F === void 0 ? (j = 23520 * k, R = 11760 * k) : (j = j * k, R = R * k);
						var Ln = 36745 * k, Kt = 73490 * k, te = j < 0 ? 0 : j > Ln ? Ln : j, Ys = te * 2, Jl = ee - Ys, ye = R < 0 ? 0 : R > Jl ? Jl : R, we = n * te / ee, Ee = n * ye / la, Se = t * Kt / la, O = B - Ee, V = B + Ee, P = O - we, ie = V + we, I = C - Se, G = C + Se;
						(P + O) / 2, (V + ie) / 2, Kn = "M" + I + "," + P + " L" + G + "," + P + " L" + G + "," + O + " L" + I + "," + O + " zM" + I + "," + V + " L" + G + "," + V + " L" + G + "," + ie + " L" + I + "," + ie + " z";
					} else if (M == "mathMinus") {
						F === void 0 ? j = 23520 * k : j = j * k;
						var Kt = 73490 * k, te = j < 0 ? 0 : j > ee ? ee : j, we = n * te / la, Se = t * Kt / la, P = B - we, O = B + we, I = C - Se, G = C + Se;
						Kn = "M" + I + "," + P + " L" + G + "," + P + " L" + G + "," + O + " L" + I + "," + O + " z";
					} else if (M == "mathMultiply") {
						F === void 0 ? j = 23520 * k : j = j * k;
						var Kt = 51965 * k, te, ca, Me, y0, D0, v0, U0, ql, L0, nh, ih, k0, T0, Wi, Bi, un, wn, Vl, Ql, Li, Gc, Pi, Yl, w0, Hn, Kl, Si, Ci, Zl, ue = Math.min(t, n);
						te = j < 0 ? 0 : j > Kt ? Kt : j, ca = ue * te / ee, Me = Math.atan(n / t), y0 = 1 * Math.sin(Me), D0 = 1 * Math.cos(Me), v0 = 1 * Math.tan(Me), U0 = Math.sqrt(t * t + n * n), ql = U0 * Kt / ee, L0 = U0 - ql, nh = D0 * L0 / 2, ih = y0 * L0 / 2, k0 = y0 * ca / 2, T0 = D0 * ca / 2, Wi = nh - k0, Bi = ih + T0, un = nh + k0, wn = ih - T0, Vl = C - un, Ql = Vl * v0, Li = Ql + wn, Gc = t - un, Pi = t - Wi, Yl = B - Bi, w0 = Yl / v0, Hn = Pi - w0, Kl = Wi + w0, Si = n - Bi, Ci = n - wn, Zl = n - Li, t - nh, n - ih, Kn = "M" + Wi + "," + Bi + " L" + un + "," + wn + " L" + C + "," + Li + " L" + Gc + "," + wn + " L" + Pi + "," + Bi + " L" + Hn + "," + B + " L" + Pi + "," + Si + " L" + Gc + "," + Ci + " L" + C + "," + Zl + " L" + un + "," + Ci + " L" + Wi + "," + Si + " L" + Kl + "," + B + " z";
					} else if (M == "mathPlus") {
						F === void 0 ? j = 23520 * k : j = j * k;
						var Kt = 73490 * k, ue = Math.min(t, n), te = j < 0 ? 0 : j > Kt ? Kt : j, Se = t * Kt / la, we = n * Kt / la, oe = ue * te / la, I = C - Se, G = C - oe, Z = C + oe, he = C + Se, P = B - we, O = B - oe, V = B + oe, ie = B + we;
						Kn = "M" + I + "," + O + " L" + G + "," + O + " L" + G + "," + P + " L" + Z + "," + P + " L" + Z + "," + O + " L" + he + "," + O + " L" + he + "," + V + " L" + Z + "," + V + " L" + Z + "," + ie + " L" + G + "," + ie + " L" + G + "," + V + " L" + I + "," + V + " z";
					}
					p += "<path d='" + Kn + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "can":
				case "flowChartMagneticDisk":
				case "flowChartMagneticDrum":
					var me = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Ue = 25e3 * k, q = 5e4 * k, ee = 2e5 * k;
					me !== void 0 && (Ue = parseInt(me.substr(4)) * k);
					var ue = Math.min(t, n), ta, Me, P, O, V, Kn;
					(M == "flowChartMagneticDisk" || M == "flowChartMagneticDrum") && (Ue = 5e4 * k), ta = q * n / ue, Me = Ue < 0 ? 0 : Ue > ta ? ta : Ue, P = ue * Me / ee, O = P + P, V = n - P;
					var ba = 180, ze = t / 2, yi = "";
					M == "flowChartMagneticDrum" && (yi = "transform='rotate(90 " + t / 2 + "," + n / 2 + ")'"), Kn = ae(ze, P, ze, P, 0, ba, !1) + ae(ze, P, ze, P, ba, ba + ba, !1).replace("M", "L") + " L" + t + "," + V + ae(ze, V, ze, P, 0, ba, !1).replace("M", "L") + " L0," + P, p += "<path " + yi + " d='" + Kn + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "swooshArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), ge = k, be, j = 25e3 * ge, xe, R = 16667 * ge;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * ge) : Y == "adj2" && (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) * ge);
					}
					var q = 1 * ge, ee = 7e4 * ge, la = 75e3 * ge, lt = 1e5 * ge, ue = Math.min(t, n), Od = ue / 8, _0 = n / 6, te = j < q ? q : j > la ? la : j, fa = ee * t / ue, ye = R < 0 ? 0 : R > fa ? fa : R, ef = n * te / lt, qp = ue * ye / lt, un = t - qp, wn = Od, af = Math.PI / 2 / 14, tf = Od * Math.tan(af), yr = un - tf, Se = ef * Math.tan(af), Ui = wn + ef, Hn = un + Se, Pi = Hn + tf, Yd = Ui + Od, Ee = Yd - 0, Vp = Ee / 2, Ga = n / 20, F0 = Vp - Ga, Yn = _0, Qp = _0 + Yn, Yp = t / 6, ur = _0 / 2, Kp = Ui + ur, Zp = t / 4, Kn = "M0," + n + " Q" + Yp + "," + Qp + " " + un + "," + wn + " L" + yr + ",0 L" + t + "," + F0 + " L" + Pi + "," + Yd + " L" + Hn + "," + Ui + " Q" + Zp + "," + Kp + " 0," + n + " z";
					p += "<path d='" + Kn + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "circularArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 12500 * k, xe, R = 1142319 / 6e4 * Math.PI / 180, Ye, fe = 20457681 / 6e4 * Math.PI / 180, qa, oa = 108e5 / 6e4 * Math.PI / 180, Di, kt = 12500 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) / 6e4 * Math.PI / 180) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) / 6e4 * Math.PI / 180) : Y == "adj4" ? (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) / 6e4 * Math.PI / 180) : Y == "adj5" && (Di = c(F[A], ["attrs", "fmla"]), kt = parseInt(Di.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, ra = t, Qe = n, va = 0, Wa = 0, ze = t / 2, Ae = n / 2, ue = Math.min(t, n), vi, ea, te, Pn, Ea, ca, pn, bn, zt, jt, en, an, _i, Mi, Gd, Nd, Fi, Ii, Rd, Ci, At, ft, Xn, Ai, Xd, Hd, $d, gd, rh, dh, oh, ch, sh, Pr, hh, gh, Sr, lh, Er, fh, ph, bh, M0, uh, Sn, Jd, qd, mh, xh, Wi, Bi, Vd, Qd, yh, Dh, Pi, Yd, vh, Uh, Kd, Si, Lh, kh, un, wn, Ca, wa, Ma, _a, tn, Zd, eo, Ei, zi, ji, Zn, ao, Aa, Fa, Oi, Dt, _t, qt, mn, bt, cn, to, Th, no, xn, sn, hn, io, Ot, ro, wh, oo, co, so, _h, ho, go, lo, fo, po, Mh, Fh, bo, Ih, Ch, uo, mo, Hn, Ui, Gi, Ni, xo, yo, Ri, Xi, Do, Ah, xr, Hi, Wh, ei, Bh, Ph, vo, Sh, Uo, Eh, Lo, ko, To, zh, wo, jh, _o, Mo, Fo, Oh, Io, Co, Ao, Wo, Bo, Gh, Nh, Po, Rh, Xh, So, Eo, yr, Li, zr, Hh, $n, jr, $h, ld, zo, jo, Jh, qh, $i, Vh, Qh, Yh, Kh, Or, Zh, e1, Gr, a1, Va, q = 25e3 * k, ee = 1e5 * k, Oc = 1 / 6e4 * Math.PI / 180, mr = 21599999 / 6e4 * Math.PI / 180, Tn = 2 * Math.PI;
					vi = kt < 0 ? 0 : kt > q ? q : kt, ea = vi * 2, te = j < 0 ? 0 : j > ea ? ea : j, Pn = fe < Oc ? Oc : fe > mr ? mr : fe, Ea = oa < 0 ? 0 : oa > mr ? mr : oa, ca = ue * te / ee, pn = ue * vi / ee, bn = ca / 2, zt = ze + bn - pn, jt = Ae + bn - pn, en = zt - ca, an = jt - ca, _i = en + bn, Mi = an + bn, Gd = _i * Math.sin(Pn), Nd = Mi * Math.cos(Pn), Fi = _i * Math.cos(Math.atan2(Gd, Nd)), Ii = Mi * Math.sin(Math.atan2(Gd, Nd)), Rd = C + Fi, Ci = B + Ii, At = en < an ? en : an, ft = Fi * Fi, Xn = Ii * Ii, Ai = At * At, Xd = ft - Ai, Hd = Xn - Ai, $d = Xd * Hd / ft, gd = $d / Xn, rh = 1 - gd, dh = Math.sqrt(rh), oh = Xd / Fi, ch = oh / Ii, sh = (1 + dh) / ch, Pr = Math.atan2(sh, 1), hh = Pr + Tn, gh = Pr > 0 ? Pr : hh, Sr = gh - Pn, lh = Sr + Tn, Er = Sr > 0 ? Sr : lh, fh = Er - ba, ph = Er - Tn, bh = fh > 0 ? ph : Er, M0 = Math.abs(bh), uh = R < 0 ? 0 : R > M0 ? M0 : R, Sn = Pn + uh, Jd = _i * Math.sin(Sn), qd = Mi * Math.cos(Sn), mh = _i * Math.cos(Math.atan2(Jd, qd)), xh = Mi * Math.sin(Math.atan2(Jd, qd)), Wi = C + mh, Bi = B + xh, Vd = zt * Math.sin(Ea), Qd = jt * Math.cos(Ea), yh = zt * Math.cos(Math.atan2(Vd, Qd)), Dh = jt * Math.sin(Math.atan2(Vd, Qd)), Pi = C + yh, Yd = B + Dh, vh = pn * Math.cos(Sn), Uh = pn * Math.sin(Sn), Kd = Rd + vh, Si = Ci + Uh, Lh = pn * Math.cos(Sn), kh = pn * Math.sin(Sn), un = Rd - Lh, wn = Ci - kh, Ca = un - C, wa = wn - B, Ma = Kd - C, _a = Si - B, tn = zt < jt ? zt : jt, Zd = Ca * tn / zt, eo = wa * tn / jt, Ei = Ma * tn / zt, zi = _a * tn / jt, ji = Ei - Zd, Zn = zi - eo, ao = Math.sqrt(ji * ji + Zn * Zn), Aa = Zd * zi, Fa = Ei * eo, Oi = Aa - Fa, Dt = tn * tn, _t = ao * ao, qt = Dt * _t, mn = Oi * Oi, bt = qt - mn, cn = bt > 0 ? bt : 0, to = Math.sqrt(cn), Th = Zn * -1, no = Th > 0 ? -1 : 1, xn = no * ji, sn = xn * to, hn = Oi * Zn, io = (hn + sn) / _t, Ot = hn - sn, ro = Ot / _t, wh = Math.abs(Zn), oo = wh * to, co = Oi * ji / -1, so = (co + oo) / _t, _h = co - oo, ho = _h / _t, go = Ei - io, lo = Ei - ro, fo = zi - so, po = zi - ho, Mh = Math.sqrt(go * go + fo * fo), Fh = Math.sqrt(lo * lo + po * po), bo = Fh - Mh, Ih = bo > 0 ? io : ro, Ch = bo > 0 ? so : ho, uo = Ih * zt / tn, mo = Ch * jt / tn, Hn = C + uo, Ui = B + mo, Gi = Ca * At / en, Ni = wa * At / an, xo = Ma * At / en, yo = _a * At / an, Ri = xo - Gi, Xi = yo - Ni, Do = Math.sqrt(Ri * Ri + Xi * Xi), Ah = Gi * yo, xr = xo * Ni, Hi = Ah - xr, Wh = At * At, ei = Do * Do, Bh = Wh * ei, Ph = Hi * Hi, vo = Bh - Ph, Sh = vo > 0 ? vo : 0, Uo = Math.sqrt(Sh), Eh = no * Ri, Lo = Eh * Uo, ko = Hi * Xi, To = (ko + Lo) / ei, zh = ko - Lo, wo = zh / ei, jh = Math.abs(Xi), _o = jh * Uo, Mo = Hi * Ri / -1, Fo = (Mo + _o) / ei, Oh = Mo - _o, Io = Oh / ei, Co = Gi - To, Ao = Gi - wo, Wo = Ni - Fo, Bo = Ni - Io, Gh = Math.sqrt(Co * Co + Wo * Wo), Nh = Math.sqrt(Ao * Ao + Bo * Bo), Po = Nh - Gh, Rh = Po > 0 ? To : wo, Xh = Po > 0 ? Fo : Io, So = Rh * en / At, Eo = Xh * an / At, yr = C + So, Li = B + Eo, zr = Math.atan2(Eo, So), Hh = zr + Tn, $n = zr > 0 ? zr : Hh, jr = Ea - $n, $h = jr - Tn, ld = jr > 0 ? $h : jr, zo = Hn - yr, jo = Ui - Li, Jh = Math.sqrt(zo * zo + jo * jo), qh = Jh / 2, $i = qh - pn, Vh = $i > 0 ? Hn : Kd, Qh = $i > 0 ? Ui : Si, Yh = $i > 0 ? yr : un, Kh = $i > 0 ? Li : wn, Or = Math.atan2(mo, uo), Zh = Or + Tn, e1 = Or > 0 ? Or : Zh, Gr = e1 - Ea, a1 = Gr + Tn, Va = Gr > 0 ? Gr : a1;
					var t1 = Ea * 180 / Math.PI, ki = t1 + Va * 180 / Math.PI, Nc = $n * 180 / Math.PI, I0 = ld * 180 / Math.PI, C0 = Nc + I0, _e = ae(t / 2, n / 2, zt, jt, t1, ki, !1) + " L" + Vh + "," + Qh + " L" + Wi + "," + Bi + " L" + Yh + "," + Kh + " L" + yr + "," + Li + ae(t / 2, n / 2, en, an, Nc, C0, !1).replace("M", "L") + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftCircularArrow":
					var F = c(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), be, j = 12500 * k, xe, R = -1142319 / 6e4 * Math.PI / 180, Ye, fe = 1142319 / 6e4 * Math.PI / 180, qa, oa = 108e5 / 6e4 * Math.PI / 180, Di, kt = 12500 * k;
					if (F !== void 0) for (var A = 0; A < F.length; A++) {
						var Y = c(F[A], ["attrs", "name"]);
						Y == "adj1" ? (be = c(F[A], ["attrs", "fmla"]), j = parseInt(be.substr(4)) * k) : Y == "adj2" ? (xe = c(F[A], ["attrs", "fmla"]), R = parseInt(xe.substr(4)) / 6e4 * Math.PI / 180) : Y == "adj3" ? (Ye = c(F[A], ["attrs", "fmla"]), fe = parseInt(Ye.substr(4)) / 6e4 * Math.PI / 180) : Y == "adj4" ? (qa = c(F[A], ["attrs", "fmla"]), oa = parseInt(qa.substr(4)) / 6e4 * Math.PI / 180) : Y == "adj5" && (Di = c(F[A], ["attrs", "fmla"]), kt = parseInt(Di.substr(4)) * k);
					}
					var B = n / 2, C = t / 2, ra = t, Qe = n, va = 0, Wa = 0, ze = t / 2, Ae = n / 2, ue = Math.min(t, n), q = 25e3 * k, ee = 1e5 * k, Oc = 1 / 6e4 * Math.PI / 180, mr = 21599999 / 6e4 * Math.PI / 180, Tn = 2 * Math.PI, vi = kt < 0 ? 0 : kt > q ? q : kt, ea = vi * 2, te = j < 0 ? 0 : j > ea ? ea : j, Pn = fe < Oc ? Oc : fe > mr ? mr : fe, Ea = oa < 0 ? 0 : oa > mr ? mr : oa, ca = ue * te / ee, pn = ue * vi / ee, bn = ca / 2, zt = ze + bn - pn, jt = Ae + bn - pn, en = zt - ca, an = jt - ca, _i = en + bn, Mi = an + bn, Gd = _i * Math.sin(Pn), Nd = Mi * Math.cos(Pn), Fi = _i * Math.cos(Math.atan2(Gd, Nd)), Ii = Mi * Math.sin(Math.atan2(Gd, Nd)), Rd = C + Fi, Ci = B + Ii, At = en < an ? en : an, ft = Fi * Fi, Xn = Ii * Ii, Ai = At * At, Xd = ft - Ai, Hd = Xn - Ai, $d = Xd * Hd / ft, gd = $d / Xn, rh = 1 - gd, dh = Math.sqrt(rh), oh = Xd / Fi, ch = oh / Ii, sh = (1 + dh) / ch, Pr = Math.atan2(sh, 1), hh = Pr + Tn, gh = Pr > 0 ? Pr : hh, Sr = gh - Pn, lh = Sr + Tn, Er = Sr > 0 ? Sr : lh, fh = Er - ba, ph = Er - Tn, bh = fh > 0 ? ph : Er, nf = Math.abs(bh) * -1, ye = Math.abs(R) * -1, uh = ye < nf ? nf : ye > 0 ? 0 : ye, Sn = Pn + uh, Jd = _i * Math.sin(Sn), qd = Mi * Math.cos(Sn), mh = _i * Math.cos(Math.atan2(Jd, qd)), xh = Mi * Math.sin(Math.atan2(Jd, qd)), Wi = C + mh, Bi = B + xh, Vd = zt * Math.sin(Ea), Qd = jt * Math.cos(Ea), yh = zt * Math.cos(Math.atan2(Vd, Qd)), Dh = jt * Math.sin(Math.atan2(Vd, Qd)), Pi = C + yh, Yd = B + Dh, rf = en * Math.sin(Ea), df = an * Math.cos(Ea), eb = en * Math.cos(Math.atan2(rf, df)), ab = an * Math.sin(Math.atan2(rf, df)), Gc = C + eb, F0 = B + ab, vh = pn * Math.cos(Sn), Uh = pn * Math.sin(Sn), Kd = Rd + vh, Si = Ci + Uh, Lh = pn * Math.cos(Sn), kh = pn * Math.sin(Sn), un = Rd - Lh, wn = Ci - kh, Ca = un - C, wa = wn - B, Ma = Kd - C, _a = Si - B, tn = zt < jt ? zt : jt, Zd = Ca * tn / zt, eo = wa * tn / jt, Ei = Ma * tn / zt, zi = _a * tn / jt, ji = Ei - Zd, Zn = zi - eo, ao = Math.sqrt(ji * ji + Zn * Zn), Aa = Zd * zi, Fa = Ei * eo, Oi = Aa - Fa, Dt = tn * tn, _t = ao * ao, qt = Dt * _t, mn = Oi * Oi, bt = qt - mn, cn = bt > 0 ? bt : 0, to = Math.sqrt(cn), Th = Zn * -1, no = Th > 0 ? -1 : 1, xn = no * ji, sn = xn * to, hn = Oi * Zn, io = (hn + sn) / _t, Ot = hn - sn, ro = Ot / _t, wh = Math.abs(Zn), oo = wh * to, co = Oi * ji / -1, so = (co + oo) / _t, _h = co - oo, ho = _h / _t, go = Ei - io, lo = Ei - ro, fo = zi - so, po = zi - ho, Mh = Math.sqrt(go * go + fo * fo), Fh = Math.sqrt(lo * lo + po * po), bo = Fh - Mh, Ih = bo > 0 ? io : ro, Ch = bo > 0 ? so : ho, uo = Ih * zt / tn, mo = Ch * jt / tn, Hn = C + uo, Ui = B + mo, Gi = Ca * At / en, Ni = wa * At / an, xo = Ma * At / en, yo = _a * At / an, Ri = xo - Gi, Xi = yo - Ni, Do = Math.sqrt(Ri * Ri + Xi * Xi), Ah = Gi * yo, xr = xo * Ni, Hi = Ah - xr, Wh = At * At, ei = Do * Do, Bh = Wh * ei, Ph = Hi * Hi, vo = Bh - Ph, Sh = vo > 0 ? vo : 0, Uo = Math.sqrt(Sh), Eh = no * Ri, Lo = Eh * Uo, ko = Hi * Xi, To = (ko + Lo) / ei, zh = ko - Lo, wo = zh / ei, jh = Math.abs(Xi), _o = jh * Uo, Mo = Hi * Ri / -1, Fo = (Mo + _o) / ei, Oh = Mo - _o, Io = Oh / ei, Co = Gi - To, Ao = Gi - wo, Wo = Ni - Fo, Bo = Ni - Io, Gh = Math.sqrt(Co * Co + Wo * Wo), Nh = Math.sqrt(Ao * Ao + Bo * Bo), Po = Nh - Gh, Rh = Po > 0 ? To : wo, Xh = Po > 0 ? Fo : Io, So = Rh * en / At, Eo = Xh * an / At, yr = C + So, Li = B + Eo, zr = Math.atan2(Eo, So), Hh = zr + Tn, of = zr > 0 ? zr : Hh, jr = Ea - of, $h = jr + Tn, cf = jr > 0 ? jr : $h, $n = of + cf, ld = -cf, zo = Hn - yr, jo = Ui - Li, Jh = Math.sqrt(zo * zo + jo * jo), qh = Jh / 2, $i = qh - pn, Vh = $i > 0 ? Hn : Kd, Qh = $i > 0 ? Ui : Si, Yh = $i > 0 ? yr : un, Kh = $i > 0 ? Li : wn, Or = Math.atan2(mo, uo), Zh = Or + Tn, e1 = Or > 0 ? Or : Zh, Gr = e1 - Ea, a1 = Gr - Tn, Va = Gr > 0 ? a1 : Gr, t1 = (Ea + Va) * 180 / Math.PI, ki = Ea * 180 / Math.PI, Nc = $n * 180 / Math.PI, I0 = ld * 180 / Math.PI, C0 = Nc + I0, _e = "M" + Pi + "," + Yd + " L" + Gc + "," + F0 + ae(t / 2, n / 2, en, an, Nc, C0, !1).replace("M", "L") + " L" + Yh + "," + Kh + " L" + Wi + "," + Bi + " L" + Vh + "," + Qh + " L" + Hn + "," + Ui + ae(t / 2, n / 2, zt, jt, t1, ki, !1).replace("M", "L") + " z";
					p += "<path d='" + _e + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + U.color + "' stroke-width='" + U.width + "' stroke-dasharray='" + U.strokeDasharray + "' />";
					break;
				case "leftRightCircularArrow":
				case "chartPlus":
				case "chartStar":
				case "chartX":
				case "cornerTabs":
				case "flowChartOfflineStorage":
				case "folderCorner":
				case "funnel":
				case "lineInv":
				case "nonIsoscelesTrapezoid":
				case "plaqueTabs":
				case "squareTabs":
				case "upDownArrowCallout":
					console.log(M, " -unsupported shape type.");
					break;
				default: console.warn("Undefine shape type.(" + M + ")");
			}
			p += "</svg>", p += "<div class='block " + h1(e, a, h, s) + " " + g1(e, s, f) + "' _id='" + o + "' _idx='" + d + "' _type='" + s + "' _name='" + r + "' style='" + Yi(b, i, L, v, T, m) + Ki(b, L, v, m) + " z-index: " + g + ";transform: rotate(" + (ke !== void 0 ? ke : 0) + "deg);'>", e["p:txBody"] !== void 0 && (D === void 0 || D === !0) && (s != "diagram" && s != "textBox" && (s = "shape"), p += await Zc(e["p:txBody"], e, a, h, s, d, f, void 0, m)), p += "</div>";
		} else if (J !== void 0) {
			var Oo = c(c(J, ["a:pathLst"]), ["a:path"]);
			let Gt = Oo.attrs || {};
			var tb = mt(Gt.w, 21600), nb = mt(Gt.h, 21600), Go = 1 / tb * t, No = 1 / nb * n, Ro = c(Oo, ["a:moveTo"]) || [];
			Ro.length;
			var sf = Oo["a:lnTo"], hf = Oo["a:cubicBezTo"], gf = Oo["a:arcTo"], lf = c(Oo, ["a:close"]);
			Array.isArray(Ro) || (Ro = [Ro]);
			var Qa = [];
			if (Ro.length > 0) {
				if (ni(Ro).forEach(function(Za) {
					var Tt = Za["a:pt"];
					Tt !== void 0 && ni(Tt).forEach(function(Jn) {
						var _n = Jn.attrs || {};
						if (!(_n.x === void 0 || _n.y === void 0)) {
							var nn = {}, Rc = _n.x, Xc = _n.y, Xo = _n.order;
							nn.type = "movto", nn.order = mt(Xo, Qa.length), nn.x = Rc, nn.y = Xc, Qa.push(nn);
						}
					});
				}), sf !== void 0 && ni(sf).forEach(function(Za) {
					var Tt = Za["a:pt"];
					Tt !== void 0 && ni(Tt).forEach(function(Jn) {
						var _n = Jn.attrs || {};
						if (!(_n.x === void 0 || _n.y === void 0)) {
							var nn = {}, Rc = _n.x, Xc = _n.y, Xo = _n.order;
							nn.type = "lnto", nn.order = mt(Xo, Qa.length), nn.x = Rc, nn.y = Xc, Qa.push(nn);
						}
					});
				}), hf !== void 0) {
					var ff = [];
					ni(hf).forEach(function(Za) {
						ff.push(Za["a:pt"]);
					}), ff.forEach(function(Za) {
						Za = ni(Za);
						var Tt = {};
						Tt.type = "cubicBezTo", Tt.order = mt(c(Za[0], ["attrs", "order"]), Qa.length);
						var Jn = [];
						Za.forEach(function(_n) {
							var nn = _n.attrs || {};
							nn.x !== void 0 && nn.y !== void 0 && Jn.push({
								x: nn.x,
								y: nn.y
							});
						}), Jn.length === 3 && (Tt.cubBzPt = Jn, Qa.push(Tt));
					});
				}
				gf !== void 0 && ni(gf).forEach(function(Za) {
					var Tt = Za.attrs || {};
					if (!(Tt.hR === void 0 || Tt.wR === void 0 || Tt.stAng === void 0 || Tt.swAng === void 0)) {
						var Jn = Tt.order, _n = Tt.hR, nn = Tt.wR, Rc = Tt.stAng, Xc = Tt.swAng, Xo = 0, kf = 0, A0 = c(Za, ["a:pt", "attrs"]);
						A0 !== void 0 && (Xo = A0.x, kf = A0.y);
						var Dr = {};
						Dr.type = "arcTo", Dr.order = mt(Jn, Qa.length), Dr.hR = _n, Dr.wR = nn, Dr.stAng = Rc, Dr.swAng = Xc, Dr.shftX = Xo, Dr.shftY = kf, Qa.push(Dr);
					}
				}), lf !== void 0 && ni(lf).forEach(function(Za) {
					var Tt = (Za.attrs || {}).order, Jn = {};
					Jn.type = "close", Jn.order = mt(Tt, Qa.length), Qa.push(Jn);
				}), Qa.sort(function(Za, Tt) {
					return Za.order - Tt.order;
				});
				for (var ut = 0, tc = !1, Ie = ""; ut < Qa.length;) {
					if (Qa[ut].type == "movto") {
						var pf = mt(Qa[ut].x, NaN) * Go, bf = mt(Qa[ut].y, NaN) * No;
						if (!Number.isFinite(pf) || !Number.isFinite(bf)) {
							ut++;
							continue;
						}
						Ie += " M" + pf + "," + bf;
					} else if (Qa[ut].type == "lnto") {
						var uf = mt(Qa[ut].x, NaN) * Go, mf = mt(Qa[ut].y, NaN) * No;
						if (!Number.isFinite(uf) || !Number.isFinite(mf)) {
							ut++;
							continue;
						}
						Ie += " L" + uf + "," + mf;
					} else if (Qa[ut].type == "cubicBezTo") {
						var xf = mt(Qa[ut].cubBzPt[0].x, NaN) * Go, yf = mt(Qa[ut].cubBzPt[0].y, NaN) * No, Df = mt(Qa[ut].cubBzPt[1].x, NaN) * Go, vf = mt(Qa[ut].cubBzPt[1].y, NaN) * No, Uf = mt(Qa[ut].cubBzPt[2].x, NaN) * Go, Lf = mt(Qa[ut].cubBzPt[2].y, NaN) * No;
						if (![
							xf,
							yf,
							Df,
							vf,
							Uf,
							Lf
						].every(Number.isFinite)) {
							ut++;
							continue;
						}
						Ie += " C" + xf + "," + yf + " " + Df + "," + vf + " " + Uf + "," + Lf;
					} else if (Qa[ut].type == "arcTo") {
						var Ve = mt(Qa[ut].hR, NaN) * Go, Sa = mt(Qa[ut].wR, NaN) * No, Ea = mt(Qa[ut].stAng, NaN) / 6e4, Va = mt(Qa[ut].swAng, NaN) / 6e4;
						if (![
							Ve,
							Sa,
							Ea,
							Va
						].every(Number.isFinite)) {
							ut++;
							continue;
						}
						var ki = Ea + Va;
						Ie += ae(Sa, Ve, Sa, Ve, Ea, ki, !1);
					} else Qa[ut].type == "quadBezTo" ? console.log("custShapType: quadBezTo - TODO") : Qa[ut].type == "close" && (Ie += "z");
					ut++;
				}
				Ie && !/NaN/.test(Ie) && (p += "<path d='" + Ie + "' fill='" + (H ? "url(#imgPtrn_" + l + ")" : _ ? "url(#linGrd_" + l + ")" : W) + "' stroke='" + (U === void 0 ? "" : U.color) + "' stroke-width='" + (U === void 0 ? "" : U.width) + "' stroke-dasharray='" + (U === void 0 ? "" : U.strokeDasharray) + "' ", p += "/>");
			}
			p += "</svg>", p += "<div class='block " + h1(e, a, h, s) + " " + g1(e, s, f) + "' _id='" + o + "' _idx='" + d + "' _type='" + s + "' _name='" + r + "' style='" + Yi(b, i, L, v, T, m) + Ki(b, L, v, m) + " z-index: " + g + ";transform: rotate(" + (ke !== void 0 ? ke : 0) + "deg);'>", e["p:txBody"] !== void 0 && (D === void 0 || D === !0) && (s != "diagram" && s != "textBox" && (s = "shape"), p += await Zc(e["p:txBody"], e, a, h, s, d, f, void 0, m)), p += "</div>";
		} else p += "<div class='block " + h1(e, a, h, s) + " " + g1(e, s, f) + "' _id='" + o + "' _idx='" + d + "' _type='" + s + "' _name='" + r + "' style='" + Yi(b, i, L, v, T, m) + Ki(b, L, v, m) + ii(e, i, !1, "shape", f) + await ns(e, i, !1, f, w) + " z-index: " + g + ";transform: rotate(" + (ke !== void 0 ? ke : 0) + "deg);'>", e["p:txBody"] !== void 0 && (D === void 0 || D === !0) && (p += await Zc(e["p:txBody"], e, a, h, s, d, f, void 0, m)), p += "</div>";
		return p;
	}
	function C2(e, i, a, h, o) {
		var r = parseInt(h), d = parseInt(a), s = parseInt(e) / 2, g = r - d;
		g < 0 && (g = 360 + g), g = Math.min(Math.max(g, 0), 360);
		var f = Math.cos(2 * Math.PI / (360 / g)), D = Math.sin(2 * Math.PI / (360 / g)), T, w, m;
		if (o) T = g <= 180 ? 0 : 1, w = "M" + s + "," + s + " L" + s + ",0 A" + s + "," + s + " 0 " + T + ",1 " + (s + D * s) + "," + (s - f * s) + " z", m = "rotate(" + (d - 270) + ", " + s + ", " + s + ")";
		else {
			T = g <= 180 ? 0 : 1;
			var x = s, b = i / 2;
			w = "M" + x + ",0 A" + b + "," + x + " 0 " + T + ",1 " + (b + D * b) + "," + (x - f * x), m = "rotate(" + (d + 90) + ", " + s + ", " + s + ")";
		}
		return [w, m];
	}
	function A2(e, i, a) {
		var h = i, o = 1.5 * h, r = o;
		let d = o, s = a, g = o, f = h, D = 50, T = 35, w = 2 * Math.PI, m = w / (s * 2), x = m * T * .005, b = m * D * .005, L = m, v = !1;
		for (var p = " M" + (r + g * Math.cos(b)) + " " + (d + g * Math.sin(b)); L <= w + m; L += m) v ? (p += " L" + (r + f * Math.cos(L - x)) + "," + (d + f * Math.sin(L - x)), p += " L" + (r + g * Math.cos(L + b)) + "," + (d + g * Math.sin(L + b))) : (p += " L" + (r + g * Math.cos(L - b)) + "," + (d + g * Math.sin(L - b)), p += " L" + (r + f * Math.cos(L + x)) + "," + (d + f * Math.sin(L + x))), v = !v;
		return p += " ", p;
	}
	function ae(e, i, a, h, o, r, d) {
		var s, g = o;
		if (r >= o) for (; g <= r;) {
			var f = g * (Math.PI / 180), D = e + Math.cos(f) * a, T = i + Math.sin(f) * h;
			g == o && (s = " M" + D + " " + T), s += " L" + D + " " + T, g++;
		}
		else for (; g > r;) {
			var f = g * (Math.PI / 180), D = e + Math.cos(f) * a, T = i + Math.sin(f) * h;
			g == o && (s = " M " + D + " " + T), s += " L " + D + " " + T, g--;
		}
		return s += d ? " z" : "", s;
	}
	function W2(e, i, a, h, o, r) {
		var d, s, g, f;
		r == "cornr1" ? (d = 0, s = 0, g = 0, f = a) : r == "cornr2" ? (d = a, s = h, g = h, f = a) : r == "cornrAll" ? (d = a, s = a, g = a, f = a) : r == "diag" && (d = a, s = h, g = a, f = h);
		var D;
		return o == "round" ? D = "M0," + (i / 2 + (1 - s) * (i / 2)) + " Q0," + i + " " + s * (e / 2) + "," + i + " L" + (e / 2 + (1 - g) * (e / 2)) + "," + i + " Q" + e + "," + i + " " + e + "," + (i / 2 + i / 2 * (1 - g)) + "L" + e + "," + i / 2 * f + " Q" + e + ",0 " + (e / 2 + e / 2 * (1 - f)) + ",0 L" + e / 2 * d + ",0 Q0,0 0," + i / 2 * d + " z" : o == "snip" && (D = "M0," + d * (i / 2) + " L0," + (i / 2 + i / 2 * (1 - s)) + "L" + s * (e / 2) + "," + i + " L" + (e / 2 + e / 2 * (1 - g)) + "," + i + "L" + e + "," + (i / 2 + i / 2 * (1 - g)) + " L" + e + "," + f * (i / 2) + "L" + (e / 2 + e / 2 * (1 - f)) + ",0 L" + e / 2 * d + ",0 z"), D;
	}
	async function B2(e, i, a, h, o) {
		var r = "", d = !1, s = e.attrs.order, g = e["p:blipFill"]["a:blip"].attrs["r:embed"], f;
		a == "slideMasterBg" ? f = i.masterResObj : a == "slideLayoutBg" ? f = i.layoutResObj : f = i.slideResObj;
		var D = f[g].target, T = m1(D).toLowerCase(), w = i.zip, m = await w.file(D).async("arraybuffer"), x = e["p:spPr"]["a:xfrm"];
		if (x === void 0) {
			var b = c(e, [
				"p:nvPicPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"idx"
			]);
			c(e, [
				"p:nvPicPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]), b !== void 0 && (x = c(i.slideLayoutTables, [
				"idxTable",
				b,
				"p:spPr",
				"a:xfrm"
			]));
		}
		var L = 0, v = c(e, [
			"p:spPr",
			"a:xfrm",
			"attrs",
			"rot"
		]);
		v !== void 0 && (L = Dd(v));
		var p = c(e, [
			"p:nvPicPr",
			"p:nvPr",
			"a:videoFile"
		]), l, M, J, se, ne, ce, N, ke = !1, ve = !1, S = Qc.mediaProcess;
		p !== void 0 & S && (l = p.attrs["r:link"], M = f[l].target, Lp(M) ? (M = ds(M), ve = !0, ke = !0, d = !0) : (J = m1(M).toLowerCase(), (J == "mp4" || J == "webm" || J == "ogg") && (ne = await w.file(M).async("arraybuffer"), se = rs(J), ce = new Blob([ne], { type: se }), N = URL.createObjectURL(ce), ke = !0, d = !0)));
		var K = c(e, [
			"p:nvPicPr",
			"p:nvPr",
			"a:audioFile"
		]), y, X, le, t, n, pe, Be = !1, W;
		if (K !== void 0 & S && (y = K.attrs["r:link"], X = f[y].target, le = m1(X).toLowerCase(), le == "mp3" || le == "wav" || le == "ogg")) {
			t = await w.file(X).async("arraybuffer"), n = new Blob([t]), pe = URL.createObjectURL(n);
			var _ = parseInt(x["a:ext"].attrs.cx) * 20, H = x["a:ext"].attrs.cy, Le = parseInt(x["a:off"].attrs.x) / 2.5, Te = x["a:off"].attrs.y;
			W = {
				"a:ext": { attrs: {
					cx: _,
					cy: H
				} },
				"a:off": { attrs: {
					x: Le,
					y: Te
				} }
			}, Be = !0, ke = !0, d = !0;
		}
		rs(T);
		var Ua = ig(T, m), ya = F2(e["p:blipFill"]);
		return r = "<div class='block content' style='" + Yi(S && Be ? W : x, e, void 0, void 0, h, o) + Ki(S && Be ? W : x, void 0, void 0, o) + " z-index: " + s + ";transform: rotate(" + L + "deg);" + (p === void 0 && K === void 0 || !S || !ke ? ya.container : "") + "'>", p === void 0 && K === void 0 || !S || !ke ? r += "<img src='" + Ua + "' style='" + ya.image + "'/>" : (p !== void 0 || K !== void 0) && S && ke && (p !== void 0 && !ve ? r += "<video  src='" + N + "' controls style='width: 100%; height: 100%'>Your browser does not support the video tag.</video>" : p !== void 0 && ve && (r += "<iframe   src='" + M + "' controls style='width: 100%; height: 100%'></iframe >"), K !== void 0 && (r += "<audio id=\"audio_player\" controls ><source src=\"" + pe + "\"></audio>")), !ke && d && (r += "<span style='color:red;font-size:40px;position: absolute;'>This media file Not supported by HTML5</span>"), (p !== void 0 || K !== void 0) && !S && ke && console.log("Founded supported media file but media process disabled (mediaProcess=false)"), r += "</div>", r;
	}
	async function P2(e, i, a, h, o) {
		var r = "";
		switch (c(e, [
			"a:graphic",
			"a:graphicData",
			"attrs",
			"uri"
		])) {
			case "http://schemas.openxmlformats.org/drawingml/2006/table":
				r = await G2(e, i, o);
				break;
			case "http://schemas.openxmlformats.org/drawingml/2006/chart":
				r = await N2(e, i, o);
				break;
			case "http://schemas.openxmlformats.org/drawingml/2006/diagram":
				r = await R2(e, i, a, h, o);
				break;
			case "http://schemas.openxmlformats.org/presentationml/2006/ole":
				var d = c(e, [
					"a:graphic",
					"a:graphicData",
					"mc:AlternateContent",
					"mc:Fallback",
					"p:oleObj"
				]);
				d === void 0 && (d = c(e, [
					"a:graphic",
					"a:graphicData",
					"p:oleObj"
				])), d !== void 0 && (r = await s1(d, i, a, o));
				break;
			default:
		}
		return r;
	}
	var Kc = !1;
	async function Zc(e, i, a, h, o, r, d, s, g) {
		var f = "";
		if (d.slideMasterTextStyles, e === void 0) return f;
		var D = c(i, ["p:style", "a:fontRef"]), T = e["a:p"];
		T.constructor !== Array && (T = [T]);
		for (var w = 0; w < T.length; w++) {
			var m = T[w], x = m["a:r"], b = m["a:fld"], L = m["a:br"];
			x !== void 0 && (x = x.constructor === Array ? x : [x]), x !== void 0 && b !== void 0 && (b = b.constructor === Array ? b : [b], x = x.concat(b)), x !== void 0 && L !== void 0 && (Kc = !0, L = L.constructor === Array ? L : [L], L.forEach(function(Le, Te) {
				Le.type = "br";
			}), L.length > 1 && L.shift(), x = x.concat(L), x.sort(function(Le, Te) {
				return Le.attrs.order - Te.attrs.order;
			}));
			var v = "", p = X2(m, e, o, r, d);
			p != "" && (v = p), (o == "body" || o == "obj" || o == "shape") && (v += "font-size: 0px;", v += "font-weight: 100;", v += "font-style: normal;");
			var l = "";
			v in Mt ? l = Mt[v].name : (l = "_css_" + (Object.keys(Mt).length + 1), Mt[v] = {
				name: l,
				text: v
			});
			var M = c(i, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cx"
			]);
			M === void 0 && (M = c(a, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cx"
			])), M === void 0 && (M = c(h, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cx"
			]));
			var J = c(i, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cy"
			]);
			J === void 0 && (J = c(a, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cy"
			])), J === void 0 && (J = c(h, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cy"
			]));
			var se = M !== void 0 ? Vi(M, "x", g) : NaN, ne = J !== void 0 ? Vi(J, "y", g) : NaN, ce = Number.isFinite(se) ? "width:" + se + "px;" : "width:inherit;", N = Number.isFinite(ne) ? "height:" + ne + "px;" : "", ke = $2(m, e, r, o, d);
			f += "<div style='display: flex;" + ce + N + "' class='slide-prgrph " + H2(m, e, r, o, ke, d) + " " + ke + " " + l + "' >";
			var ve = await S2(m, w, i, e, D, r, o, d), S = ve[0] !== void 0 && ve[0] !== null && ve[0] != "", K = ve[1] !== void 0 && ve[1] !== null && S ? ve[1] + ve[2] : 0;
			f += ve[0] !== void 0 ? ve[0] : "";
			var y = j2(m, r, o, S, d), X = y[0], le = y[1];
			M === void 0 && s !== void 0 && s != 0 && (M = s);
			var t = "", n = 0;
			if (x === void 0 && m !== void 0) {
				var pe = await og(m, void 0, i, e, D, a, r, o, 1, d, S);
				if (S) {
					var Be = $(pe).css({
						position: "absolute",
						float: "left",
						"white-space": "nowrap",
						visibility: "hidden"
					}).appendTo($("body"));
					n += Be.outerWidth(), Be.remove();
				}
				t += pe;
			} else if (x !== void 0) for (var W = 0; W < x.length; W++) {
				var pe = await og(x[W], W, m, e, D, a, r, o, x.length, d, S);
				if (S) {
					var Be = $(pe).css({
						position: "absolute",
						float: "left",
						"white-space": "nowrap",
						visibility: "hidden"
					}).appendTo($("body"));
					n += Be.outerWidth(), Be.remove();
				}
				t += pe;
			}
			var _ = void 0;
			M !== void 0 && (_ = Vi(M, "x", g) - K - le), S && _ !== void 0 && n < _ && (_ = n + K);
			var H = _ !== void 0 && !isNaN(_) ? "width:" + _ + "px;" : "width:inherit;";
			f += "<div style='height: 100%;direction: initial;overflow-wrap:break-word;word-wrap: break-word;" + H + X + "' >", f += t, f += "</div>", f += "</div>";
		}
		return f;
	}
	async function S2(e, i, a, h, o, r, d, s) {
		s.slideMasterTextStyles;
		var g = h["a:lstStyle"];
		let f = "";
		var D = c(e, ["a:r"]);
		D !== void 0 && D.constructor === Array && (D = D[0]);
		var T = parseInt(c(e["a:pPr"], ["attrs", "lvl"])) + 1;
		isNaN(T) && (T = 1);
		var w = "a:lvl" + T + "pPr", m, x, b, L, v;
		if (D !== void 0) m = await hg(D, a, g, o, T, r, d, s), v = m[2], x = f1(D, h, o, T, d, s);
		else return "";
		var p = "", l = "", M = "", J = 0, se = 0, ne = e["a:pPr"], ce = c(ne, ["a:buNone"]);
		if (ce !== void 0) return "";
		var N = "TYPE_NONE", ke = Vo(e, r, d, s), ve = ke.nodeLaout, S = ke.nodeMaster, K = c(ne, [
			"a:buChar",
			"attrs",
			"char"
		]), y = c(ne, [
			"a:buAutoNum",
			"attrs",
			"type"
		]), X = c(ne, ["a:buBlip"]);
		K !== void 0 && (N = "TYPE_BULLET"), y !== void 0 && (N = "TYPE_NUMERIC"), X !== void 0 && (N = "TYPE_BULPIC");
		var le = c(ne, [
			"a:buSzPts",
			"attrs",
			"val"
		]);
		if (le === void 0) {
			if (le = c(ne, [
				"a:buSzPct",
				"attrs",
				"val"
			]), le !== void 0) {
				var t = parseInt(le) / 1e5, n = parseInt(x, "px");
				L = t * parseInt(n) + "px";
			}
		} else L = parseInt(le) / 100 * qc + "px";
		var pe = c(ne, ["a:buClr"]);
		if (K === void 0 && y === void 0 && X === void 0 && g !== void 0) {
			if (ce = c(g, [w, "a:buNone"]), ce !== void 0) return "";
			N = "TYPE_NONE", K = c(g, [
				w,
				"a:buChar",
				"attrs",
				"char"
			]), y = c(g, [
				w,
				"a:buAutoNum",
				"attrs",
				"type"
			]), X = c(g, [w, "a:buBlip"]), K !== void 0 && (N = "TYPE_BULLET"), y !== void 0 && (N = "TYPE_NUMERIC"), X !== void 0 && (N = "TYPE_BULPIC"), (K !== void 0 || y !== void 0 || X !== void 0) && (ne = g[w]);
		}
		if (K === void 0 && y === void 0 && X === void 0) {
			if (ve !== void 0) {
				if (ce = c(ve, ["a:buNone"]), ce !== void 0) return "";
				N = "TYPE_NONE", K = c(ve, [
					"a:buChar",
					"attrs",
					"char"
				]), y = c(ve, [
					"a:buAutoNum",
					"attrs",
					"type"
				]), X = c(ve, ["a:buBlip"]), K !== void 0 && (N = "TYPE_BULLET"), y !== void 0 && (N = "TYPE_NUMERIC"), X !== void 0 && (N = "TYPE_BULPIC");
			}
			if (K === void 0 && y === void 0 && X === void 0 && S !== void 0) {
				if (ce = c(S, ["a:buNone"]), ce !== void 0) return "";
				N = "TYPE_NONE", K = c(S, [
					"a:buChar",
					"attrs",
					"char"
				]), y = c(S, [
					"a:buAutoNum",
					"attrs",
					"type"
				]), X = c(S, ["a:buBlip"]), K !== void 0 && (N = "TYPE_BULLET"), y !== void 0 && (N = "TYPE_NUMERIC"), X !== void 0 && (N = "TYPE_BULPIC");
			}
		}
		var Be = c(ne, ["attrs", "rtl"]);
		Be === void 0 && (Be = c(ve, ["attrs", "rtl"]), Be === void 0 && d != "shape" && (Be = c(S, ["attrs", "rtl"])));
		var W = !1;
		Be !== void 0 && Be == "1" && (W = !0);
		var _ = c(ne, ["attrs", "algn"]);
		_ === void 0 && (_ = c(ve, ["attrs", "algn"]), _ === void 0 && (_ = c(S, ["attrs", "algn"])));
		var H = c(ne, ["attrs", "indent"]);
		H === void 0 && (H = c(ve, ["attrs", "indent"]), H === void 0 && (H = c(S, ["attrs", "indent"])));
		var Le = 0;
		H !== void 0 && (Le = parseInt(H) * k);
		var Te = c(ne, ["attrs", "marL"]);
		if (Te === void 0 && (Te = c(ve, ["attrs", "marL"]), Te === void 0 && (Te = c(S, ["attrs", "marL"]))), Te !== void 0) {
			var Ua = parseInt(Te) * k;
			W ? M = "padding-right:" : M = "padding-left:", J = Ua + Le < 0 ? 0 : Ua + Le, M += J + "px;";
		}
		var ya = c(ne, ["attrs", "marR"]);
		if (ya === void 0 && Te === void 0 && (ya = c(ve, ["attrs", "marR"]), ya === void 0 && (ya = c(S, ["attrs", "marR"]))), ya !== void 0) {
			var pa = parseInt(ya) * k;
			W ? M = "padding-right:" : M = "padding-left:", l += (pa + Le < 0 ? 0 : pa + Le) + "px;";
		}
		pe === void 0 && (pe = c(g, [w, "a:buClr"])), pe === void 0 && (pe = c(ve, ["a:buClr"]), pe === void 0 && (pe = c(S, ["a:buClr"])));
		var na;
		if (pe !== void 0 ? na = ua(pe, void 0, void 0, s) : o !== void 0 && (na = ua(o, void 0, void 0, s)), na === void 0 || na == "NONE" ? b = m : (b = [
			na,
			"",
			"solid"
		], v = "solid"), le === void 0) if (le = c(ve, [
			"a:buSzPts",
			"attrs",
			"val"
		]), le === void 0) {
			if (le = c(ve, [
				"a:buSzPct",
				"attrs",
				"val"
			]), le !== void 0) {
				var t = parseInt(le) / 1e5, n = parseInt(x, "px");
				L = t * parseInt(n) + "px";
			}
		} else L = parseInt(le) / 100 * qc + "px";
		if (le === void 0) if (le = c(S, [
			"a:buSzPts",
			"attrs",
			"val"
		]), le === void 0) {
			if (le = c(S, [
				"a:buSzPct",
				"attrs",
				"val"
			]), le !== void 0) {
				var t = parseInt(le) / 1e5, n = parseInt(x, "px");
				L = t * parseInt(n) + "px";
			}
		} else L = parseInt(le) / 100 * qc + "px";
		if (le === void 0 && (L = x), se = parseInt(L, "px"), N == "TYPE_BULLET") {
			var U = c(ne, [
				"a:buFont",
				"attrs",
				"typeface"
			]), ga = "";
			if (U !== void 0 && (ga = "font-family: " + U), p = "<div style='height: 100%;" + ga + ";" + M + l + "font-size:" + L + ";", v == "solid") b[0] !== void 0 && b[0] != "" && (p += "color:#" + b[0] + "; "), b[1] !== void 0 && b[1] != "" && b[1] != ";" && (p += "text-shadow:" + b[1] + ";");
			else if (v == "pattern" || v == "pic" || v == "gradient") {
				if (v == "pattern") p += "background:" + b[0][0] + ";", b[0][1] !== null && b[0][1] !== void 0 && b[0][1] != "" && (p += "background-size:" + b[0][1] + ";"), b[0][2] !== null && b[0][2] !== void 0 && b[0][2] != "" && (p += "background-position:" + b[0][2] + ";");
				else if (v == "pic") p += b[0] + ";";
				else if (v == "gradient") {
					var Ba = b[0].color, Ya = b[0].rot;
					p += "background: linear-gradient(" + Ya + "deg,";
					for (var i = 0; i < Ba.length; i++) i == Ba.length - 1 ? p += "#" + Ba[i] + ");" : p += "#" + Ba[i] + ", ";
				}
				p += "-webkit-background-clip: text;background-clip: text;color: transparent;", b[1].border !== void 0 && b[1].border !== "" && (p += "-webkit-text-stroke: " + b[1].border + ";"), b[1].effcts !== void 0 && b[1].effcts !== "" && (p += "filter: " + b[1].effcts + ";");
			}
			W && (p += "white-space: nowrap ;direction:rtl");
			var u = K;
			H0 || (u = E2(U, K)), p += "'><div style='line-height: " + se / 2 + "px;'>" + u + "</div></div>";
		} else if (N == "TYPE_NUMERIC") p = "<div style='height: 100%;" + M + l + "color:#" + b[0] + ";font-size:" + L + ";", W ? p += "display: inline-block;white-space: nowrap ;direction:rtl;" : p += "display: inline-block;white-space: nowrap ;direction:ltr;", p += "' data-bulltname = '" + y + "' data-bulltlvl = '" + T + "' class='numeric-bullet-style'></div>";
		else if (N == "TYPE_BULPIC") {
			var De = c(X, [
				"a:blip",
				"attrs",
				"r:embed"
			]), de;
			if (De !== void 0) {
				var z = s.slideResObj[De].target, E = await s.zip.file(z).async("arraybuffer");
				de = "<img src='data:" + rs(z.split(".").pop()) + ";base64," + u1(E) + "' style='width: 100%;'/>";
			}
			De === void 0 && (de = "&#8227;"), p = "<div style='height: 100%;" + M + l + "width:" + L + ";display: inline-block; ", W && (p += "display: inline-block;white-space: nowrap ;direction:rtl;"), p += "'>" + de + "  </div>";
		}
		return [
			f,
			J,
			se
		];
	}
	function E2(e, i) {
		switch (i) {
			case "§": return "&#9632;";
			case "q": return "&#10065;";
			case "v": return "&#10070;";
			case "Ø": return "&#11162;";
			case "ü": return "&#10004;";
			default:
				if (e == "Wingdings 2" || e == "Wingdings 3") {
					var a = z2(e, i);
					if (a !== null) return "&#" + a + ";";
				}
				return "&#" + i.charCodeAt(0) + ";";
		}
	}
	function z2(e, i) {
		let a = i.codePointAt(0) & 4095;
		return o2.codePoint(e, a).codePoint;
	}
	function Vo(e, i, a, h) {
		var o, r, d = e["a:pPr"], s = 1, g = c(d, ["attrs", "lvl"]);
		if (g !== void 0 && (s = parseInt(g) + 1), i !== void 0 && (o = c(h.slideLayoutTables.idxTable[i], [
			"p:txBody",
			"a:lstStyle",
			"a:lvl" + s + "pPr"
		]), o === void 0 && (o = c(h.slideLayoutTables.idxTable[i], [
			"p:txBody",
			"a:p",
			"a:pPr"
		]), o === void 0 && (o = c(h.slideLayoutTables.idxTable[i], [
			"p:txBody",
			"a:p",
			s - 1,
			"a:pPr"
		])))), a !== void 0) {
			var f = "a:lvl" + s + "pPr";
			o === void 0 && (o = c(h, [
				"slideLayoutTables",
				"typeTable",
				a,
				"p:txBody",
				"a:lstStyle",
				f
			])), a == "title" || a == "ctrTitle" ? r = c(h, [
				"slideMasterTextStyles",
				"p:titleStyle",
				f
			]) : a == "body" || a == "obj" || a == "subTitle" ? r = c(h, [
				"slideMasterTextStyles",
				"p:bodyStyle",
				f
			]) : a == "shape" || a == "diagram" ? r = c(h, [
				"slideMasterTextStyles",
				"p:otherStyle",
				f
			]) : a == "textBox" ? r = c(h, ["defaultTextStyle", f]) : r = c(h, [
				"slideMasterTables",
				"typeTable",
				a,
				"p:txBody",
				"a:lstStyle",
				f
			]);
		}
		return {
			nodeLaout: o,
			nodeMaster: r
		};
	}
	async function og(e, i, a, h, o, r, d, s, g, f, D) {
		var T = "", w = h["a:lstStyle"], m = f.slideMasterTextStyles, x = e["a:t"], b = "<span", L = "</span>", v = "";
		if (x === void 0 && e.type !== void 0) {
			if (Kc) return Kc = !1, "<span class='line-break-br' ></span>";
			v += "display: block;";
		} else Kc = !0;
		typeof x != "string" && (x = c(e, ["a:fld", "a:t"]), typeof x != "string" && (x = "&nbsp;"));
		var p = a["a:pPr"], l = 1, M = c(p, ["attrs", "lvl"]);
		M !== void 0 && (l = parseInt(M) + 1);
		var J = Vo(a, d, s, f), se = J.nodeLaout, ne = J.nodeMaster, ce = c(e, [
			"a:rPr",
			"attrs",
			"lang"
		]), N = ce !== void 0 && J0.indexOf(ce) !== -1, ke = c(p, ["attrs", "rtl"]);
		ke === void 0 && (ke = c(se, ["attrs", "rtl"]), ke === void 0 && s != "shape" && (ke = c(ne, ["attrs", "rtl"])));
		var ve = c(e, [
			"a:rPr",
			"a:hlinkClick",
			"attrs",
			"r:id"
		]), S = "", K;
		if (ve !== void 0) {
			S = c(e, [
				"a:rPr",
				"a:hlinkClick",
				"attrs",
				"tooltip"
			]), S !== void 0 && (S = "title='" + S + "'"), K = fg("a:hlink", void 0, void 0, f);
			var y = ua(c(e, ["a:rPr", "a:solidFill"]), void 0, void 0, f);
			y !== void 0 && y != "" && (K = y);
		}
		var X = await hg(e, a, w, o, l, d, s, f), le = X[2];
		if (le == "solid") ve === void 0 && X[0] !== void 0 && X[0] != "" ? v += "color: #" + X[0] + ";" : ve !== void 0 && K !== void 0 && (v += "color: #" + K + ";"), X[1] !== void 0 && X[1] != "" && X[1] != ";" && (v += "text-shadow:" + X[1] + ";"), X[3] !== void 0 && X[3] != "" && (v += "background-color: #" + X[3] + ";");
		else if (le == "pattern" || le == "pic" || le == "gradient") {
			if (le == "pattern") v += "background:" + X[0][0] + ";", X[0][1] !== null && X[0][1] !== void 0 && X[0][1] != "" && (v += "background-size:" + X[0][1] + ";"), X[0][2] !== null && X[0][2] !== void 0 && X[0][2] != "" && (v += "background-position:" + X[0][2] + ";");
			else if (le == "pic") v += X[0] + ";";
			else if (le == "gradient") {
				var t = X[0].color, n = X[0].rot;
				v += "background: linear-gradient(" + n + "deg,";
				for (var pe = 0; pe < t.length; pe++) pe == t.length - 1 ? v += "#" + t[pe] + ");" : v += "#" + t[pe] + ", ";
			}
			v += "-webkit-background-clip: text;background-clip: text;color: transparent;", X[1].border !== void 0 && X[1].border !== "" && (v += "-webkit-text-stroke: " + X[1].border + ";"), X[1].effcts !== void 0 && X[1].effcts !== "" && (v += "filter: " + X[1].effcts + ";");
		}
		var Be = f1(e, h, o, l, s, f);
		T += "font-size:" + Be + ";font-family:" + K2(e, s, f, o, x, ce, se, ne, l) + ";font-weight:" + Z2(e, s, m, se, ne) + ";font-style:" + ep(e, s, m, se, ne) + ";text-decoration:" + ap(e, s, m) + ";text-align:" + tp(e, a, s, f) + ";vertical-align:" + np(e, s, m) + ";", N ? v += "direction:rtl;" : v += "direction:ltr;";
		var W = c(e, ["a:rPr", "a:highlight"]);
		W !== void 0 && (v += "background-color:#" + ua(W, void 0, void 0, f) + ";");
		var _ = c(e, [
			"a:rPr",
			"attrs",
			"spc"
		]);
		if (_ === void 0 && (_ = c(se, [
			"a:defRPr",
			"attrs",
			"spc"
		]), _ === void 0 && (_ = c(ne, [
			"a:defRPr",
			"attrs",
			"spc"
		]))), _ !== void 0) {
			var H = parseInt(_) / 100;
			v += "letter-spacing: " + H + "px;";
		}
		var Le = c(e, [
			"a:rPr",
			"attrs",
			"cap"
		]);
		Le === void 0 && (Le = c(se, [
			"a:defRPr",
			"attrs",
			"cap"
		]), Le === void 0 && (Le = c(ne, [
			"a:defRPr",
			"attrs",
			"cap"
		]))), (Le == "small" || Le == "all") && (v += "text-transform: uppercase");
		var Te = "";
		v in Mt ? Te = Mt[v].name : (Te = "_css_" + (Object.keys(Mt).length + 1), Mt[v] = {
			name: Te,
			text: v
		});
		var Ua = "";
		if (le == "solid" && ve !== void 0 && (Ua = "style='color: inherit;'"), ve !== void 0 && ve != "") {
			var ya = f.slideResObj[ve].target;
			return ya = ds(ya), b + " class='text-block " + Te + "' style='" + T + "'><a href='" + ya + "' " + Ua + "  " + S + " target='_blank'>" + x.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\s/g, "&nbsp;") + "</a>" + L;
		} else return b + " class='text-block " + Te + "' style='" + T + "'>" + x.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\s/g, "&nbsp;") + L;
	}
	function j2(e, i, a, h, o) {
		if (!h) return ["", 0];
		var r = "", d = "", s = 0, g = e["a:pPr"], f = Vo(e, i, a, o), D = f.nodeLaout, T = f.nodeMaster, w = c(g, ["attrs", "rtl"]);
		w === void 0 && (w = c(D, ["attrs", "rtl"]), w === void 0 && a != "shape" && (w = c(T, ["attrs", "rtl"])));
		var m = !1;
		w !== void 0 && w == "1" && (m = !0);
		var x = c(g, ["attrs", "algn"]);
		x === void 0 && (x = c(D, ["attrs", "algn"]), x === void 0 && (x = c(T, ["attrs", "algn"])));
		var b = c(g, ["attrs", "indent"]);
		b === void 0 && (b = c(D, ["attrs", "indent"]), b === void 0 && (b = c(T, ["attrs", "indent"])));
		var L = 0;
		b !== void 0 && (L = parseInt(b) * k);
		var v = c(g, ["attrs", "marL"]);
		v === void 0 && (v = c(D, ["attrs", "marL"]), v === void 0 && (v = c(T, ["attrs", "marL"])));
		var p = 0;
		v !== void 0 && (p = parseInt(v) * k), (b !== void 0 || v !== void 0) && (m ? r = "padding-right: " : r = "padding-left: ", h ? (s = Math.abs(0 - L), r += s + "px;") : (s = Math.abs(p + L), r += s + "px;"));
		var l = c(g, ["attrs", "marR"]);
		return l === void 0 && v === void 0 && (l = c(D, ["attrs", "marR"]), l === void 0 && (l = c(T, ["attrs", "marR"]))), l !== void 0 && h && (parseInt(l) * k, m ? d = "padding-right: " : d = "padding-left: ", d += Math.abs(0 - L) + "px;"), [r, s];
	}
	function O2() {
		var e = "";
		for (var i in Mt) e += " ." + Mt[i].name + (Mt[i].suffix ? Mt[i].suffix : "") + "{" + Mt[i].text + `}
`;
		return e;
	}
	async function G2(e, i, a) {
		var h = e.attrs.order, o = c(e, [
			"a:graphic",
			"a:graphicData",
			"a:tbl"
		]), r = c(e, ["p:xfrm"]), d = c(e, [
			"a:graphic",
			"a:graphicData",
			"a:tbl",
			"a:tblPr"
		]), s = c(e, [
			"a:graphic",
			"a:graphicData",
			"a:tbl",
			"a:tblGrid",
			"a:gridCol"
		]), g = "";
		d !== void 0 && (g = d.attrs.rtl == 1 ? "dir=rtl" : "dir=ltr");
		var f = d.attrs.firstRow, D = d.attrs.firstCol, T = d.attrs.lastRow, w = d.attrs.lastCol, m = d.attrs.bandRow, x = d.attrs.bandCol, b = {
			isFrstRowAttr: f !== void 0 && f == "1" ? 1 : 0,
			isFrstColAttr: D !== void 0 && D == "1" ? 1 : 0,
			isLstRowAttr: T !== void 0 && T == "1" ? 1 : 0,
			isLstColAttr: w !== void 0 && w == "1" ? 1 : 0,
			isBandRowAttr: m !== void 0 && m == "1" ? 1 : 0,
			isBandColAttr: x !== void 0 && x == "1" ? 1 : 0
		}, L, v = d["a:tableStyleId"];
		if (v !== void 0) {
			var p = Z0["a:tblStyleLst"]["a:tblStyle"];
			if (p !== void 0) if (p.constructor === Array) for (var l = 0; l < p.length; l++) p[l].attrs.styleId == v && (L = p[l]);
			else p.attrs.styleId == v && (L = p);
		}
		L !== void 0 && (L.tblStylAttrObj = b, i.thisTbiStyle = L);
		var M = c(c(L, ["a:wholeTbl", "a:tcStyle"]), ["a:tcBdr"]), J = "";
		M !== void 0 && (J = Yo(M, i));
		var se = "", ne = c(L, ["a:tblBg", "a:fillRef"]);
		ne !== void 0 && (se = ua(ne, void 0, void 0, i)), ne === void 0 && (ne = c(L, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:fill",
			"a:solidFill"
		]), se = ua(ne, void 0, void 0, i)), se !== "" && (se = "background-color: #" + se + ";");
		var ce = "<table " + g + " style='border-collapse: collapse;" + Yi(r, e, void 0, void 0, "group", a) + Ki(r, void 0, void 0, a) + " z-index: " + h + ";" + J + ";" + se + "'>", N = o["a:tr"];
		N.constructor !== Array && (N = [N]);
		for (var ke = 0, ve = [], S = 0; S < N.length; S++) {
			var K = N[S].attrs.h, y = 0, X = "";
			K !== void 0 && (y = parseInt(K) * k, X += "height:" + y + "px;");
			var le = "", t = "", n = "", pe = "";
			if (L !== void 0 && L["a:wholeTbl"] !== void 0) {
				var Be = c(L, [
					"a:wholeTbl",
					"a:tcStyle",
					"a:fill",
					"a:solidFill"
				]);
				if (Be !== void 0) {
					var W = ua(Be, void 0, void 0, i);
					W !== void 0 && (le = W);
				}
				var _ = c(L, ["a:wholeTbl", "a:tcTxStyle"]);
				if (_ !== void 0) {
					var H = ua(_, void 0, void 0, i);
					H !== void 0 && (n = H);
					var Le = c(_, ["attrs", "b"]) == "on" ? "bold" : "";
					Le != "" && (pe = Le);
				}
			}
			if (S == 0 && b.isFrstRowAttr == 1 && L !== void 0) {
				var Be = c(L, [
					"a:firstRow",
					"a:tcStyle",
					"a:fill",
					"a:solidFill"
				]);
				if (Be !== void 0) {
					var W = ua(Be, void 0, void 0, i);
					W !== void 0 && (le = W);
				}
				var Te = c(L, [
					"a:firstRow",
					"a:tcStyle",
					"a:tcBdr"
				]);
				if (Te !== void 0) {
					var Ua = Yo(Te, i);
					Ua != "" && (t = Ua);
				}
				var _ = c(L, ["a:firstRow", "a:tcTxStyle"]);
				if (_ !== void 0) {
					var ya = ua(_, void 0, void 0, i);
					ya !== void 0 && (n = ya);
					var Le = c(_, ["attrs", "b"]) == "on" ? "bold" : "";
					Le !== "" && (pe = Le);
				}
			} else if (S > 0 && b.isBandRowAttr == 1 && L !== void 0) {
				if (le = "", t = void 0, S % 2 == 0 && L["a:band2H"] !== void 0) {
					var Be = c(L, [
						"a:band2H",
						"a:tcStyle",
						"a:fill",
						"a:solidFill"
					]);
					if (Be !== void 0) {
						var W = ua(Be, void 0, void 0, i);
						W !== "" && (le = W);
					}
					var Te = c(L, [
						"a:band2H",
						"a:tcStyle",
						"a:tcBdr"
					]);
					if (Te !== void 0) {
						var Ua = Yo(Te, i);
						Ua != "" && (t = Ua);
					}
					var _ = c(L, ["a:band2H", "a:tcTxStyle"]);
					if (_ !== void 0) {
						var ya = ua(_, void 0, void 0, i);
						ya !== void 0 && (n = ya);
					}
					var Le = c(_, ["attrs", "b"]) == "on" ? "bold" : "";
					Le !== "" && (pe = Le);
				}
				if (S % 2 != 0 && L["a:band1H"] !== void 0) {
					var Be = c(L, [
						"a:band1H",
						"a:tcStyle",
						"a:fill",
						"a:solidFill"
					]);
					if (Be !== void 0) {
						var W = ua(Be, void 0, void 0, i);
						W !== void 0 && (le = W);
					}
					var Te = c(L, [
						"a:band1H",
						"a:tcStyle",
						"a:tcBdr"
					]);
					if (Te !== void 0) {
						var Ua = Yo(Te, i);
						Ua != "" && (t = Ua);
					}
					var _ = c(L, ["a:band1H", "a:tcTxStyle"]);
					if (_ !== void 0) {
						var ya = ua(_, void 0, void 0, i);
						ya !== void 0 && (n = ya);
						var Le = c(_, ["attrs", "b"]) == "on" ? "bold" : "";
						Le != "" && (pe = Le);
					}
				}
			}
			if (S == N.length - 1 && b.isLstRowAttr == 1 && L !== void 0) {
				var Be = c(L, [
					"a:lastRow",
					"a:tcStyle",
					"a:fill",
					"a:solidFill"
				]);
				if (Be !== void 0) {
					var W = ua(Be, void 0, void 0, i);
					W !== void 0 && (le = W);
				}
				var Te = c(L, [
					"a:lastRow",
					"a:tcStyle",
					"a:tcBdr"
				]);
				if (Te !== void 0) {
					var Ua = Yo(Te, i);
					Ua != "" && (t = Ua);
				}
				var _ = c(L, ["a:lastRow", "a:tcTxStyle"]);
				if (_ !== void 0) {
					var ya = ua(_, void 0, void 0, i);
					ya !== void 0 && (n = ya);
					var Le = c(_, ["attrs", "b"]) == "on" ? "bold" : "";
					Le !== "" && (pe = Le);
				}
			}
			X += t !== void 0 ? t : "", X += n !== void 0 ? " color: #" + n + ";" : "", X += pe != "" ? " font-weight:" + pe + ";" : "", le !== void 0 && le != "" && (X += "background-color: #" + le + ";"), ce += "<tr style='" + X + "'>";
			var pa = N[S]["a:tc"];
			if (pa !== void 0) if (pa.constructor === Array) {
				var na = 0;
				ve.length == 0 && (ve = Array.apply(null, Array(pa.length)).map(function() {
					return 0;
				}));
				for (var U = 0; na < pa.length;) {
					if (ve[na] == 0 && U == 0) {
						var ga;
						if (na == 0 && b.isFrstColAttr == 1) ga = "a:firstCol", b.isLstRowAttr == 1 && S == N.length - 1 && c(L, ["a:seCell"]) !== void 0 ? ga = "a:seCell" : b.isFrstRowAttr == 1 && S == 0 && c(L, ["a:neCell"]) !== void 0 && (ga = "a:neCell");
						else if (na > 0 && b.isBandColAttr == 1 && !(b.isFrstColAttr == 1 && S == 0) && !(b.isLstRowAttr == 1 && S == N.length - 1) && na != pa.length - 1 && na % 2 != 0) {
							var Ba = c(L, ["a:band2V"]);
							Ba === void 0 ? (Ba = c(L, ["a:band1V"]), Ba !== void 0 && (ga = "a:band2V")) : ga = "a:band2V";
						}
						na == pa.length - 1 && b.isLstColAttr == 1 && (ga = "a:lastCol", b.isLstRowAttr == 1 && S == N.length - 1 && c(L, ["a:swCell"]) !== void 0 ? ga = "a:swCell" : b.isFrstRowAttr == 1 && S == 0 && c(L, ["a:nwCell"]) !== void 0 && (ga = "a:nwCell"));
						var Ya = await cg(pa[na], s, S, na, L, ga, i), u = Ya[0], De = Ya[1], de = Ya[2], z = Ya[3], E = Ya[4];
						z !== void 0 ? (ke++, ve[na] = parseInt(z) - 1, ce += "<td class='" + de + "' data-row='" + S + "," + na + "' rowspan ='" + parseInt(z) + "' style='" + De + "'>" + u + "</td>") : E !== void 0 ? (ce += "<td class='" + de + "' data-row='" + S + "," + na + "' colspan = '" + parseInt(E) + "' style='" + De + "'>" + u + "</td>", U = parseInt(E) - 1) : ce += "<td class='" + de + "' data-row='" + S + "," + na + "' style = '" + De + "'>" + u + "</td>";
					} else ve[na] != 0 && (ve[na] -= 1), U != 0 && U--;
					na++;
				}
			} else {
				var ga;
				if (b.isFrstColAttr == 1 && b.isLstRowAttr != 1) ga = "a:firstCol";
				else if (b.isBandColAttr == 1 && b.isLstRowAttr != 1) {
					var Ba = c(L, ["a:band2V"]);
					Ba === void 0 ? (Ba = c(L, ["a:band1V"]), Ba !== void 0 && (ga = "a:band2V")) : ga = "a:band2V";
				}
				b.isLstColAttr == 1 && b.isLstRowAttr != 1 && (ga = "a:lastCol");
				var Ya = await cg(pa, s, S, void 0, L, ga, i), u = Ya[0], De = Ya[1], de = Ya[2], z = Ya[3];
				z !== void 0 ? ce += "<td  class='" + de + "' rowspan='" + parseInt(z) + "' style = '" + De + "'>" + u + "</td>" : ce += "<td class='" + de + "' style='" + De + "'>" + u + "</td>";
			}
			ce += "</tr>";
		}
		return ce;
	}
	async function cg(e, i, a, h, o, r, d) {
		var s = c(e, ["attrs", "rowSpan"]), g = c(e, ["attrs", "gridSpan"]);
		c(e, ["attrs", "vMerge"]), c(e, ["attrs", "hMerge"]);
		var f = "word-wrap: break-word;", D, T = "", w = "", m = "", x = "", b = "", L = "", v = "", p = parseInt(g), l = 0;
		if (!isNaN(p) && p > 1) for (var M = 0; M < p; M++) l += parseInt(c(i[h + M], ["attrs", "w"]));
		else l = c(h === void 0 ? i : i[h], ["attrs", "w"]);
		var J = await Zc(e["a:txBody"], e, void 0, void 0, void 0, void 0, d, l);
		if (l != 0 && (D = parseInt(l) * k, f += "width:" + D + "px;"), x = c(e, ["a:tcPr", "a:lnB"]), x === void 0 && r !== void 0 && (r !== void 0 && (x = c(o[r], [
			"a:tcStyle",
			"a:tcBdr",
			"a:bottom",
			"a:ln"
		])), x === void 0 && (x = c(o, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:tcBdr",
			"a:bottom",
			"a:ln"
		]))), b = c(e, ["a:tcPr", "a:lnT"]), b === void 0 && (r !== void 0 && (b = c(o[r], [
			"a:tcStyle",
			"a:tcBdr",
			"a:top",
			"a:ln"
		])), b === void 0 && (b = c(o, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:tcBdr",
			"a:top",
			"a:ln"
		]))), L = c(e, ["a:tcPr", "a:lnL"]), L === void 0 && (r !== void 0 && (L = c(o[r], [
			"a:tcStyle",
			"a:tcBdr",
			"a:left",
			"a:ln"
		])), L === void 0 && (L = c(o, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:tcBdr",
			"a:left",
			"a:ln"
		]))), v = c(e, ["a:tcPr", "a:lnR"]), v === void 0 && (r !== void 0 && (v = c(o[r], [
			"a:tcStyle",
			"a:tcBdr",
			"a:right",
			"a:ln"
		])), v === void 0 && (v = c(o, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:tcBdr",
			"a:right",
			"a:ln"
		]))), c(e, ["a:tcPr", "a:lnBlToTr"]), c(e, ["a:tcPr", "a:InTlToBr"]), x !== void 0 && x != "") {
			var se = ii(x, void 0, !1, "", d);
			se != "" && (f += "border-bottom:" + se + ";");
		}
		if (b !== void 0 && b != "") {
			var ne = ii(b, void 0, !1, "", d);
			ne != "" && (f += "border-top: " + ne + ";");
		}
		if (L !== void 0 && L != "") {
			var ce = ii(L, void 0, !1, "", d);
			ce != "" && (f += "border-left: " + ce + ";");
		}
		if (v !== void 0 && v != "") {
			var N = ii(v, void 0, !1, "", d);
			N != "" && (f += "border-right:" + N + ";");
		}
		var ke = c(e, ["a:tcPr"]);
		if (ke !== void 0 && ke != "" && (T = await ns({ "p:spPr": ke }, void 0, !1, d, "slide")), T == "" || T == "background-color: inherit;") {
			var ve;
			if (r !== void 0 && (ve = c(o, [
				r,
				"a:tcStyle",
				"a:fill",
				"a:solidFill"
			])), ve !== void 0) {
				var S = ua(ve, void 0, void 0, d);
				S !== void 0 && (T = " background-color: #" + S + ";");
			}
		}
		var K = "";
		T !== void 0 && T != "" && (T in Mt ? K = Mt[T].name : (K = "_tbl_cell_css_" + (Object.keys(Mt).length + 1), Mt[T] = {
			name: K,
			text: T
		}));
		var y;
		if (r !== void 0 && (y = c(o, [r, "a:tcTxStyle"])), y !== void 0) {
			var X = ua(y, void 0, void 0, d);
			X !== void 0 && (w = X);
			var le = c(y, ["attrs", "b"]) == "on" ? "bold" : "";
			le !== "" && (m = le);
		}
		return f += w !== "" ? "color: #" + w + ";" : "", f += m != "" ? " font-weight:" + m + ";" : "", [
			J,
			f,
			K,
			s,
			g
		];
	}
	async function N2(e, i, a) {
		var h = e.attrs.order, o = c(e, ["p:xfrm"]), r = "<div id='chart" + vr + "' class='block content' style='" + Yi(o, e, void 0, void 0, "group", a) + Ki(o, void 0, void 0, a) + " z-index: " + h + ";'></div>", d = e["a:graphic"]["a:graphicData"]["c:chart"].attrs["r:id"], s = i.slideResObj[d].target, g = c(await Wt(i.zip, s), [
			"c:chartSpace",
			"c:chart",
			"c:plotArea"
		]), f = null;
		for (var D in g) switch (D) {
			case "c:lineChart":
				f = {
					type: "createChart",
					data: {
						chartID: "chart" + vr,
						chartType: "lineChart",
						chartData: xd(g[D]["c:ser"])
					}
				};
				break;
			case "c:barChart":
				f = {
					type: "createChart",
					data: {
						chartID: "chart" + vr,
						chartType: "barChart",
						chartData: xd(g[D]["c:ser"])
					}
				};
				break;
			case "c:pieChart":
				f = {
					type: "createChart",
					data: {
						chartID: "chart" + vr,
						chartType: "pieChart",
						chartData: xd(g[D]["c:ser"])
					}
				};
				break;
			case "c:pie3DChart":
				f = {
					type: "createChart",
					data: {
						chartID: "chart" + vr,
						chartType: "pie3DChart",
						chartData: xd(g[D]["c:ser"])
					}
				};
				break;
			case "c:areaChart":
				f = {
					type: "createChart",
					data: {
						chartID: "chart" + vr,
						chartType: "areaChart",
						chartData: xd(g[D]["c:ser"])
					}
				};
				break;
			case "c:scatterChart":
				f = {
					type: "createChart",
					data: {
						chartID: "chart" + vr,
						chartType: "scatterChart",
						chartData: xd(g[D]["c:ser"])
					}
				};
				break;
			case "c:catAx": break;
			case "c:valAx": break;
			default:
		}
		return f !== null && X0.MsgQueue.push(f), vr++, r;
	}
	async function R2(e, i, a, h, o) {
		e.attrs.order;
		var r = i.zip, d = c(e, ["p:xfrm"]), s = c(e, [
			"a:graphic",
			"a:graphicData",
			"dgm:relIds",
			"attrs"
		]), g = s["r:cs"], f = s["r:dm"], D = s["r:lo"], T = s["r:qs"], w = i.slideResObj[g].target, m = i.slideResObj[f].target, x = i.slideResObj[D].target, b = i.slideResObj[T].target;
		await Wt(r, w), await Wt(r, m), await Wt(r, x), await Wt(r, b);
		var L = c(i.digramFileContent, [
			"p:drawing",
			"p:spTree",
			"p:sp"
		]), v = "";
		if (L !== void 0) for (var p = L.length, l = 0; l < p; l++) {
			var M = L[l];
			v += await rg(M, e, i, "diagramBg", h, o);
		}
		return "<div class='block diagram-content' style='" + Yi(d, e, void 0, void 0, h, o) + Ki(d, void 0, void 0, o) + "'>" + v + "</div>";
	}
	function Yi(e, i, a, h, o, r) {
		var d, s = -1, g = -1;
		return e !== void 0 && (d = c(e, ["a:off", "attrs"])), d === void 0 && a !== void 0 ? d = c(a, ["a:off", "attrs"]) : d === void 0 && h !== void 0 && (d = c(h, ["a:off", "attrs"])), d === void 0 ? "" : (s = ud(d.x, "x", r), g = ud(d.y, "y", r), isNaN(s) || isNaN(g) ? "" : "top:" + g + "px; left:" + s + "px;");
	}
	function Ki(e, i, a, h) {
		var o = void 0, r = -1, d = -1;
		return e !== void 0 ? o = c(e, ["a:ext", "attrs"]) : i !== void 0 ? o = c(i, ["a:ext", "attrs"]) : a !== void 0 && (o = c(a, ["a:ext", "attrs"])), o === void 0 ? "" : (r = Vi(o.cx, "x", h), d = Vi(o.cy, "y", h), isNaN(r) || isNaN(d) ? "" : "width:" + r + "px; height:" + d + "px;");
	}
	function X2(e, i, a, h, o) {
		var r = 1, d = c(e, [
			"a:pPr",
			"a:spcBef",
			"a:spcPts",
			"attrs",
			"val"
		]), s = c(e, [
			"a:pPr",
			"a:spcAft",
			"a:spcPts",
			"attrs",
			"val"
		]), g = c(e, [
			"a:pPr",
			"a:lnSpc",
			"a:spcPct",
			"attrs",
			"val"
		]), f = "Pct";
		g === void 0 && (g = c(e, [
			"a:pPr",
			"a:lnSpc",
			"a:spcPts",
			"attrs",
			"val"
		]), g !== void 0 && (f = "Pts"));
		var D = c(e, [
			"a:pPr",
			"attrs",
			"lvl"
		]);
		D !== void 0 && (r = parseInt(D) + 1);
		var T;
		if (c(e, ["a:r"]) !== void 0) {
			var w = f1(e["a:r"], i, void 0, r, a, o);
			w != "inherit" && (T = parseInt(w, "px"));
		}
		var m = !0;
		if ((a == "shape" || a == "textBox") && (m = !1), m && (d === void 0 || s === void 0 || g === void 0) && h !== void 0) {
			var x = c(o, [
				"slideLayoutTables",
				"idxTable",
				h,
				"p:txBody",
				"a:p",
				r - 1,
				"a:pPr"
			]);
			d === void 0 && (d = c(x, [
				"a:spcBef",
				"a:spcPts",
				"attrs",
				"val"
			])), s === void 0 && (s = c(x, [
				"a:spcAft",
				"a:spcPts",
				"attrs",
				"val"
			])), g === void 0 && (g = c(x, [
				"a:lnSpc",
				"a:spcPct",
				"attrs",
				"val"
			]), g === void 0 && (g = c(x, [
				"a:pPr",
				"a:lnSpc",
				"a:spcPts",
				"attrs",
				"val"
			]), g !== void 0 && (f = "Pts")));
		}
		if (m && (d === void 0 || s === void 0 || g === void 0)) {
			var b = o.slideMasterTextStyles, L = "", r = "a:lvl" + r + "pPr";
			switch (a) {
				case "title":
				case "ctrTitle":
					L = "p:titleStyle";
					break;
				case "body":
				case "obj":
				case "dt":
				case "ftr":
				case "sldNum":
				case "textBox":
					L = "p:bodyStyle";
					break;
				default: L = "p:otherStyle";
			}
			var v = c(b, [L, r]);
			v !== void 0 && (d === void 0 && (d = c(v, [
				"a:spcBef",
				"a:spcPts",
				"attrs",
				"val"
			])), s === void 0 && (s = c(v, [
				"a:spcAft",
				"a:spcPts",
				"attrs",
				"val"
			])), g === void 0 && (g = c(v, [
				"a:lnSpc",
				"a:spcPct",
				"attrs",
				"val"
			]), g === void 0 && (g = c(v, [
				"a:pPr",
				"a:lnSpc",
				"a:spcPts",
				"attrs",
				"val"
			]), g !== void 0 && (f = "Pts"))));
		}
		var p = 0, l = 0, M = 0, J = "";
		if (d !== void 0 && (p = parseInt(d) / 100), s !== void 0 && (l = parseInt(s) / 100), g !== void 0 && T !== void 0) if (f == "Pts") J += "padding-top: " + (parseInt(g) / 100 - T) + "px;";
		else {
			var se = parseInt(g) / 1e5;
			M = T * (se - 1) - T, J += "padding-top: " + (se > 1 ? T : 0) + "px;", J += "padding-bottom: " + M + "px;";
		}
		return J += "margin-top: " + (p - 1) + "px;", (s !== void 0 || g !== void 0) && (J += "margin-bottom: " + l + "px;"), J;
	}
	function H2(e, i, a, h, o, r) {
		var d = c(e, [
			"a:pPr",
			"attrs",
			"algn"
		]);
		if (d === void 0) {
			var s = 1, g = c(e, [
				"a:pPr",
				"attrs",
				"lvl"
			]);
			g !== void 0 && (s = parseInt(g) + 1);
			var f = "a:lvl" + s + "pPr", D = i["a:lstStyle"];
			d = c(D, [
				f,
				"attrs",
				"algn"
			]), d === void 0 && a !== void 0 && (d = c(r.slideLayoutTables.idxTable[a], [
				"p:txBody",
				"a:lstStyle",
				f,
				"attrs",
				"algn"
			]), d === void 0 && (d = c(r.slideLayoutTables.idxTable[a], [
				"p:txBody",
				"a:p",
				"a:pPr",
				"attrs",
				"algn"
			]), d === void 0 && (d = c(r.slideLayoutTables.idxTable[a], [
				"p:txBody",
				"a:p",
				s - 1,
				"a:pPr",
				"attrs",
				"algn"
			])))), d === void 0 && (h !== void 0 ? (d = c(r, [
				"slideLayoutTables",
				"typeTable",
				h,
				"p:txBody",
				"a:lstStyle",
				f,
				"attrs",
				"algn"
			]), d === void 0 && (h == "title" || h == "ctrTitle" ? d = c(r, [
				"slideMasterTextStyles",
				"p:titleStyle",
				f,
				"attrs",
				"algn"
			]) : h == "body" || h == "obj" || h == "subTitle" ? d = c(r, [
				"slideMasterTextStyles",
				"p:bodyStyle",
				f,
				"attrs",
				"algn"
			]) : h == "shape" || h == "diagram" ? d = c(r, [
				"slideMasterTextStyles",
				"p:otherStyle",
				f,
				"attrs",
				"algn"
			]) : h == "textBox" ? d = c(r, [
				"defaultTextStyle",
				f,
				"attrs",
				"algn"
			]) : d = c(r, [
				"slideMasterTables",
				"typeTable",
				h,
				"p:txBody",
				"a:lstStyle",
				f,
				"attrs",
				"algn"
			]))) : d = c(r, [
				"slideMasterTextStyles",
				"p:bodyStyle",
				f,
				"attrs",
				"algn"
			]));
		}
		if (d === void 0) {
			if (h == "title" || h == "subTitle" || h == "ctrTitle") return "h-mid";
			if (h == "sldNum") return "h-right";
		}
		if (d !== void 0) switch (d) {
			case "l": return o == "pregraph-rtl" ? "h-left-rtl" : "h-left";
			case "r": return o == "pregraph-rtl" ? "h-right-rtl" : "h-right";
			case "ctr": return "h-mid";
			default: return "h-" + d;
		}
	}
	function $2(e, i, a, h, o) {
		var r = c(e, [
			"a:pPr",
			"attrs",
			"rtl"
		]);
		if (r === void 0) {
			var d = Vo(e, a, h, o), s = d.nodeLaout, g = d.nodeMaster;
			r = c(s, ["attrs", "rtl"]), r === void 0 && h != "shape" && (r = c(g, ["attrs", "rtl"]));
		}
		return r == "1" ? "pregraph-rtl" : r == "0" ? "pregraph-ltr" : "pregraph-inherit";
	}
	function h1(e, i, a, h) {
		var o = c(e, [
			"p:txBody",
			"a:bodyPr",
			"attrs",
			"anchor"
		]);
		return o === void 0 && (o = c(i, [
			"p:txBody",
			"a:bodyPr",
			"attrs",
			"anchor"
		]), o === void 0 && (o = c(a, [
			"p:txBody",
			"a:bodyPr",
			"attrs",
			"anchor"
		]), o === void 0 && (o = "t"))), o === "ctr" ? "v-mid" : o === "b" ? "v-down" : "v-up";
	}
	function g1(e, i, a) {
		return "content";
	}
	function J2(e, i) {
		return /^(zh|ja|ko)(-|$)/i.test(i || "") || /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(e || "");
	}
	function q2(e, i) {
		return J0.indexOf(i) !== -1 || /^(ar|fa|he|ur|dv)(-|$)/i.test(i || "") || /[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufeff]/.test(e || "");
	}
	function V2(e, i) {
		if (/^zh-(tw|hk|mo)/i.test(e || "")) return "Hant";
		if (/^zh/i.test(e || "") || /[\u3400-\u9fff]/.test(i || "")) return "Hans";
		if (/^ja/i.test(e || "") || /[\u3040-\u30ff]/.test(i || "")) return "Jpan";
		if (/^ko/i.test(e || "") || /[\uac00-\ud7af]/.test(i || "")) return "Hang";
		if (/^(ar|fa|ur|dv)/i.test(e || "") || /[\u0600-\u06ff]/.test(i || "")) return "Arab";
		if (/^he/i.test(e || "") || /[\u0590-\u05ff]/.test(i || "")) return "Hebr";
	}
	function sg(e, i, a) {
		var h = V2(i, a), o = c(e, ["a:font"]);
		if (!(h === void 0 || o === void 0)) {
			o = o.constructor === Array ? o : [o];
			for (var r = 0; r < o.length; r++) if (c(o[r], ["attrs", "script"]) === h) return c(o[r], ["attrs", "typeface"]);
		}
	}
	function es(e, i, a, h) {
		if (!(e === void 0 || e === "")) {
			var o = /^\+(mj|mn)-(lt|ea|cs)$/.exec(e);
			if (o === null) return e;
			var r = o[1] === "mj" ? "a:majorFont" : "a:minorFont", d = o[2] === "lt" ? "a:latin" : "a:" + o[2], s = c(i.themeContent, [
				"a:theme",
				"a:themeElements",
				"a:fontScheme",
				r
			]);
			return c(s, [
				d,
				"attrs",
				"typeface"
			]) || sg(s, a, h);
		}
	}
	function l1(e, i, a, h, o) {
		var r = i === "major" ? "a:majorFont" : "a:minorFont", d = c(e.themeContent, [
			"a:theme",
			"a:themeElements",
			"a:fontScheme",
			r
		]);
		return c(d, [
			"a:" + a,
			"attrs",
			"typeface"
		]) || sg(d, h, o);
	}
	function as(e, i, a, h) {
		return e === void 0 ? {} : {
			latin: es(c(e, [
				"a:latin",
				"attrs",
				"typeface"
			]), i, a, h),
			ea: es(c(e, [
				"a:ea",
				"attrs",
				"typeface"
			]), i, a, h),
			cs: es(c(e, [
				"a:cs",
				"attrs",
				"typeface"
			]), i, a, h),
			sym: es(c(e, [
				"a:sym",
				"attrs",
				"typeface"
			]), i, a, h)
		};
	}
	function Qo(e, i) {
		Object.keys(i).forEach(function(a) {
			(e[a] === void 0 || e[a] === "") && i[a] !== void 0 && i[a] !== "" && (e[a] = i[a]);
		});
	}
	function Q2(e) {
		if (!(e === void 0 || e === "")) return /^(inherit|serif|sans-serif|monospace|cursive|fantasy|system-ui)$/i.test(e) ? e : "\"" + String(e).replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
	}
	function Y2(e, i) {
		var a = c(i, ["attrs", "idx"]);
		return a === "major" || a === "minor" ? a : e == "title" || e == "subTitle" || e == "ctrTitle" ? "major" : "minor";
	}
	function K2(e, i, a, h, o, r, d, s, g) {
		var f = {};
		Qo(f, as(c(e, ["a:rPr"]), a, r, o)), Qo(f, as(c(d, ["a:defRPr"]), a, r, o)), Qo(f, as(c(s, ["a:defRPr"]), a, r, o));
		var D = "a:lvl" + g + "pPr";
		Qo(f, as(c(a.defaultTextStyle, [D, "a:defRPr"]), a, r, o));
		var T = Y2(i, h);
		Qo(f, {
			latin: l1(a, T, "latin", r, o),
			ea: l1(a, T, "ea", r, o),
			cs: l1(a, T, "cs", r, o)
		});
		var w = [
			f[q2(o, r) ? "cs" : J2(o, r) ? "ea" : "latin"],
			f.latin,
			f.ea,
			f.cs,
			f.sym
		], m = [];
		return w.forEach(function(x) {
			var b = Q2(x);
			b !== void 0 && m.indexOf(b) === -1 && m.push(b);
		}), m.length ? m.join(",") : "inherit";
	}
	async function hg(e, i, a, h, o, r, d, s) {
		var g = c(e, ["a:rPr"]), f, D, ve, T = "", w = "";
		if (g !== void 0) {
			if (f = zn(g), f == "SOLID_FILL") {
				var m = g["a:solidFill"];
				D = ua(m, void 0, void 0, s);
				var x = g["a:highlight"];
				x !== void 0 && (w = ua(x, void 0, void 0, s)), T = "solid";
			} else if (f == "PATTERN_FILL") {
				var b = g["a:pattFill"];
				D = Ko(b, s), T = "pattern";
			} else if (f == "PIC_FILL") D = await Zi(g, "slideBg", s, void 0, void 0), T = "pic";
			else if (f == "GRADIENT_FILL") {
				var L = g["a:gradFill"];
				D = is(L, s), T = "gradient";
			}
		}
		if (D === void 0 && c(a, ["a:lvl" + o + "pPr", "a:defRPr"]) !== void 0) {
			var v = c(a, ["a:lvl" + o + "pPr", "a:defRPr"]);
			if (f = zn(v), f == "SOLID_FILL") {
				var m = v["a:solidFill"];
				D = ua(m, void 0, void 0, s);
				var x = v["a:highlight"];
				x !== void 0 && (w = ua(x, void 0, void 0, s)), T = "solid";
			} else if (f == "PATTERN_FILL") {
				var b = v["a:pattFill"];
				D = Ko(b, s), T = "pattern";
			} else if (f == "PIC_FILL") D = await Zi(v, "slideBg", s, void 0, void 0), T = "pic";
			else if (f == "GRADIENT_FILL") {
				var L = v["a:gradFill"];
				D = is(L, s), T = "gradient";
			}
		}
		if (D === void 0) {
			var p = c(i, ["p:style", "a:fontRef"]);
			if (p !== void 0) {
				D = ua(p, void 0, void 0, s), D !== void 0 && (T = "solid");
				var x = p["a:highlight"];
				x !== void 0 && (w = ua(x, void 0, void 0, s));
			}
			D === void 0 && h !== void 0 && (D = ua(h, void 0, void 0, s), D !== void 0 && (T = "solid"));
		}
		if (D === void 0) {
			var l = Vo(i, r, d, s), M = l.nodeLaout, J = l.nodeMaster;
			if (M !== void 0) {
				var se = c(M, ["a:defRPr", "a:solidFill"]);
				if (se !== void 0) {
					D = ua(se, void 0, void 0, s);
					var x = c(M, ["a:defRPr", "a:highlight"]);
					x !== void 0 && (w = ua(x, void 0, void 0, s)), T = "solid";
				}
			}
			if (D === void 0 && J !== void 0) {
				var ne = c(J, ["a:defRPr", "a:solidFill"]);
				if (ne !== void 0) {
					D = ua(ne, void 0, void 0, s);
					var x = c(J, ["a:defRPr", "a:highlight"]);
					x !== void 0 && (w = ua(x, void 0, void 0, s)), T = "solid";
				}
			}
		}
		var ce = [], N = {}, ke = c(e, ["a:rPr", "a:ln"]), ve = "";
		if (ke !== void 0 && ke["a:noFill"] === void 0) {
			var S = ii(e, i, !1, "text", s).split(" "), K = parseInt(S[0].substring(0, S[0].indexOf("px"))) + "px", y = S[2];
			T == "solid" ? (ve = "-" + K + " 0 " + y + ", 0 " + K + " " + y + ", " + K + " 0 " + y + ", 0 -" + K + " " + y, ce.push(ve)) : N.border = K + " " + y;
		}
		var X = c(e, [
			"a:rPr",
			"a:effectLst",
			"a:glow"
		]), le = "";
		if (X !== void 0) {
			var t = ua(X, void 0, void 0, s), n = X.attrs.rad ? X.attrs.rad * k : 0;
			le = "0 0 " + n + "px #" + t + ", 0 0 " + n + "px #" + t + ", 0 0 " + n + "px #" + t + ", 0 0 " + n + "px #" + t + ", 0 0 " + n + "px #" + t + ", 0 0 " + n + "px #" + t + ", 0 0 " + n + "px #" + t, T == "solid" ? ce.push(le) : ce.push("drop-shadow(0 0 " + n / 3 + "px #" + t + ") drop-shadow(0 0 " + n * 2 / 3 + "px #" + t + ") drop-shadow(0 0 " + n + "px #" + t + ")");
		}
		var pe = c(e, [
			"a:rPr",
			"a:effectLst",
			"a:outerShdw"
		]), Be = "";
		if (pe !== void 0) {
			var W = ua(pe, void 0, void 0, s), _ = pe.attrs;
			_.algn;
			var H = _.dir ? parseInt(_.dir) / 6e4 : 0, Le = parseInt(_.dist) * k;
			_.rotWithShape;
			var Te = _.blurRad ? parseInt(_.blurRad) * k + "px" : "";
			_.sx && parseInt(_.sx) / 1e5, _.sy && parseInt(_.sy) / 1e5;
			var Ua = Le * Math.sin(H * Math.PI / 180), ya = Le * Math.cos(H * Math.PI / 180);
			!isNaN(Ua) && !isNaN(ya) && (Be = ya + "px " + Ua + "px " + Te + " #" + W, T == "solid" ? ce.push(Be) : ce.push("drop-shadow(" + ya + "px " + Ua + "px " + Te + " #" + W + ")"));
		}
		var pa = "", na;
		return T == "solid" ? (ce.length > 0 && (pa = ce.join(",")), na = pa + ";") : (ce.length > 0 && (pa = ce.join(" ")), N.effcts = pa, na = N), [
			D,
			na,
			T,
			w
		];
	}
	function f1(e, i, a, h, o, r) {
		var d = i !== void 0 ? i["a:lstStyle"] : void 0, s = "a:lvl" + h + "pPr", g = void 0, f, D;
		e["a:rPr"] !== void 0 && (g = parseInt(e["a:rPr"].attrs.sz) / 100), (isNaN(g) || g === void 0 && e["a:fld"] !== void 0) && (f = c(e["a:fld"], [
			"a:rPr",
			"attrs",
			"sz"
		]), g = parseInt(f) / 100), (isNaN(g) || g === void 0) && e["a:t"] === void 0 && (f = c(e["a:endParaRPr"], ["attrs", "sz"]), g = parseInt(f) / 100), (isNaN(g) || g === void 0) && d !== void 0 && (f = c(d, [
			s,
			"a:defRPr",
			"attrs",
			"sz"
		]), g = parseInt(f) / 100);
		var T = !1;
		i !== void 0 && c(i, ["a:bodyPr", "a:spAutoFit"]) !== void 0 && (T = !0), (isNaN(g) || g === void 0) && (f = c(r.slideLayoutTables, [
			"typeTable",
			o,
			"p:txBody",
			"a:lstStyle",
			s,
			"a:defRPr",
			"attrs",
			"sz"
		]), g = parseInt(f) / 100, D = c(r.slideLayoutTables, [
			"typeTable",
			o,
			"p:txBody",
			"a:lstStyle",
			s,
			"a:defRPr",
			"attrs",
			"kern"
		]), T && D !== void 0 && !isNaN(g) && g - parseInt(D) / 100 > 0 && (g = g - parseInt(D) / 100)), (isNaN(g) || g === void 0) && (f = c(r.slideMasterTables, [
			"typeTable",
			o,
			"p:txBody",
			"a:lstStyle",
			s,
			"a:defRPr",
			"attrs",
			"sz"
		]), D = c(r.slideMasterTables, [
			"typeTable",
			o,
			"p:txBody",
			"a:lstStyle",
			s,
			"a:defRPr",
			"attrs",
			"kern"
		]), f === void 0 && (o == "title" || o == "subTitle" || o == "ctrTitle" ? (f = c(r.slideMasterTextStyles, [
			"p:titleStyle",
			s,
			"a:defRPr",
			"attrs",
			"sz"
		]), D = c(r.slideMasterTextStyles, [
			"p:titleStyle",
			s,
			"a:defRPr",
			"attrs",
			"kern"
		])) : o == "body" || o == "obj" || o == "dt" || o == "sldNum" || o === "textBox" ? (f = c(r.slideMasterTextStyles, [
			"p:bodyStyle",
			s,
			"a:defRPr",
			"attrs",
			"sz"
		]), D = c(r.slideMasterTextStyles, [
			"p:bodyStyle",
			s,
			"a:defRPr",
			"attrs",
			"kern"
		])) : o == "shape" && (f = c(r.slideMasterTextStyles, [
			"p:otherStyle",
			s,
			"a:defRPr",
			"attrs",
			"sz"
		]), D = c(r.slideMasterTextStyles, [
			"p:otherStyle",
			s,
			"a:defRPr",
			"attrs",
			"kern"
		]), T = !1), f === void 0 && (f = c(r.defaultTextStyle, [
			s,
			"a:defRPr",
			"attrs",
			"sz"
		]), D = D === void 0 ? c(r.defaultTextStyle, [
			s,
			"a:defRPr",
			"attrs",
			"kern"
		]) : void 0, T = !1)), g = parseInt(f) / 100, T && D !== void 0 && !isNaN(g) && g - parseInt(D) / 100 > parseInt(D) / 100 && (g = g - parseInt(D) / 100));
		var w = c(e, [
			"a:rPr",
			"attrs",
			"baseline"
		]);
		if (w !== void 0 && !isNaN(g)) {
			var m = parseInt(w) / 1e5;
			g -= m;
		}
		if (!isNaN(g)) {
			var x = c(i, [
				"a:bodyPr",
				"a:normAutofit",
				"attrs",
				"fontScale"
			]);
			x !== void 0 && x != 0 && (g = Math.round(g * (x / 1e5)));
		}
		return isNaN(g) ? o == "br" ? "initial" : "inherit" : g * qc + "px";
	}
	function Z2(e, i, a, h, o) {
		var r = c(e, [
			"a:rPr",
			"attrs",
			"b"
		]);
		return r === void 0 && (r = c(h, [
			"a:defRPr",
			"attrs",
			"b"
		])), r === void 0 && (r = c(o, [
			"a:defRPr",
			"attrs",
			"b"
		])), r === "1" || r === !0 ? "bold" : r === "0" || r === !1 ? "normal" : "inherit";
	}
	function ep(e, i, a, h, o) {
		var r = c(e, [
			"a:rPr",
			"attrs",
			"i"
		]);
		return r === void 0 && (r = c(h, [
			"a:defRPr",
			"attrs",
			"i"
		])), r === void 0 && (r = c(o, [
			"a:defRPr",
			"attrs",
			"i"
		])), r === "1" || r === !0 ? "italic" : r === "0" || r === !1 ? "normal" : "inherit";
	}
	function ap(e, i, a) {
		if (e["a:rPr"] !== void 0) {
			var h = e["a:rPr"].attrs.u !== void 0 ? e["a:rPr"].attrs.u : "none", o = e["a:rPr"].attrs.strike !== void 0 ? e["a:rPr"].attrs.strike : "noStrike";
			return h != "none" && o == "noStrike" ? "underline" : h == "none" && o != "noStrike" ? "line-through" : h != "none" && o != "noStrike" ? "underline line-through" : "inherit";
		} else return "inherit";
	}
	function tp(e, i, a, h) {
		var o = c(e, [
			"a:pPr",
			"attrs",
			"algn"
		]);
		if (o === void 0 && (o = c(i, [
			"a:pPr",
			"attrs",
			"algn"
		])), o === void 0) if (a == "title" || a == "ctrTitle" || a == "subTitle") {
			var r = 1, d = c(i, [
				"a:pPr",
				"attrs",
				"lvl"
			]);
			d !== void 0 && (r = parseInt(d) + 1);
			var s = "a:lvl" + r + "pPr";
			o = c(h, [
				"slideLayoutTables",
				"typeTable",
				a,
				"p:txBody",
				"a:lstStyle",
				s,
				"attrs",
				"algn"
			]), o === void 0 && (o = c(h, [
				"slideMasterTables",
				"typeTable",
				a,
				"p:txBody",
				"a:lstStyle",
				s,
				"attrs",
				"algn"
			]), o === void 0 && (o = c(h, [
				"slideMasterTextStyles",
				"p:titleStyle",
				s,
				"attrs",
				"algn"
			]), o === void 0 && a === "subTitle" && (o = c(h, [
				"slideMasterTextStyles",
				"p:bodyStyle",
				s,
				"attrs",
				"algn"
			]))));
		} else a == "body" ? o = c(h, [
			"slideMasterTextStyles",
			"p:bodyStyle",
			"a:lvl1pPr",
			"attrs",
			"algn"
		]) : o = c(h, [
			"slideMasterTables",
			"typeTable",
			a,
			"p:txBody",
			"a:lstStyle",
			"a:lvl1pPr",
			"attrs",
			"algn"
		]);
		var g = "inherit";
		if (o !== void 0) switch (o) {
			case "l":
				g = "left";
				break;
			case "r":
				g = "right";
				break;
			case "ctr":
				g = "center";
				break;
			case "just":
				g = "justify";
				break;
			case "dist":
				g = "justify";
				break;
			default: g = "inherit";
		}
		return g;
	}
	function np(e, i, a) {
		var h = c(e, [
			"a:rPr",
			"attrs",
			"baseline"
		]);
		return h === void 0 ? "baseline" : parseInt(h) / 1e3 + "%";
	}
	function Yo(e, i) {
		var a = "";
		if (e["a:bottom"] !== void 0) {
			var h = { "p:spPr": { "a:ln": e["a:bottom"]["a:ln"] } }, o = ii(h, void 0, !1, "shape", i);
			a += o.replace("border", "border-bottom");
		}
		if (e["a:top"] !== void 0) {
			var h = { "p:spPr": { "a:ln": e["a:top"]["a:ln"] } }, o = ii(h, void 0, !1, "shape", i);
			a += o.replace("border", "border-top");
		}
		if (e["a:right"] !== void 0) {
			var h = { "p:spPr": { "a:ln": e["a:right"]["a:ln"] } }, o = ii(h, void 0, !1, "shape", i);
			a += o.replace("border", "border-right");
		}
		if (e["a:left"] !== void 0) {
			var h = { "p:spPr": { "a:ln": e["a:left"]["a:ln"] } }, o = ii(h, void 0, !1, "shape", i);
			a += o.replace("border", "border-left");
		}
		return a;
	}
	function ii(e, i, a, h, o) {
		var r, d;
		if (h == "shape" ? (r = "border: ", d = e["p:spPr"]["a:ln"]) : h == "text" && (r = "", d = e["a:rPr"]["a:ln"]), c(d, ["a:noFill"]) !== void 0) return "hidden";
		if (d == null) {
			var s = c(e, ["p:style", "a:lnRef"]);
			if (s !== void 0) {
				var g = c(s, ["attrs", "idx"]);
				d = o.themeContent["a:theme"]["a:themeElements"]["a:fmtScheme"]["a:lnStyleLst"]["a:ln"][Number(g) - 1];
			}
		}
		d == null && (r = "", d = e);
		var f;
		if (d !== void 0) {
			var D = parseInt(c(d, ["attrs", "w"])) / 12700;
			isNaN(D) || D < 1 ? r += "1.3333333333333333px " : r += D + "px ";
			var T = c(d, [
				"a:prstDash",
				"attrs",
				"val"
			]);
			T === void 0 && (T = c(d, ["attrs", "cmpd"]));
			var w = "0";
			switch (T) {
				case "solid":
					r += "solid", w = "0";
					break;
				case "dash":
					r += "dashed", w = "5";
					break;
				case "dashDot":
					r += "dashed", w = "5, 5, 1, 5";
					break;
				case "dot":
					r += "dotted", w = "1, 5";
					break;
				case "lgDash":
					r += "dashed", w = "10, 5";
					break;
				case "dbl":
					r += "double", w = "0";
					break;
				case "lgDashDotDot":
					r += "dashed", w = "10, 5, 1, 5, 1, 5";
					break;
				case "sysDash":
					r += "dashed", w = "5, 2";
					break;
				case "sysDashDot":
					r += "dashed", w = "5, 2, 1, 5";
					break;
				case "sysDashDotDot":
					r += "dashed", w = "5, 2, 1, 5, 1, 5";
					break;
				case "sysDot":
					r += "dotted", w = "2, 5";
					break;
				default: r += "solid", w = "0";
			}
			var m = zn(d);
			m == "NO_FILL" ? f = a ? "none" : "" : m == "SOLID_FILL" ? f = ua(d["a:solidFill"], void 0, void 0, o) : m == "GRADIENT_FILL" ? f = is(d["a:gradFill"], o) : m == "PATTERN_FILL" && (f = Ko(d["a:pattFill"], o));
		}
		if (f === void 0) {
			var s = c(e, ["p:style", "a:lnRef"]);
			s !== void 0 && (f = ua(s, void 0, void 0, o));
		}
		return f === void 0 ? a ? f = "none" : f = "hidden" : f = "#" + f, r += " " + f + " ", a ? {
			color: f,
			width: D,
			type: T,
			strokeDasharray: w
		} : r + ";";
	}
	async function ip(e, i, a) {
		var h = e.slideContent, o = e.slideLayoutContent, r = e.slideMasterContent, d = c(o, [
			"p:sldLayout",
			"p:cSld",
			"p:spTree"
		]), s = c(r, [
			"p:sldMaster",
			"p:cSld",
			"p:spTree"
		]), g = c(h, [
			"p:sld",
			"attrs",
			"showMasterSp"
		]), f = c(o, [
			"p:sldLayout",
			"attrs",
			"showMasterSp"
		]), D = g !== void 0 ? g : f, T = !(D === "0" || D === "false"), w = await gg(e, a) || "", m = "<div class='slide-background slide-background-" + a + "' style='position:absolute;top:0;left:0;overflow:hidden;z-index:0;width:" + i.width + "px; height:" + i.height + "px;" + w + "'>";
		if (s !== void 0 && T) for (var x in s) if (s[x].constructor === Array) for (var b = 0; b < s[x].length; b++) {
			var L = c(s[x][b], [
				"p:nvSpPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]);
			m += await Ur(x, s[x][b], s, e, "slideMasterBg");
		}
		else {
			var L = c(s[x], [
				"p:nvSpPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]);
			m += await Ur(x, s[x], s, e, "slideMasterBg");
		}
		if (d !== void 0) for (var x in d) if (d[x].constructor === Array) for (var b = 0; b < d[x].length; b++) {
			var L = c(d[x][b], [
				"p:nvSpPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]);
			L != "pic" && (m += await Ur(x, d[x][b], d, e, "slideLayoutBg"));
		}
		else {
			var L = c(d[x], [
				"p:nvSpPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]);
			L != "pic" && (m += await Ur(x, d[x], d, e, "slideLayoutBg"));
		}
		return m + "</div>";
	}
	function rp(e) {
		var i = [];
		return e === void 0 ? i : (Object.keys(e).forEach(function(a) {
			var h = e[a];
			if (a != "attrs") if (h.constructor === Array) for (var o = 0; o < h.length; o++) {
				var r = {};
				r[a] = h[o], r.idex = Number(c(h[o], ["attrs", "order"])) || i.length + 1, r.attrs = { order: r.idex }, i.push(r);
			}
			else {
				var r = {};
				r[a] = h, r.idex = Number(c(h, ["attrs", "order"])) || i.length + 1, r.attrs = { order: r.idex }, i.push(r);
			}
		}), i.sort(function(a, h) {
			return a.idex - h.idex;
		}));
	}
	function dp(e, i) {
		if (!(i == 0 || i == 1e3)) {
			var a = i > 1e3 ? "a:bgFillStyleLst" : "a:fillStyleLst", h = i > 1e3 ? i - 1e3 : i;
			return rp(c(e.themeContent, [
				"a:theme",
				"a:themeElements",
				"a:fmtScheme",
				a
			]))[h - 1];
		}
	}
	async function ts(e, i, a, h, o, r, d) {
		if (e !== void 0) {
			var s = zn(e);
			if (s == "SOLID_FILL") {
				var g = e["a:solidFill"], f = ua(g, i, a, o);
				return f !== void 0 ? "background: #" + f + ";" : void 0;
			} else {
				if (s == "GRADIENT_FILL") return Nr(e, a, h, o);
				if (s == "PIC_FILL") return await Zi(e, d || "themeBg", o, a, r);
				if (s == "PATTERN_FILL") {
					var D = Ko(e["a:pattFill"], o);
					if (D !== void 0) {
						var T = "background: " + D[0] + ";";
						return D[1] !== null && D[1] !== void 0 && D[1] != "" && (T += "background-size:" + D[1] + ";"), D[2] !== null && D[2] !== void 0 && D[2] != "" && (T += "background-position:" + D[2] + ";"), T;
					}
				}
			}
		}
	}
	async function p1(e, i, a, h, o, r) {
		return await ts(dp(o, e), i, a, h, o, r, "themeBg");
	}
	async function gg(e, i) {
		var a = e.slideContent, h = e.slideLayoutContent, o = e.slideMasterContent, r = c(a, [
			"p:sld",
			"p:cSld",
			"p:bg",
			"p:bgPr"
		]), d = c(a, [
			"p:sld",
			"p:cSld",
			"p:bg",
			"p:bgRef"
		]), s;
		if (r !== void 0) {
			var g = zn(r);
			if (g == "SOLID_FILL") {
				var f = r["a:solidFill"], D, T = c(a, [
					"p:sld",
					"p:clrMapOvr",
					"a:overrideClrMapping",
					"attrs"
				]);
				if (T !== void 0) D = T;
				else {
					var T = c(h, [
						"p:sldLayout",
						"p:clrMapOvr",
						"a:overrideClrMapping",
						"attrs"
					]);
					T !== void 0 ? D = T : D = c(o, [
						"p:sldMaster",
						"p:clrMap",
						"attrs"
					]);
				}
				var w = ua(f, D, void 0, e);
				s = "background: #" + w + ";";
			} else g == "GRADIENT_FILL" ? s = Nr(r, void 0, o, e) : g == "PIC_FILL" && (s = await Zi(r, "slideBg", e, void 0, i));
		} else if (d !== void 0) {
			var D, T = c(a, [
				"p:sld",
				"p:clrMapOvr",
				"a:overrideClrMapping",
				"attrs"
			]);
			if (T !== void 0) D = T;
			else {
				var T = c(h, [
					"p:sldLayout",
					"p:clrMapOvr",
					"a:overrideClrMapping",
					"attrs"
				]);
				T !== void 0 ? D = T : D = c(o, [
					"p:sldMaster",
					"p:clrMap",
					"attrs"
				]);
			}
			var m = ua(d, D, void 0, e), x = Number(d.attrs.idx);
			if (!(x == 0 || x == 1e3)) {
				if (x > 0 && x < 1e3) s = await p1(x, D, m, o, e, i);
				else if (x > 1e3) {
					var b = x - 1e3, L = e.themeContent["a:theme"]["a:themeElements"]["a:fmtScheme"]["a:bgFillStyleLst"], v = [];
					Object.keys(L).forEach(function(ce) {
						var N = L[ce];
						if (ce != "attrs") if (N.constructor === Array) for (var ke = 0; ke < N.length; ke++) {
							var ve = {};
							ve[ce] = N[ke], ve.idex = N[ke].attrs.order, ve.attrs = { order: N[ke].attrs.order }, v.push(ve);
						}
						else {
							var ve = {};
							ve[ce] = N, ve.idex = N.attrs.order, ve.attrs = { order: N.attrs.order }, v.push(ve);
						}
					});
					var p = v.slice(0);
					p.sort(function(ce, N) {
						return ce.idex - N.idex;
					});
					var l = p[b - 1], g = zn(l);
					if (g == "SOLID_FILL") {
						var f = l["a:solidFill"], w = ua(f, D, void 0, e);
						s = "background: #" + w + ";";
					} else g == "GRADIENT_FILL" ? s = Nr(l, m, o, e) : g == "PIC_FILL" ? s = await Zi(l, "themeBg", e, m, i) : g == "PATTERN_FILL" ? s = await ts(l, D, m, o, e, i, "themeBg") : console.log(g);
				}
			}
		} else {
			r = c(h, [
				"p:sldLayout",
				"p:cSld",
				"p:bg",
				"p:bgPr"
			]), d = c(h, [
				"p:sldLayout",
				"p:cSld",
				"p:bg",
				"p:bgRef"
			]);
			var D, T = c(h, [
				"p:sldLayout",
				"p:clrMapOvr",
				"a:overrideClrMapping",
				"attrs"
			]);
			if (T !== void 0 ? D = T : D = c(o, [
				"p:sldMaster",
				"p:clrMap",
				"attrs"
			]), r !== void 0) {
				var g = zn(r);
				if (g == "SOLID_FILL") {
					var f = r["a:solidFill"], w = ua(f, D, void 0, e);
					s = "background: #" + w + ";";
				} else g == "GRADIENT_FILL" ? s = Nr(r, void 0, o, e) : g == "PIC_FILL" && (s = await Zi(r, "slideLayoutBg", e, void 0, i));
			} else if (d !== void 0) {
				var m = ua(d, D, void 0, e), x = Number(d.attrs.idx);
				if (!(x == 0 || x == 1e3)) {
					if (x > 0 && x < 1e3) s = await p1(x, D, m, o, e, i);
					else if (x > 1e3) {
						var b = x - 1e3, L = e.themeContent["a:theme"]["a:themeElements"]["a:fmtScheme"]["a:bgFillStyleLst"], v = [];
						Object.keys(L).forEach(function(X) {
							var le = L[X];
							if (X != "attrs") if (le.constructor === Array) for (var t = 0; t < le.length; t++) {
								var n = {};
								n[X] = le[t], n.idex = le[t].attrs.order, n.attrs = { order: le[t].attrs.order }, v.push(n);
							}
							else {
								var n = {};
								n[X] = le, n.idex = le.attrs.order, n.attrs = { order: le.attrs.order }, v.push(n);
							}
						});
						var p = v.slice(0);
						p.sort(function(X, le) {
							return X.idex - le.idex;
						});
						var l = p[b - 1], g = zn(l);
						if (g == "SOLID_FILL") {
							var f = l["a:solidFill"], w = ua(f, D, m, e);
							s = "background: #" + w + ";";
						} else g == "GRADIENT_FILL" ? s = Nr(l, m, o, e) : g == "PIC_FILL" ? s = await Zi(l, "themeBg", e, m, i) : g == "PATTERN_FILL" ? s = await ts(l, D, m, o, e, i, "themeBg") : console.log(g);
					}
				}
			} else {
				r = c(o, [
					"p:sldMaster",
					"p:cSld",
					"p:bg",
					"p:bgPr"
				]), d = c(o, [
					"p:sldMaster",
					"p:cSld",
					"p:bg",
					"p:bgRef"
				]);
				var M = c(o, [
					"p:sldMaster",
					"p:clrMap",
					"attrs"
				]);
				if (r !== void 0) {
					var g = zn(r);
					if (g == "SOLID_FILL") {
						var f = r["a:solidFill"], w = ua(f, M, void 0, e);
						s = "background: #" + w + ";";
					} else g == "GRADIENT_FILL" ? s = Nr(r, void 0, o, e) : g == "PIC_FILL" && (s = await Zi(r, "slideMasterBg", e, void 0, i));
				} else if (d !== void 0) {
					var m = ua(d, M, void 0, e), x = Number(d.attrs.idx);
					if (!(x == 0 || x == 1e3)) {
						if (x > 0 && x < 1e3) s = await p1(x, M, m, o, e, i);
						else if (x > 1e3) {
							var b = x - 1e3, L = e.themeContent["a:theme"]["a:themeElements"]["a:fmtScheme"]["a:bgFillStyleLst"], v = [];
							Object.keys(L).forEach(function(X) {
								var le = L[X];
								if (X != "attrs") if (le.constructor === Array) for (var t = 0; t < le.length; t++) {
									var n = {};
									n[X] = le[t], n.idex = le[t].attrs.order, n.attrs = { order: le[t].attrs.order }, v.push(n);
								}
								else {
									var n = {};
									n[X] = le, n.idex = le.attrs.order, n.attrs = { order: le.attrs.order }, v.push(n);
								}
							});
							var p = v.slice(0);
							p.sort(function(X, le) {
								return X.idex - le.idex;
							});
							var l = p[b - 1], g = zn(l);
							if (g == "SOLID_FILL") {
								var f = l["a:solidFill"], w = ua(f, M, m, e);
								s = "background: #" + w + ";";
							} else g == "GRADIENT_FILL" ? s = Nr(l, m, o, e) : g == "PIC_FILL" ? s = await Zi(l, "themeBg", e, m, i) : g == "PATTERN_FILL" ? s = await ts(l, M, m, o, e, i, "themeBg") : console.log(g);
						}
					}
				}
			}
		}
		return s;
	}
	function Nr(e, i, a, h) {
		var o = "";
		if (e !== void 0) {
			var r = e["a:gradFill"], d = r["a:gsLst"]["a:gs"];
			d.constructor !== Array && (d = [d]);
			for (var s = c(a, [
				"p:sldMaster",
				"p:clrMap",
				"attrs"
			]), g = [], f = [], D = 0; D < d.length; D++) {
				var T = "", T = ua(d[D], s, i, h), w = c(d[D], ["attrs", "pos"]);
				w !== void 0 ? f[D] = w / 1e3 + "%" : f[D] = "", g[D] = "#" + T;
			}
			var m = r["a:lin"], x = 90;
			m !== void 0 && (x = Dd(m.attrs.ang), x = x + 90), o = "background: linear-gradient(" + x + "deg,";
			for (var D = 0; D < d.length; D++) D == d.length - 1 ? o += g[D] + " " + f[D] + ");" : o += g[D] + " " + f[D] + ", ";
		} else i !== void 0 && (o = "background: #" + i + ";");
		return o;
	}
	async function Zi(e, i, a, h, o) {
		var r, d = await lg(i, e["a:blipFill"], a);
		if (d !== void 0) {
			var s = c(e, ["attrs", "order"]), g = c(e, ["a:blipFill", "a:blip"]), f = c(g, ["a:duotone"]);
			if (f !== void 0) {
				var D = [];
				Object.keys(f).forEach(function(b) {
					if (b != "attrs") {
						var L = {};
						L[b] = f[b], D.push(ua(L, void 0, h, a));
					}
				});
			}
			var T = c(g, ["a:alphaModFix", "attrs"]), w = "";
			T !== void 0 && T.amt !== void 0 && T.amt != "" && (w = "opacity:" + parseInt(T.amt) / 1e5 + ";");
			var m = c(e, [
				"a:blipFill",
				"a:tile",
				"attrs"
			]), x = "";
			return m !== void 0 && m.sx !== void 0 && (parseInt(m.sx) / 1e5, parseInt(m.sy) / 1e5, parseInt(m.tx) / 1e5, parseInt(m.ty) / 1e5, m.algn, m.flip, x += "background-repeat: round;"), c(e, ["a:blipFill", "a:stretch"]) !== void 0 && (x += "background-repeat: no-repeat;", x += "background-position: center;", x += "background-size: 100% 100%;"), r = "background: url(" + d + ");" + (s !== void 0 ? " z-index: " + s + ";" : "") + x + w, r;
		}
	}
	async function ns(e, i, a, h, o) {
		var r = zn(c(e, ["p:spPr"])), d, s;
		if (r == "NO_FILL") return a ? "none" : "";
		if (r == "SOLID_FILL" ? (s = e["p:spPr"]["a:solidFill"], d = ua(s, void 0, void 0, h)) : r == "GRADIENT_FILL" ? (s = e["p:spPr"]["a:gradFill"], d = is(s, h)) : r == "PATTERN_FILL" ? (s = e["p:spPr"]["a:pattFill"], d = Ko(s, h)) : r == "PIC_FILL" && (s = e["p:spPr"]["a:blipFill"], d = await lg(o, s, h)), d === void 0) {
			var g = c(e, ["p:style", "a:fillRef"]), f = parseInt(c(e, [
				"p:style",
				"a:fillRef",
				"attrs",
				"idx"
			]));
			if (f == 0 || f == 1e3) return a ? "none" : "";
			d = ua(g, void 0, void 0, h);
		}
		if (d === void 0) {
			if (c(e, ["p:spPr", "a:grpFill"]) !== void 0) return await ns({ "p:spPr": i["p:grpSpPr"] }, e, a, h, o);
			if (r == "NO_FILL") return a ? "none" : "";
		}
		if (d !== void 0) if (r == "GRADIENT_FILL") {
			if (a) return d;
			for (var D = d.color, T = "background: linear-gradient(" + d.rot + "deg,", w = 0; w < D.length; w++) w == D.length - 1 ? T += "#" + D[w] + ");" : T += "#" + D[w] + ", ";
			return T;
		} else {
			if (r == "PIC_FILL") return a ? d : "background-image:url(" + d + ");";
			if (r == "PATTERN_FILL") {
				var m = "", x = "", b = "";
				return m = d[0], d[1] !== null && d[1] !== void 0 && d[1] != "" && (x = " background-size:" + d[1] + ";"), d[2] !== null && d[2] !== void 0 && d[2] != "" && (b = " background-position:" + d[2] + ";"), "background: " + m + ";" + x + b;
			} else return a ? (d = Ge(d).toRgbString(), d) : "background-color: #" + d + ";";
		}
		else return a ? "none" : "background-color: inherit;";
	}
	function zn(e = {}) {
		var i = "";
		return e["a:noFill"] !== void 0 && (i = "NO_FILL"), e["a:solidFill"] !== void 0 && (i = "SOLID_FILL"), e["a:gradFill"] !== void 0 && (i = "GRADIENT_FILL"), e["a:pattFill"] !== void 0 && (i = "PATTERN_FILL"), e["a:blipFill"] !== void 0 && (i = "PIC_FILL"), e["a:grpFill"] !== void 0 && (i = "GROUP_FILL"), i;
	}
	function is(e, i) {
		for (var a = e["a:gsLst"]["a:gs"], h = [], o = 0; o < a.length; o++) h[o] = ua(a[o], void 0, void 0, i);
		var r = e["a:lin"], d = 0;
		return r !== void 0 && (d = Dd(r.attrs.ang) + 90), {
			color: h,
			rot: d
		};
	}
	async function lg(e, i, a) {
		var h, o = i["a:blip"].attrs["r:embed"], r;
		if (e == "slideBg" || e == "slide" ? r = c(a, [
			"slideResObj",
			o,
			"target"
		]) : e == "slideLayoutBg" ? r = c(a, [
			"layoutResObj",
			o,
			"target"
		]) : e == "slideMasterBg" ? r = c(a, [
			"masterResObj",
			o,
			"target"
		]) : e == "themeBg" ? r = c(a, [
			"themeResObj",
			o,
			"target"
		]) : e == "diagramBg" && (r = c(a, [
			"diagramResObj",
			o,
			"target"
		])), r !== void 0) {
			if (h = c(a, ["loaded-images", r]), h === void 0) {
				r = ds(r);
				var d = r.split(".").pop();
				if (d == "xml") return;
				h = ig(d, await a.zip.file(r).async("arraybuffer")), hp(a, ["loaded-images", r], h);
			}
			return h;
		}
	}
	function Ko(e, i) {
		var a = "", h = "", o = "", r = e["a:bgClr"], d = e["a:fgClr"];
		return o = e.attrs.prst, a = ua(d, void 0, void 0, i), h = ua(r, void 0, void 0, i), op(o, h, a);
	}
	function op(e, i, a) {
		switch (e) {
			case "smGrid": return ["linear-gradient(to right,  #" + a + " -1px, transparent 1px ), linear-gradient(to bottom,  #" + a + " -1px, transparent 1px)  #" + i + ";", "4px 4px"];
			case "dotGrid": return ["linear-gradient(to right,  #" + a + " -1px, transparent 1px ), linear-gradient(to bottom,  #" + a + " -1px, transparent 1px)  #" + i + ";", "8px 8px"];
			case "lgGrid": return ["linear-gradient(to right,  #" + a + " -1px, transparent 1.5px ), linear-gradient(to bottom,  #" + a + " -1px, transparent 1.5px)  #" + i + ";", "8px 8px"];
			case "wdUpDiag": return ["repeating-linear-gradient(-45deg, transparent 1px , transparent 4px, #" + a + " 7px)#" + i + ";"];
			case "dkUpDiag": return ["repeating-linear-gradient(-45deg, transparent 1px , #" + i + " 5px)#" + a + ";"];
			case "ltUpDiag": return ["repeating-linear-gradient(-45deg, transparent 1px , transparent 2px, #" + a + " 4px)#" + i + ";"];
			case "wdDnDiag": return ["repeating-linear-gradient(45deg, transparent 1px , transparent 4px, #" + a + " 7px)#" + i + ";"];
			case "dkDnDiag": return ["repeating-linear-gradient(45deg, transparent 1px , #" + i + " 5px)#" + a + ";"];
			case "ltDnDiag": return ["repeating-linear-gradient(45deg, transparent 1px , transparent 2px, #" + a + " 4px)#" + i + ";"];
			case "dkHorz": return ["repeating-linear-gradient(0deg, transparent 1px , transparent 2px, #" + i + " 7px)#" + a + ";"];
			case "ltHorz": return ["repeating-linear-gradient(0deg, transparent 1px , transparent 5px, #" + a + " 7px)#" + i + ";"];
			case "narHorz": return ["repeating-linear-gradient(0deg, transparent 1px , transparent 2px, #" + a + " 4px)#" + i + ";"];
			case "dkVert": return ["repeating-linear-gradient(90deg, transparent 1px , transparent 2px, #" + i + " 7px)#" + a + ";"];
			case "ltVert": return ["repeating-linear-gradient(90deg, transparent 1px , transparent 5px, #" + a + " 7px)#" + i + ";"];
			case "narVert": return ["repeating-linear-gradient(90deg, transparent 1px , transparent 2px, #" + a + " 4px)#" + i + ";"];
			case "lgCheck":
			case "smCheck":
				var o = "", h = "";
				return e == "lgCheck" ? (o = "8px 8px", h = "0 0, 4px 4px, 4px 4px, 8px 8px") : (o = "4px 4px", h = "0 0, 2px 2px, 2px 2px, 4px 4px"), [
					"linear-gradient(45deg,  #" + a + " 25%, transparent 0, transparent 75%,  #" + a + " 0), linear-gradient(45deg,  #" + a + " 25%, transparent 0, transparent 75%,  #" + a + " 0) #" + i + ";",
					o,
					h
				];
			case "dashUpDiag": return ["repeating-linear-gradient(152deg, #" + a + ", #" + a + " 5% , transparent 0, transparent 70%)#" + i + ";", "4px 4px"];
			case "dashDnDiag": return ["repeating-linear-gradient(45deg, #" + a + ", #" + a + " 5% , transparent 0, transparent 70%)#" + i + ";", "4px 4px"];
			case "diagBrick": return ["linear-gradient(45deg, transparent 15%,  #" + a + " 30%, transparent 30%), linear-gradient(-45deg, transparent 15%,  #" + a + " 30%, transparent 30%), linear-gradient(-45deg, transparent 65%,  #" + a + " 80%, transparent 0) #" + i + ";", "4px 4px"];
			case "horzBrick": return [
				"linear-gradient(335deg, #" + i + " 1.6px, transparent 1.6px), linear-gradient(155deg, #" + i + " 1.6px, transparent 1.6px), linear-gradient(335deg, #" + i + " 1.6px, transparent 1.6px), linear-gradient(155deg, #" + i + " 1.6px, transparent 1.6px) #" + a + ";",
				"4px 4px",
				"0 0.15px, 0.3px 2.5px, 2px 2.15px, 2.35px 0.4px"
			];
			case "dashVert": return ["linear-gradient(0deg,  #" + i + " 30%, transparent 30%),linear-gradient(90deg,transparent, transparent 40%, #" + a + " 40%, #" + a + " 60% , transparent 60%)#" + i + ";", "4px 4px"];
			case "dashHorz": return ["linear-gradient(90deg,  #" + i + " 30%, transparent 30%),linear-gradient(0deg,transparent, transparent 40%, #" + a + " 40%, #" + a + " 60% , transparent 60%)#" + i + ";", "4px 4px"];
			case "solidDmnd": return ["linear-gradient(135deg,  #" + a + " 25%, transparent 25%), linear-gradient(225deg,  #" + a + " 25%, transparent 25%), linear-gradient(315deg,  #" + a + " 25%, transparent 25%), linear-gradient(45deg,  #" + a + " 25%, transparent 25%) #" + i + ";", "8px 8px"];
			case "openDmnd": return ["linear-gradient(45deg, transparent 0%, transparent calc(50% - 0.5px),  #" + a + " 50%, transparent calc(50% + 0.5px),  transparent 100%), linear-gradient(-45deg, transparent 0%, transparent calc(50% - 0.5px) , #" + a + " 50%, transparent calc(50% + 0.5px),  transparent 100%) #" + i + ";", "8px 8px"];
			case "dotDmnd": return [
				"radial-gradient(#" + a + " 15%, transparent 0), radial-gradient(#" + a + " 15%, transparent 0) #" + i + ";",
				"4px 4px",
				"0 0, 2px 2px"
			];
			case "zigZag":
			case "wave":
				var o = "";
				return e == "zigZag" ? o = "0" : o = "1px", ["linear-gradient(135deg,  #" + a + " 25%, transparent 25%) 50px " + o + ", linear-gradient(225deg,  #" + a + " 25%, transparent 25%) 50px " + o + ", linear-gradient(315deg,  #" + a + " 25%, transparent 25%), linear-gradient(45deg,  #" + a + " 25%, transparent 25%) #" + i + ";", "4px 4px"];
			case "lgConfetti":
			case "smConfetti":
				var o = "";
				return e == "lgConfetti" ? o = "4px 4px" : o = "2px 2px", ["linear-gradient(135deg,  #" + a + " 25%, transparent 25%) 50px 1px, linear-gradient(225deg,  #" + a + " 25%, transparent 25%), linear-gradient(315deg,  #" + a + " 25%, transparent 25%) 50px 1px , linear-gradient(45deg,  #" + a + " 25%, transparent 25%) #" + i + ";", o];
			case "plaid": return ["linear-gradient(0deg, transparent, transparent 25%, #" + a + "33 25%, #" + a + "33 50%),linear-gradient(90deg, transparent, transparent 25%, #" + a + "66 25%, #" + a + "66 50%) #" + i + ";", "4px 4px"];
			case "sphere": return ["radial-gradient(#" + a + " 50%, transparent 50%),#" + i + ";", "4px 4px"];
			case "weave":
			case "shingle": return ["linear-gradient(45deg, #" + i + " 1.31px , #" + a + " 1.4px, #" + a + " 1.5px, transparent 1.5px, transparent 4.2px, #" + a + " 4.2px, #" + a + " 4.3px, transparent 4.31px), linear-gradient(-45deg,  #" + i + " 1.31px , #" + a + " 1.4px, #" + a + " 1.5px, transparent 1.5px, transparent 4.2px, #" + a + " 4.2px, #" + a + " 4.3px, transparent 4.31px) 0 4px, #" + i + ";", "4px 8px"];
			case "pct5":
			case "pct10":
			case "pct20":
			case "pct25":
			case "pct30":
			case "pct40":
			case "pct50":
			case "pct60":
			case "pct70":
			case "pct75":
			case "pct80":
			case "pct90":
			case "trellis":
			case "divot":
				var r;
				switch (e) {
					case "pct5":
						r = [
							"0.3px",
							"10%",
							"2px 2px"
						];
						break;
					case "divot":
						r = [
							"0.3px",
							"40%",
							"4px 4px"
						];
						break;
					case "pct10":
						r = [
							"0.3px",
							"20%",
							"2px 2px"
						];
						break;
					case "pct20":
						r = [
							"0.2px",
							"40%",
							"2px 2px"
						];
						break;
					case "pct25":
						r = [
							"0.2px",
							"50%",
							"2px 2px"
						];
						break;
					case "pct30":
						r = [
							"0.5px",
							"50%",
							"2px 2px"
						];
						break;
					case "pct40":
						r = [
							"0.5px",
							"70%",
							"2px 2px"
						];
						break;
					case "pct50":
						r = [
							"0.09px",
							"90%",
							"2px 2px"
						];
						break;
					case "pct60":
						r = [
							"0.3px",
							"90%",
							"2px 2px"
						];
						break;
					case "pct70":
					case "trellis":
						r = [
							"0.5px",
							"95%",
							"2px 2px"
						];
						break;
					case "pct75":
						r = [
							"0.65px",
							"100%",
							"2px 2px"
						];
						break;
					case "pct80":
						r = [
							"0.85px",
							"100%",
							"2px 2px"
						];
						break;
					case "pct90":
						r = [
							"1px",
							"100%",
							"2px 2px"
						];
						break;
				}
				return ["radial-gradient(#" + a + " " + r[0] + ", transparent " + r[1] + "),#" + i + ";", r[2]];
			default: return [0, 0];
		}
	}
	function ua(e, i, a, h) {
		if (e !== void 0) {
			var o = "", r;
			if (e["a:srgbClr"] !== void 0) r = e["a:srgbClr"], o = c(r, ["attrs", "val"]);
			else if (e["a:schemeClr"] !== void 0) r = e["a:schemeClr"], o = fg("a:" + c(r, ["attrs", "val"]), i, a, h);
			else if (e["a:scrgbClr"] !== void 0) {
				r = e["a:scrgbClr"];
				var d = r.attrs, s = d.r.indexOf("%") != -1 ? d.r.split("%").shift() : d.r, g = d.g.indexOf("%") != -1 ? d.g.split("%").shift() : d.g, f = d.b.indexOf("%") != -1 ? d.b.split("%").shift() : d.b;
				o = md(255 * (Number(s) / 100)) + md(255 * (Number(g) / 100)) + md(255 * (Number(f) / 100));
			} else if (e["a:prstClr"] !== void 0) r = e["a:prstClr"], o = sp(c(r, ["attrs", "val"]));
			else if (e["a:hslClr"] !== void 0) {
				r = e["a:hslClr"];
				var d = r.attrs, D = cp(Number(d.hue) / 1e5, Number(d.sat.indexOf("%") != -1 ? d.sat.split("%").shift() : d.sat) / 100, Number(d.lum.indexOf("%") != -1 ? d.lum.split("%").shift() : d.lum) / 100);
				o = md(D.r) + md(D.g) + md(D.b);
			} else if (e["a:sysClr"] !== void 0) {
				r = e["a:sysClr"];
				var T = c(r, ["attrs", "lastClr"]);
				T !== void 0 && (o = T);
			}
			var w = !1, m = parseInt(c(r, [
				"a:alpha",
				"attrs",
				"val"
			])) / 1e5;
			if (!isNaN(m)) {
				var x = Ge(o);
				x.setAlpha(m), o = x.toHex8(), w = !0;
			}
			var b = parseInt(c(r, [
				"a:hueMod",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(b) || (o = bp(o, b, w));
			var L = parseInt(c(r, [
				"a:lumMod",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(L) || (o = pp(o, L, w));
			var v = parseInt(c(r, [
				"a:lumOff",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(v) || (o = fp(o, v, w));
			var p = parseInt(c(r, [
				"a:satMod",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(p) || (o = up(o, p, w));
			var l = parseInt(c(r, [
				"a:shade",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(l) || (o = gp(o, l, w));
			var M = parseInt(c(r, [
				"a:tint",
				"attrs",
				"val"
			])) / 1e5;
			return isNaN(M) || (o = lp(o, M, w)), o;
		}
	}
	function md(e) {
		for (var i = e.toString(16); i.length < 2;) i = "0" + i;
		return i;
	}
	function cp(e, i, a) {
		var h, o, r, d, s;
		return e = e / 60, a <= .5 ? o = a * (i + 1) : o = a + i - a * i, h = a * 2 - o, r = b1(h, o, e + 2) * 255, d = b1(h, o, e) * 255, s = b1(h, o, e - 2) * 255, {
			r,
			g: d,
			b: s
		};
	}
	function b1(e, i, a) {
		return a < 0 && (a += 6), a >= 6 && (a -= 6), a < 1 ? (i - e) * a + e : a < 3 ? i : a < 4 ? (i - e) * (4 - a) + e : e;
	}
	function sp(e) {
		var i, a = [
			"white",
			"AliceBlue",
			"AntiqueWhite",
			"Aqua",
			"Aquamarine",
			"Azure",
			"Beige",
			"Bisque",
			"black",
			"BlanchedAlmond",
			"Blue",
			"BlueViolet",
			"Brown",
			"BurlyWood",
			"CadetBlue",
			"Chartreuse",
			"Chocolate",
			"Coral",
			"CornflowerBlue",
			"Cornsilk",
			"Crimson",
			"Cyan",
			"DarkBlue",
			"DarkCyan",
			"DarkGoldenRod",
			"DarkGray",
			"DarkGrey",
			"DarkGreen",
			"DarkKhaki",
			"DarkMagenta",
			"DarkOliveGreen",
			"DarkOrange",
			"DarkOrchid",
			"DarkRed",
			"DarkSalmon",
			"DarkSeaGreen",
			"DarkSlateBlue",
			"DarkSlateGray",
			"DarkSlateGrey",
			"DarkTurquoise",
			"DarkViolet",
			"DeepPink",
			"DeepSkyBlue",
			"DimGray",
			"DimGrey",
			"DodgerBlue",
			"FireBrick",
			"FloralWhite",
			"ForestGreen",
			"Fuchsia",
			"Gainsboro",
			"GhostWhite",
			"Gold",
			"GoldenRod",
			"Gray",
			"Grey",
			"Green",
			"GreenYellow",
			"HoneyDew",
			"HotPink",
			"IndianRed",
			"Indigo",
			"Ivory",
			"Khaki",
			"Lavender",
			"LavenderBlush",
			"LawnGreen",
			"LemonChiffon",
			"LightBlue",
			"LightCoral",
			"LightCyan",
			"LightGoldenRodYellow",
			"LightGray",
			"LightGrey",
			"LightGreen",
			"LightPink",
			"LightSalmon",
			"LightSeaGreen",
			"LightSkyBlue",
			"LightSlateGray",
			"LightSlateGrey",
			"LightSteelBlue",
			"LightYellow",
			"Lime",
			"LimeGreen",
			"Linen",
			"Magenta",
			"Maroon",
			"MediumAquaMarine",
			"MediumBlue",
			"MediumOrchid",
			"MediumPurple",
			"MediumSeaGreen",
			"MediumSlateBlue",
			"MediumSpringGreen",
			"MediumTurquoise",
			"MediumVioletRed",
			"MidnightBlue",
			"MintCream",
			"MistyRose",
			"Moccasin",
			"NavajoWhite",
			"Navy",
			"OldLace",
			"Olive",
			"OliveDrab",
			"Orange",
			"OrangeRed",
			"Orchid",
			"PaleGoldenRod",
			"PaleGreen",
			"PaleTurquoise",
			"PaleVioletRed",
			"PapayaWhip",
			"PeachPuff",
			"Peru",
			"Pink",
			"Plum",
			"PowderBlue",
			"Purple",
			"RebeccaPurple",
			"Red",
			"RosyBrown",
			"RoyalBlue",
			"SaddleBrown",
			"Salmon",
			"SandyBrown",
			"SeaGreen",
			"SeaShell",
			"Sienna",
			"Silver",
			"SkyBlue",
			"SlateBlue",
			"SlateGray",
			"SlateGrey",
			"Snow",
			"SpringGreen",
			"SteelBlue",
			"Tan",
			"Teal",
			"Thistle",
			"Tomato",
			"Turquoise",
			"Violet",
			"Wheat",
			"White",
			"WhiteSmoke",
			"Yellow",
			"YellowGreen"
		], h = [
			"ffffff",
			"f0f8ff",
			"faebd7",
			"00ffff",
			"7fffd4",
			"f0ffff",
			"f5f5dc",
			"ffe4c4",
			"000000",
			"ffebcd",
			"0000ff",
			"8a2be2",
			"a52a2a",
			"deb887",
			"5f9ea0",
			"7fff00",
			"d2691e",
			"ff7f50",
			"6495ed",
			"fff8dc",
			"dc143c",
			"00ffff",
			"00008b",
			"008b8b",
			"b8860b",
			"a9a9a9",
			"a9a9a9",
			"006400",
			"bdb76b",
			"8b008b",
			"556b2f",
			"ff8c00",
			"9932cc",
			"8b0000",
			"e9967a",
			"8fbc8f",
			"483d8b",
			"2f4f4f",
			"2f4f4f",
			"00ced1",
			"9400d3",
			"ff1493",
			"00bfff",
			"696969",
			"696969",
			"1e90ff",
			"b22222",
			"fffaf0",
			"228b22",
			"ff00ff",
			"dcdcdc",
			"f8f8ff",
			"ffd700",
			"daa520",
			"808080",
			"808080",
			"008000",
			"adff2f",
			"f0fff0",
			"ff69b4",
			"cd5c5c",
			"4b0082",
			"fffff0",
			"f0e68c",
			"e6e6fa",
			"fff0f5",
			"7cfc00",
			"fffacd",
			"add8e6",
			"f08080",
			"e0ffff",
			"fafad2",
			"d3d3d3",
			"d3d3d3",
			"90ee90",
			"ffb6c1",
			"ffa07a",
			"20b2aa",
			"87cefa",
			"778899",
			"778899",
			"b0c4de",
			"ffffe0",
			"00ff00",
			"32cd32",
			"faf0e6",
			"ff00ff",
			"800000",
			"66cdaa",
			"0000cd",
			"ba55d3",
			"9370db",
			"3cb371",
			"7b68ee",
			"00fa9a",
			"48d1cc",
			"c71585",
			"191970",
			"f5fffa",
			"ffe4e1",
			"ffe4b5",
			"ffdead",
			"000080",
			"fdf5e6",
			"808000",
			"6b8e23",
			"ffa500",
			"ff4500",
			"da70d6",
			"eee8aa",
			"98fb98",
			"afeeee",
			"db7093",
			"ffefd5",
			"ffdab9",
			"cd853f",
			"ffc0cb",
			"dda0dd",
			"b0e0e6",
			"800080",
			"663399",
			"ff0000",
			"bc8f8f",
			"4169e1",
			"8b4513",
			"fa8072",
			"f4a460",
			"2e8b57",
			"fff5ee",
			"a0522d",
			"c0c0c0",
			"87ceeb",
			"6a5acd",
			"708090",
			"708090",
			"fffafa",
			"00ff7f",
			"4682b4",
			"d2b48c",
			"008080",
			"d8bfd8",
			"ff6347",
			"40e0d0",
			"ee82ee",
			"f5deb3",
			"ffffff",
			"f5f5f5",
			"ffff00",
			"9acd32"
		], o = a.indexOf(e);
		return o != -1 && (i = h[o]), i;
	}
	function fg(e, i, a, h) {
		var o;
		if (i !== void 0) o = i;
		else {
			var r = c(h.slideContent, [
				"p:sld",
				"p:clrMapOvr",
				"a:overrideClrMapping",
				"attrs"
			]);
			if (r !== void 0) o = r;
			else {
				var r = c(h.slideLayoutContent, [
					"p:sldLayout",
					"p:clrMapOvr",
					"a:overrideClrMapping",
					"attrs"
				]);
				r !== void 0 ? o = r : o = c(h.slideMasterContent, [
					"p:sldMaster",
					"p:clrMap",
					"attrs"
				]);
			}
		}
		var d = e.substr(2);
		if (d == "phClr" && a !== void 0) g = a;
		else {
			if (o !== void 0) switch (d) {
				case "tx1":
				case "tx2":
				case "bg1":
				case "bg2":
					e = "a:" + o[d];
					break;
			}
			else switch (d) {
				case "tx1":
					e = "a:dk1";
					break;
				case "tx2":
					e = "a:dk2";
					break;
				case "bg1":
					e = "a:lt1";
					break;
				case "bg2":
					e = "a:lt2";
					break;
			}
			var s = c(h.themeContent, [
				"a:theme",
				"a:themeElements",
				"a:clrScheme",
				e
			]), g = c(s, [
				"a:srgbClr",
				"attrs",
				"val"
			]);
			g === void 0 && s !== void 0 && (g = c(s, [
				"a:sysClr",
				"attrs",
				"lastClr"
			]));
		}
		return g;
	}
	function xd(e) {
		var i = new Array();
		if (e === void 0) return i;
		if (e["c:xVal"] !== void 0) {
			var a = new Array();
			yd(e["c:xVal"]["c:numRef"]["c:numCache"]["c:pt"], function(h, o) {
				return a.push(parseFloat(h["c:v"])), "";
			}), i.push(a), a = new Array(), yd(e["c:yVal"]["c:numRef"]["c:numCache"]["c:pt"], function(h, o) {
				return a.push(parseFloat(h["c:v"])), "";
			}), i.push(a);
		} else yd(e, function(h, o) {
			var r = new Array(), d = c(h, [
				"c:tx",
				"c:strRef",
				"c:strCache",
				"c:pt",
				"c:v"
			]) || o, s = {};
			return c(h, [
				"c:cat",
				"c:strRef",
				"c:strCache",
				"c:pt"
			]) !== void 0 ? yd(h["c:cat"]["c:strRef"]["c:strCache"]["c:pt"], function(g, f) {
				return s[g.attrs.idx] = g["c:v"], "";
			}) : c(h, [
				"c:cat",
				"c:numRef",
				"c:numCache",
				"c:pt"
			]) !== void 0 && yd(h["c:cat"]["c:numRef"]["c:numCache"]["c:pt"], function(g, f) {
				return s[g.attrs.idx] = g["c:v"], "";
			}), c(h, [
				"c:val",
				"c:numRef",
				"c:numCache",
				"c:pt"
			]) !== void 0 && yd(h["c:val"]["c:numRef"]["c:numCache"]["c:pt"], function(g, f) {
				return r.push({
					x: g.attrs.idx,
					y: parseFloat(g["c:v"])
				}), "";
			}), i.push({
				key: d,
				values: r,
				xlabels: s
			}), "";
		});
		return i;
	}
	function c(e, i) {
		if (i.constructor !== Array) throw Error("Error of path type! path is not array.");
		if (e == null) return;
		let a = i.length;
		for (let h = 0; h < a; h++) if (e = e[i[h]], e == null) return;
		return e;
	}
	function hp(e, i, a) {
		if (i.constructor !== Array) throw Error("Error of path type! path is not array.");
		e !== void 0 && (Object.prototype.set = function(h, o) {
			for (var r = this, d = h.length, s = 0; s < d; s++) {
				var g = h[s];
				r[g] === void 0 && (s == d - 1 ? r[g] = o : r[g] = {}), r = r[g];
			}
			return r;
		}, e.set(i, a));
	}
	function yd(e, i) {
		if (e !== void 0) {
			var a = "";
			if (e.constructor === Array) for (var h = e.length, o = 0; o < h; o++) a += i(e[o], o);
			else a += i(e, 0);
			return a;
		}
	}
	function gp(e, i, a) {
		var h = Ge(e).toHsl();
		i >= 1 && (i = 1);
		var o = Math.min(h.l * i, 1);
		return a ? Ge({
			h: h.h,
			s: h.s,
			l: o,
			a: h.a
		}).toHex8() : Ge({
			h: h.h,
			s: h.s,
			l: o,
			a: h.a
		}).toHex();
	}
	function lp(e, i, a) {
		var h = Ge(e).toHsl();
		i >= 1 && (i = 1);
		var o = h.l * i + (1 - i);
		return a ? Ge({
			h: h.h,
			s: h.s,
			l: o,
			a: h.a
		}).toHex8() : Ge({
			h: h.h,
			s: h.s,
			l: o,
			a: h.a
		}).toHex();
	}
	function fp(e, i, a) {
		var h = Ge(e).toHsl(), o = i + h.l;
		return o >= 1 ? a ? Ge({
			h: h.h,
			s: h.s,
			l: 1,
			a: h.a
		}).toHex8() : Ge({
			h: h.h,
			s: h.s,
			l: 1,
			a: h.a
		}).toHex() : a ? Ge({
			h: h.h,
			s: h.s,
			l: o,
			a: h.a
		}).toHex8() : Ge({
			h: h.h,
			s: h.s,
			l: o,
			a: h.a
		}).toHex();
	}
	function pp(e, i, a) {
		var h = Ge(e).toHsl(), o = h.l * i;
		return o >= 1 && (o = 1), a ? Ge({
			h: h.h,
			s: h.s,
			l: o,
			a: h.a
		}).toHex8() : Ge({
			h: h.h,
			s: h.s,
			l: o,
			a: h.a
		}).toHex();
	}
	function bp(e, i, a) {
		var h = Ge(e).toHsl(), o = h.h * i;
		return o >= 360 && (o = o - 360), a ? Ge({
			h: cocacl_h,
			s: h.s,
			l: h.l,
			a: h.a
		}).toHex8() : Ge({
			h: o,
			s: h.s,
			l: h.l,
			a: h.a
		}).toHex();
	}
	function up(e, i, a) {
		var h = Ge(e).toHsl(), o = h.s * i;
		return o >= 1 && (o = 1), a ? Ge({
			h: h.h,
			s: o,
			l: h.l,
			a: h.a
		}).toHex8() : Ge({
			h: h.h,
			s: o,
			l: h.l,
			a: h.a
		}).toHex();
	}
	function Dd(e) {
		return e == "" || e == null ? 0 : Math.round(e / 6e4);
	}
	function rs(e) {
		var i = "";
		switch (e.toLowerCase()) {
			case "jpg":
			case "jpeg":
				i = "image/jpeg";
				break;
			case "png":
				i = "image/png";
				break;
			case "gif":
				i = "image/gif";
				break;
			case "emf":
				i = "image/x-emf";
				break;
			case "wmf":
				i = "image/x-wmf";
				break;
			case "svg":
				i = "image/svg+xml";
				break;
			case "mp4":
				i = "video/mp4";
				break;
			case "webm":
				i = "video/webm";
				break;
			case "ogg":
				i = "video/ogg";
				break;
			case "avi":
				i = "video/avi";
				break;
			case "mpg":
				i = "video/mpg";
				break;
			case "wmv":
				i = "video/wmv";
				break;
			case "mp3":
				i = "audio/mpeg";
				break;
			case "wav":
				i = "audio/wav";
				break;
			case "tif":
			case "tiff":
				i = "image/tiff";
				break;
		}
		return i;
	}
	function mp(e, i, a, h, o) {
		var r = xp(h - 2), d = "", s = i, g = e, f = "", D = yp(a, s, g), T = D[0], w = D[1], m = D[2], x = D[3], b = r.length, L = b < 20 ? 100 : 1e3;
		d = " gradientUnits=\"userSpaceOnUse\" x1=\"" + T + "%\" y1=\"" + w + "%\" x2=\"" + m + "%\" y2=\"" + x + "%\"", d = "<linearGradient id=\"linGrd_" + o + "\"" + d + `>
`, f += d;
		for (var v = 0; v < b; v++) {
			var p = Ge("#" + h[v]), l = p.getAlpha();
			f += "<stop offset=\"" + Math.round(parseFloat(r[v]) / 100 * L) / L + "\" style=\"stop-color:" + p.toHexString() + "; stop-opacity:" + l + ";\"", f += `/>
`;
		}
		return f += `</linearGradient>
`, f;
	}
	function xp(e) {
		var i = ["0%", "100%"];
		if (e == 0) return i;
		for (var a = e; a--;) {
			var h = 100 - 100 / (e + 1) * (a + 1) + "%";
			i.splice(-1, 0, h);
		}
		return i;
	}
	function yp(e, i, a) {
		var h = parseFloat(a), o = parseFloat(i), r = parseFloat(e), d = 2, s = 2, g = h / 2, f = o / 2, b = 2, L = 2, v = 2, p = 2, D = (r % 360 + 360) % 360, T = (360 - D) * Math.PI / 180, w = Math.tan(T), m = f - w * g;
		D == 0 ? (b = h, L = f, v = 0, p = f) : D < 90 ? (s = h, d = 0) : D == 90 ? (b = g, L = 0, v = g, p = o) : D < 180 ? (s = 0, d = 0) : D == 180 ? (b = 0, L = f, v = h, p = f) : D < 270 ? (s = 0, d = o) : D == 270 ? (b = g, L = o, v = g, p = 0) : (s = h, d = o);
		var x = d + s / w, b = b == 2 ? w * (x - m) / (Math.pow(w, 2) + 1) : b, L = L == 2 ? w * b + m : L, v = v == 2 ? h - b : v, p = p == 2 ? o - L : p;
		return [
			Math.round(v / h * 100 * 100) / 100,
			Math.round(p / o * 100 * 100) / 100,
			Math.round(b / h * 100 * 100) / 100,
			Math.round(L / o * 100 * 100) / 100
		];
	}
	async function Dp(e, i, a, h) {
		let [o, r] = await vp(i);
		var d = e["p:spPr"]["a:blipFill"], s = c(d, ["a:tile", "attrs"]);
		if (s !== void 0 && s.sx !== void 0) var g = parseInt(s.sx) / 1e5 * o, f = parseInt(s.sy) / 1e5 * r;
		let D = e["p:spPr"]["a:blipFill"]["a:blip"];
		var T = c(D, ["a:alphaModFix", "attrs"]), w = "";
		if (T !== void 0 && T.amt !== void 0 && T.amt != "" && (w = "opacity='" + parseInt(T.amt) / 1e5 + "'"), g !== void 0 && g != 0) var m = "<pattern id=\"imgPtrn_" + a + "\" x=\"0\" y=\"0\"  width=\"" + g + "\" height=\"" + f + "\" patternUnits=\"userSpaceOnUse\">";
		else var m = "<pattern id=\"imgPtrn_" + a + "\"  patternContentUnits=\"objectBoundingBox\"  width=\"1\" height=\"1\">";
		var x = c(D, ["a:duotone"]), b = "", L = "";
		if (x !== void 0) {
			var v = [];
			Object.keys(x).forEach(function(p) {
				if (p != "attrs") {
					var l = {};
					l[p] = x[p];
					var M = Ge("#" + ua(l, void 0, void 0, h));
					v.push(M.toRgb());
				}
			}), v.length == 2 && (b = "<filter id=\"svg_image_duotone\"> <feColorMatrix type=\"matrix\" values=\".33 .33 .33 0 0.33 .33 .33 0 0.33 .33 .33 0 00 0 0 1 0\"></feColorMatrix><feComponentTransfer color-interpolation-filters=\"sRGB\"><feFuncR type=\"table\" tableValues=\"" + v[0].r / 255 + " " + v[1].r / 255 + "\"></feFuncR><feFuncG type=\"table\" tableValues=\"" + v[0].g / 255 + " " + v[1].g / 255 + "\"></feFuncG><feFuncB type=\"table\" tableValues=\"" + v[0].b / 255 + " " + v[1].b / 255 + "\"></feFuncB></feComponentTransfer> </filter>"), L = "filter=\"url(#svg_image_duotone)\"", m += b;
		}
		return i = ds(i), g !== void 0 && g != 0 ? m += "<image  xlink:href=\"" + i + "\" x=\"0\" y=\"0\" width=\"" + g + "\" height=\"" + f + "\" " + w + " " + L + "></image>" : m += "<image  xlink:href=\"" + i + "\" preserveAspectRatio=\"none\" width=\"1\" height=\"1\" " + w + " " + L + "></image>", m += "</pattern>", m;
	}
	async function vp(e) {
		try {
			let i = await self.createImageBitmap(Up(e));
			return [i.width, i.height];
		} catch {
			return [1, 1];
		}
	}
	function Up(e) {
		let i = e.split(","), a = i[0].match(/:(.*?);/)[1], h = atob(i[1]), o = h.length, r = new Uint8Array(o);
		for (; o--;) r[o] = h.charCodeAt(o);
		return new Blob([r], { type: a });
	}
	function u1(e) {
		for (var i = "", a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", h = new Uint8Array(e), o = h.byteLength, r = o % 3, d = o - r, s, g, f, D, T, w = 0; w < d; w = w + 3) T = h[w] << 16 | h[w + 1] << 8 | h[w + 2], s = (T & 16515072) >> 18, g = (T & 258048) >> 12, f = (T & 4032) >> 6, D = T & 63, i += a[s] + a[g] + a[f] + a[D];
		return r == 1 ? (T = h[d], s = (T & 252) >> 2, g = (T & 3) << 4, i += a[s] + a[g] + "==") : r == 2 && (T = h[d] << 8 | h[d + 1], s = (T & 64512) >> 10, g = (T & 1008) >> 4, f = (T & 15) << 2, i += a[s] + a[g] + a[f] + "="), i;
	}
	function Lp(e) {
		return /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/.test(e);
	}
	function m1(e) {
		return e.substr((~-e.lastIndexOf(".") >>> 0) + 2);
	}
	function ds(e) {
		var i = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;",
			"'": "&#039;"
		};
		return e.replace(/[&<>"']/g, function(a) {
			return i[a];
		});
	}
	function kp(e, i) {
		e(async ({ type: o, data: r, options: d, IE11: s }) => {
			if (o === "processPPTX") try {
				Yc.settings = d, Yc.processFullTheme = d.themeProcess, Yc.IE11 = s, await h(r);
			} catch (g) {
				console.error("AN ERROR HAPPENED DURING processPPTX", g), i({
					type: "ERROR",
					data: g.toString()
				});
			}
		}, (o) => {
			i(o);
		});
		async function a(o) {
			return o.byteLength < 10 ? console.error("读取pptx文件失败！") : Bf.default.loadAsync(o);
		}
		async function h(o) {
			let r = await a(o), d = /* @__PURE__ */ new Date(), s = (x) => {
				g[x] && f === x && (i(g[f++]), delete g[x], s(f));
			}, g = {}, f = -1;
			r.file("docProps/thumbnail.jpeg") ? i({
				type: "pptx-thumb",
				data: await r.file("docProps/thumbnail.jpeg").async("base64"),
				slide_num: f++
			}) : f = 0;
			let D = await b2(r), T = await u2(r);
			Yc.tableStyles = await Wt(r, "ppt/tableStyles.xml"), console.log("slideSize: ", T), i({
				type: "slideSize",
				data: T,
				slide_num: f++
			});
			let w = D.slides, m = w.length;
			for (let x = 0; x < m; x++) {
				let b = w[x], L = b.includes("/") ? b.lastIndexOf("/") + 1 : 0, v = b.includes(".") ? b.lastIndexOf(".") : b.length, p = b.substring(L, v), l = p && p.includes("slide") ? Number(p.substr(5)) : 1, M = {
					type: "slide",
					data: await m2(r, b, x, T),
					slide_num: l,
					file_name: p
				};
				f === l ? (i(M), s(++f)) : g[l] = M, i({
					type: "progress-update",
					slide_num: m + x + 1,
					data: (x + 1) * 100 / m
				});
			}
			return i({
				type: "globalCSS",
				data: O2()
			}), i({
				type: "ExecutionTime",
				data: /* @__PURE__ */ new Date() - d,
				charts: X0
			}), g;
		}
	}
	kp((e, i) => {
		self.onmessage = (a) => e(a.data), self.onerror = (a) => i(a);
	}, (e) => self.postMessage(e));
})();
