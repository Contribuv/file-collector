(function() {
	var If = Object.create, Oh = Object.defineProperty, Pf = Object.getOwnPropertyDescriptor, zf = Object.getOwnPropertyNames, Rf = Object.getPrototypeOf, Of = Object.prototype.hasOwnProperty, ao = ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (d, t) => (typeof require < "u" ? require : d)[t] }) : e)(function(e) {
		if (typeof require < "u") return require.apply(this, arguments);
		throw Error("Dynamic require of \"" + e + "\" is not supported");
	}), di = (e, d) => () => (d || e((d = { exports: {} }).exports, d), d.exports), jf = (e, d, t, U) => {
		if (d && typeof d == "object" || typeof d == "function") for (let f of zf(d)) !Of.call(e, f) && f !== t && Oh(e, f, {
			get: () => d[f],
			enumerable: !(U = Pf(d, f)) || U.enumerable
		});
		return e;
	}, l1 = (e, d, t) => (t = e != null ? If(Rf(e)) : {}, jf(d || !e || !e.__esModule ? Oh(t, "default", {
		value: e,
		enumerable: !0
	}) : t, e)), Gf = di((e, d) => {
		(function(t) {
			typeof e == "object" && typeof d < "u" ? d.exports = t() : typeof define == "function" && define.amd ? define([], t) : (typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : this).JSZip = t();
		})(function() {
			return (function t(U, f, r) {
				function l(o, v) {
					if (!f[o]) {
						if (!U[o]) {
							var y = typeof ao == "function" && ao;
							if (!v && y) return y(o, !0);
							if (a) return a(o, !0);
							var _ = /* @__PURE__ */ new Error("Cannot find module '" + o + "'");
							throw _.code = "MODULE_NOT_FOUND", _;
						}
						var g = f[o] = { exports: {} };
						U[o][0].call(g.exports, function(p) {
							var m = U[o][1][p];
							return l(m || p);
						}, g, g.exports, t, U, f, r);
					}
					return f[o].exports;
				}
				for (var a = typeof ao == "function" && ao, i = 0; i < r.length; i++) l(r[i]);
				return l;
			})({
				1: [function(t, U, f) {
					"use strict";
					var r = t("./utils"), l = t("./support"), a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
					f.encode = function(i) {
						for (var o, v, y, _, g, p, m, u = [], D = 0, h = i.length, c = h, b = r.getTypeOf(i) !== "string"; D < i.length;) c = h - D, y = b ? (o = i[D++], v = D < h ? i[D++] : 0, D < h ? i[D++] : 0) : (o = i.charCodeAt(D++), v = D < h ? i.charCodeAt(D++) : 0, D < h ? i.charCodeAt(D++) : 0), _ = o >> 2, g = (3 & o) << 4 | v >> 4, p = 1 < c ? (15 & v) << 2 | y >> 6 : 64, m = 2 < c ? 63 & y : 64, u.push(a.charAt(_) + a.charAt(g) + a.charAt(p) + a.charAt(m));
						return u.join("");
					}, f.decode = function(i) {
						var o, v, y, _, g, p, m = 0, u = 0, D = "data:";
						if (i.substr(0, D.length) === D) throw new Error("Invalid base64 input, it looks like a data url.");
						var h, c = 3 * (i = i.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
						if (i.charAt(i.length - 1) === a.charAt(64) && c--, i.charAt(i.length - 2) === a.charAt(64) && c--, c % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
						for (h = l.uint8array ? new Uint8Array(0 | c) : new Array(0 | c); m < i.length;) o = a.indexOf(i.charAt(m++)) << 2 | (_ = a.indexOf(i.charAt(m++))) >> 4, v = (15 & _) << 4 | (g = a.indexOf(i.charAt(m++))) >> 2, y = (3 & g) << 6 | (p = a.indexOf(i.charAt(m++))), h[u++] = o, g !== 64 && (h[u++] = v), p !== 64 && (h[u++] = y);
						return h;
					};
				}, {
					"./support": 30,
					"./utils": 32
				}],
				2: [function(t, U, f) {
					"use strict";
					var r = t("./external"), l = t("./stream/DataWorker"), a = t("./stream/Crc32Probe"), i = t("./stream/DataLengthProbe");
					function o(v, y, _, g, p) {
						this.compressedSize = v, this.uncompressedSize = y, this.crc32 = _, this.compression = g, this.compressedContent = p;
					}
					o.prototype = {
						getContentWorker: function() {
							var v = new l(r.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new i("data_length")), y = this;
							return v.on("end", function() {
								if (this.streamInfo.data_length !== y.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
							}), v;
						},
						getCompressedWorker: function() {
							return new l(r.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
						}
					}, o.createWorkerFrom = function(v, y, _) {
						return v.pipe(new a()).pipe(new i("uncompressedSize")).pipe(y.compressWorker(_)).pipe(new i("compressedSize")).withStreamInfo("compression", y);
					}, U.exports = o;
				}, {
					"./external": 6,
					"./stream/Crc32Probe": 25,
					"./stream/DataLengthProbe": 26,
					"./stream/DataWorker": 27
				}],
				3: [function(t, U, f) {
					"use strict";
					var r = t("./stream/GenericWorker");
					f.STORE = {
						magic: "\0\0",
						compressWorker: function() {
							return new r("STORE compression");
						},
						uncompressWorker: function() {
							return new r("STORE decompression");
						}
					}, f.DEFLATE = t("./flate");
				}, {
					"./flate": 7,
					"./stream/GenericWorker": 28
				}],
				4: [function(t, U, f) {
					"use strict";
					var r = t("./utils"), l = (function() {
						for (var a, i = [], o = 0; o < 256; o++) {
							a = o;
							for (var v = 0; v < 8; v++) a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1;
							i[o] = a;
						}
						return i;
					})();
					U.exports = function(a, i) {
						return a !== void 0 && a.length ? r.getTypeOf(a) !== "string" ? (function(o, v, y, _) {
							var g = l, p = _ + y;
							o ^= -1;
							for (var m = _; m < p; m++) o = o >>> 8 ^ g[255 & (o ^ v[m])];
							return -1 ^ o;
						})(0 | i, a, a.length, 0) : (function(o, v, y, _) {
							var g = l, p = _ + y;
							o ^= -1;
							for (var m = _; m < p; m++) o = o >>> 8 ^ g[255 & (o ^ v.charCodeAt(m))];
							return -1 ^ o;
						})(0 | i, a, a.length, 0) : 0;
					};
				}, { "./utils": 32 }],
				5: [function(t, U, f) {
					"use strict";
					f.base64 = !1, f.binary = !1, f.dir = !1, f.createFolders = !0, f.date = null, f.compression = null, f.compressionOptions = null, f.comment = null, f.unixPermissions = null, f.dosPermissions = null;
				}, {}],
				6: [function(t, U, f) {
					"use strict";
					var r = null;
					r = typeof Promise < "u" ? Promise : t("lie"), U.exports = { Promise: r };
				}, { lie: 37 }],
				7: [function(t, U, f) {
					"use strict";
					var r = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Uint32Array < "u", l = t("pako"), a = t("./utils"), i = t("./stream/GenericWorker"), o = r ? "uint8array" : "array";
					function v(y, _) {
						i.call(this, "FlateWorker/" + y), this._pako = null, this._pakoAction = y, this._pakoOptions = _, this.meta = {};
					}
					f.magic = "\b\0", a.inherits(v, i), v.prototype.processChunk = function(y) {
						this.meta = y.meta, this._pako === null && this._createPako(), this._pako.push(a.transformTo(o, y.data), !1);
					}, v.prototype.flush = function() {
						i.prototype.flush.call(this), this._pako === null && this._createPako(), this._pako.push([], !0);
					}, v.prototype.cleanUp = function() {
						i.prototype.cleanUp.call(this), this._pako = null;
					}, v.prototype._createPako = function() {
						this._pako = new l[this._pakoAction]({
							raw: !0,
							level: this._pakoOptions.level || -1
						});
						var y = this;
						this._pako.onData = function(_) {
							y.push({
								data: _,
								meta: y.meta
							});
						};
					}, f.compressWorker = function(y) {
						return new v("Deflate", y);
					}, f.uncompressWorker = function() {
						return new v("Inflate", {});
					};
				}, {
					"./stream/GenericWorker": 28,
					"./utils": 32,
					pako: 38
				}],
				8: [function(t, U, f) {
					"use strict";
					function r(g, p) {
						var m, u = "";
						for (m = 0; m < p; m++) u += String.fromCharCode(255 & g), g >>>= 8;
						return u;
					}
					function l(g, p, m, u, D, h) {
						var c, b, L = g.file, S = g.compression, R = h !== o.utf8encode, P = a.transformTo("string", h(L.name)), M = a.transformTo("string", o.utf8encode(L.name)), ee = L.comment, V = a.transformTo("string", h(ee)), F = a.transformTo("string", o.utf8encode(ee)), K = M.length !== L.name.length, k = F.length !== ee.length, Q = "", J = "", n = "", s = L.dir, ie = L.date, ce = {
							crc32: 0,
							compressedSize: 0,
							uncompressedSize: 0
						};
						p && !m || (ce.crc32 = g.crc32, ce.compressedSize = g.compressedSize, ce.uncompressedSize = g.uncompressedSize);
						var I = 0;
						p && (I |= 8), R || !K && !k || (I |= 2048);
						var C = 0, Y = 0;
						s && (C |= 16), D === "UNIX" ? (Y = 798, C |= (function(_e, Ye) {
							var Je = _e;
							return _e || (Je = Ye ? 16893 : 33204), (65535 & Je) << 16;
						})(L.unixPermissions, s)) : (Y = 20, C |= (function(_e) {
							return 63 & (_e || 0);
						})(L.dosPermissions)), c = ie.getUTCHours(), c <<= 6, c |= ie.getUTCMinutes(), c <<= 5, c |= ie.getUTCSeconds() / 2, b = ie.getUTCFullYear() - 1980, b <<= 4, b |= ie.getUTCMonth() + 1, b <<= 5, b |= ie.getUTCDate(), K && (J = r(1, 1) + r(v(P), 4) + M, Q += "up" + r(J.length, 2) + J), k && (n = r(1, 1) + r(v(V), 4) + F, Q += "uc" + r(n.length, 2) + n);
						var ve = "";
						return ve += `
\0`, ve += r(I, 2), ve += S.magic, ve += r(c, 2), ve += r(b, 2), ve += r(ce.crc32, 4), ve += r(ce.compressedSize, 4), ve += r(ce.uncompressedSize, 4), ve += r(P.length, 2), ve += r(Q.length, 2), {
							fileRecord: y.LOCAL_FILE_HEADER + ve + P + Q,
							dirRecord: y.CENTRAL_FILE_HEADER + r(Y, 2) + ve + r(V.length, 2) + "\0\0\0\0" + r(C, 4) + r(u, 4) + P + Q + V
						};
					}
					var a = t("../utils"), i = t("../stream/GenericWorker"), o = t("../utf8"), v = t("../crc32"), y = t("../signature");
					function _(g, p, m, u) {
						i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = p, this.zipPlatform = m, this.encodeFileName = u, this.streamFiles = g, this.accumulate = !1, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
					}
					a.inherits(_, i), _.prototype.push = function(g) {
						var p = g.meta.percent || 0, m = this.entriesCount, u = this._sources.length;
						this.accumulate ? this.contentBuffer.push(g) : (this.bytesWritten += g.data.length, i.prototype.push.call(this, {
							data: g.data,
							meta: {
								currentFile: this.currentFile,
								percent: m ? (p + 100 * (m - u - 1)) / m : 100
							}
						}));
					}, _.prototype.openedSource = function(g) {
						this.currentSourceOffset = this.bytesWritten, this.currentFile = g.file.name;
						var p = this.streamFiles && !g.file.dir;
						if (p) {
							var m = l(g, p, !1, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
							this.push({
								data: m.fileRecord,
								meta: { percent: 0 }
							});
						} else this.accumulate = !0;
					}, _.prototype.closedSource = function(g) {
						this.accumulate = !1;
						var p = this.streamFiles && !g.file.dir, m = l(g, p, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
						if (this.dirRecords.push(m.dirRecord), p) this.push({
							data: (function(u) {
								return y.DATA_DESCRIPTOR + r(u.crc32, 4) + r(u.compressedSize, 4) + r(u.uncompressedSize, 4);
							})(g),
							meta: { percent: 100 }
						});
						else for (this.push({
							data: m.fileRecord,
							meta: { percent: 0 }
						}); this.contentBuffer.length;) this.push(this.contentBuffer.shift());
						this.currentFile = null;
					}, _.prototype.flush = function() {
						for (var g = this.bytesWritten, p = 0; p < this.dirRecords.length; p++) this.push({
							data: this.dirRecords[p],
							meta: { percent: 100 }
						});
						var m = this.bytesWritten - g, u = (function(D, h, c, b, L) {
							var S = a.transformTo("string", L(b));
							return y.CENTRAL_DIRECTORY_END + "\0\0\0\0" + r(D, 2) + r(D, 2) + r(h, 4) + r(c, 4) + r(S.length, 2) + S;
						})(this.dirRecords.length, m, g, this.zipComment, this.encodeFileName);
						this.push({
							data: u,
							meta: { percent: 100 }
						});
					}, _.prototype.prepareNextSource = function() {
						this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
					}, _.prototype.registerPrevious = function(g) {
						this._sources.push(g);
						var p = this;
						return g.on("data", function(m) {
							p.processChunk(m);
						}), g.on("end", function() {
							p.closedSource(p.previous.streamInfo), p._sources.length ? p.prepareNextSource() : p.end();
						}), g.on("error", function(m) {
							p.error(m);
						}), this;
					}, _.prototype.resume = function() {
						return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), !0) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), !0));
					}, _.prototype.error = function(g) {
						var p = this._sources;
						if (!i.prototype.error.call(this, g)) return !1;
						for (var m = 0; m < p.length; m++) try {
							p[m].error(g);
						} catch {}
						return !0;
					}, _.prototype.lock = function() {
						i.prototype.lock.call(this);
						for (var g = this._sources, p = 0; p < g.length; p++) g[p].lock();
					}, U.exports = _;
				}, {
					"../crc32": 4,
					"../signature": 23,
					"../stream/GenericWorker": 28,
					"../utf8": 31,
					"../utils": 32
				}],
				9: [function(t, U, f) {
					"use strict";
					var r = t("../compressions"), l = t("./ZipFileWorker");
					f.generateWorker = function(a, i, o) {
						var v = new l(i.streamFiles, o, i.platform, i.encodeFileName), y = 0;
						try {
							a.forEach(function(_, g) {
								y++;
								var p = (function(h, c) {
									var b = h || c, L = r[b];
									if (!L) throw new Error(b + " is not a valid compression method !");
									return L;
								})(g.options.compression, i.compression), m = g.options.compressionOptions || i.compressionOptions || {}, u = g.dir, D = g.date;
								g._compressWorker(p, m).withStreamInfo("file", {
									name: _,
									dir: u,
									date: D,
									comment: g.comment || "",
									unixPermissions: g.unixPermissions,
									dosPermissions: g.dosPermissions
								}).pipe(v);
							}), v.entriesCount = y;
						} catch (_) {
							v.error(_);
						}
						return v;
					};
				}, {
					"../compressions": 3,
					"./ZipFileWorker": 8
				}],
				10: [function(t, U, f) {
					"use strict";
					function r() {
						if (!(this instanceof r)) return new r();
						if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
						this.files = Object.create(null), this.comment = null, this.root = "", this.clone = function() {
							var l = new r();
							for (var a in this) typeof this[a] != "function" && (l[a] = this[a]);
							return l;
						};
					}
					(r.prototype = t("./object")).loadAsync = t("./load"), r.support = t("./support"), r.defaults = t("./defaults"), r.version = "3.10.1", r.loadAsync = function(l, a) {
						return new r().loadAsync(l, a);
					}, r.external = t("./external"), U.exports = r;
				}, {
					"./defaults": 5,
					"./external": 6,
					"./load": 11,
					"./object": 15,
					"./support": 30
				}],
				11: [function(t, U, f) {
					"use strict";
					var r = t("./utils"), l = t("./external"), a = t("./utf8"), i = t("./zipEntries"), o = t("./stream/Crc32Probe"), v = t("./nodejsUtils");
					function y(_) {
						return new l.Promise(function(g, p) {
							var m = _.decompressed.getContentWorker().pipe(new o());
							m.on("error", function(u) {
								p(u);
							}).on("end", function() {
								m.streamInfo.crc32 !== _.decompressed.crc32 ? p(/* @__PURE__ */ new Error("Corrupted zip : CRC32 mismatch")) : g();
							}).resume();
						});
					}
					U.exports = function(_, g) {
						var p = this;
						return g = r.extend(g || {}, {
							base64: !1,
							checkCRC32: !1,
							optimizedBinaryString: !1,
							createFolders: !1,
							decodeFileName: a.utf8decode
						}), v.isNode && v.isStream(_) ? l.Promise.reject(/* @__PURE__ */ new Error("JSZip can't accept a stream when loading a zip file.")) : r.prepareContent("the loaded zip file", _, !0, g.optimizedBinaryString, g.base64).then(function(m) {
							var u = new i(g);
							return u.load(m), u;
						}).then(function(m) {
							var u = [l.Promise.resolve(m)], D = m.files;
							if (g.checkCRC32) for (var h = 0; h < D.length; h++) u.push(y(D[h]));
							return l.Promise.all(u);
						}).then(function(m) {
							for (var u = m.shift(), D = u.files, h = 0; h < D.length; h++) {
								var c = D[h], b = c.fileNameStr, L = r.resolve(c.fileNameStr);
								p.file(L, c.decompressed, {
									binary: !0,
									optimizedBinaryString: !0,
									date: c.date,
									dir: c.dir,
									comment: c.fileCommentStr.length ? c.fileCommentStr : null,
									unixPermissions: c.unixPermissions,
									dosPermissions: c.dosPermissions,
									createFolders: g.createFolders
								}), c.dir || (p.file(L).unsafeOriginalName = b);
							}
							return u.zipComment.length && (p.comment = u.zipComment), p;
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
				12: [function(t, U, f) {
					"use strict";
					var r = t("../utils"), l = t("../stream/GenericWorker");
					function a(i, o) {
						l.call(this, "Nodejs stream input adapter for " + i), this._upstreamEnded = !1, this._bindStream(o);
					}
					r.inherits(a, l), a.prototype._bindStream = function(i) {
						var o = this;
						(this._stream = i).pause(), i.on("data", function(v) {
							o.push({
								data: v,
								meta: { percent: 0 }
							});
						}).on("error", function(v) {
							o.isPaused ? this.generatedError = v : o.error(v);
						}).on("end", function() {
							o.isPaused ? o._upstreamEnded = !0 : o.end();
						});
					}, a.prototype.pause = function() {
						return !!l.prototype.pause.call(this) && (this._stream.pause(), !0);
					}, a.prototype.resume = function() {
						return !!l.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), !0);
					}, U.exports = a;
				}, {
					"../stream/GenericWorker": 28,
					"../utils": 32
				}],
				13: [function(t, U, f) {
					"use strict";
					var r = t("readable-stream").Readable;
					function l(a, i, o) {
						r.call(this, i), this._helper = a;
						var v = this;
						a.on("data", function(y, _) {
							v.push(y) || v._helper.pause(), o && o(_);
						}).on("error", function(y) {
							v.emit("error", y);
						}).on("end", function() {
							v.push(null);
						});
					}
					t("../utils").inherits(l, r), l.prototype._read = function() {
						this._helper.resume();
					}, U.exports = l;
				}, {
					"../utils": 32,
					"readable-stream": 16
				}],
				14: [function(t, U, f) {
					"use strict";
					U.exports = {
						isNode: typeof Buffer < "u",
						newBufferFrom: function(r, l) {
							if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(r, l);
							if (typeof r == "number") throw new Error("The \"data\" argument must not be a number");
							return new Buffer(r, l);
						},
						allocBuffer: function(r) {
							if (Buffer.alloc) return Buffer.alloc(r);
							var l = new Buffer(r);
							return l.fill(0), l;
						},
						isBuffer: function(r) {
							return Buffer.isBuffer(r);
						},
						isStream: function(r) {
							return r && typeof r.on == "function" && typeof r.pause == "function" && typeof r.resume == "function";
						}
					};
				}, {}],
				15: [function(t, U, f) {
					"use strict";
					function r(b, L, S) {
						var R, P = a.getTypeOf(L), M = a.extend(S || {}, v);
						M.date = M.date || /* @__PURE__ */ new Date(), M.compression !== null && (M.compression = M.compression.toUpperCase()), typeof M.unixPermissions == "string" && (M.unixPermissions = parseInt(M.unixPermissions, 8)), M.unixPermissions && 16384 & M.unixPermissions && (M.dir = !0), M.dosPermissions && 16 & M.dosPermissions && (M.dir = !0), M.dir && (b = D(b)), M.createFolders && (R = u(b)) && h.call(this, R, !0);
						var ee = P === "string" && M.binary === !1 && M.base64 === !1;
						S && S.binary !== void 0 || (M.binary = !ee), (L instanceof y && L.uncompressedSize === 0 || M.dir || !L || L.length === 0) && (M.base64 = !1, M.binary = !0, L = "", M.compression = "STORE", P = "string");
						var V = null;
						V = L instanceof y || L instanceof i ? L : p.isNode && p.isStream(L) ? new m(b, L) : a.prepareContent(b, L, M.binary, M.optimizedBinaryString, M.base64);
						var F = new _(b, V, M);
						this.files[b] = F;
					}
					var l = t("./utf8"), a = t("./utils"), i = t("./stream/GenericWorker"), o = t("./stream/StreamHelper"), v = t("./defaults"), y = t("./compressedObject"), _ = t("./zipObject"), g = t("./generate"), p = t("./nodejsUtils"), m = t("./nodejs/NodejsStreamInputAdapter"), u = function(b) {
						b.slice(-1) === "/" && (b = b.substring(0, b.length - 1));
						var L = b.lastIndexOf("/");
						return 0 < L ? b.substring(0, L) : "";
					}, D = function(b) {
						return b.slice(-1) !== "/" && (b += "/"), b;
					}, h = function(b, L) {
						return L = L !== void 0 ? L : v.createFolders, b = D(b), this.files[b] || r.call(this, b, null, {
							dir: !0,
							createFolders: L
						}), this.files[b];
					};
					function c(b) {
						return Object.prototype.toString.call(b) === "[object RegExp]";
					}
					U.exports = {
						load: function() {
							throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
						},
						forEach: function(b) {
							var L, S, R;
							for (L in this.files) R = this.files[L], (S = L.slice(this.root.length, L.length)) && L.slice(0, this.root.length) === this.root && b(S, R);
						},
						filter: function(b) {
							var L = [];
							return this.forEach(function(S, R) {
								b(S, R) && L.push(R);
							}), L;
						},
						file: function(b, L, S) {
							if (arguments.length !== 1) return b = this.root + b, r.call(this, b, L, S), this;
							if (c(b)) {
								var R = b;
								return this.filter(function(M, ee) {
									return !ee.dir && R.test(M);
								});
							}
							var P = this.files[this.root + b];
							return P && !P.dir ? P : null;
						},
						folder: function(b) {
							if (!b) return this;
							if (c(b)) return this.filter(function(P, M) {
								return M.dir && b.test(P);
							});
							var L = this.root + b, S = h.call(this, L), R = this.clone();
							return R.root = S.name, R;
						},
						remove: function(b) {
							b = this.root + b;
							var L = this.files[b];
							if (L || (b.slice(-1) !== "/" && (b += "/"), L = this.files[b]), L && !L.dir) delete this.files[b];
							else for (var S = this.filter(function(P, M) {
								return M.name.slice(0, b.length) === b;
							}), R = 0; R < S.length; R++) delete this.files[S[R].name];
							return this;
						},
						generate: function() {
							throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
						},
						generateInternalStream: function(b) {
							var L, S = {};
							try {
								if ((S = a.extend(b || {}, {
									streamFiles: !1,
									compression: "STORE",
									compressionOptions: null,
									type: "",
									platform: "DOS",
									comment: null,
									mimeType: "application/zip",
									encodeFileName: l.utf8encode
								})).type = S.type.toLowerCase(), S.compression = S.compression.toUpperCase(), S.type === "binarystring" && (S.type = "string"), !S.type) throw new Error("No output type specified.");
								a.checkSupport(S.type), S.platform !== "darwin" && S.platform !== "freebsd" && S.platform !== "linux" && S.platform !== "sunos" || (S.platform = "UNIX"), S.platform === "win32" && (S.platform = "DOS");
								var R = S.comment || this.comment || "";
								L = g.generateWorker(this, S, R);
							} catch (P) {
								(L = new i("error")).error(P);
							}
							return new o(L, S.type || "string", S.mimeType);
						},
						generateAsync: function(b, L) {
							return this.generateInternalStream(b).accumulate(L);
						},
						generateNodeStream: function(b, L) {
							return (b = b || {}).type || (b.type = "nodebuffer"), this.generateInternalStream(b).toNodejsStream(L);
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
				16: [function(t, U, f) {
					"use strict";
					U.exports = t("stream");
				}, { stream: void 0 }],
				17: [function(t, U, f) {
					"use strict";
					var r = t("./DataReader");
					function l(a) {
						r.call(this, a);
						for (var i = 0; i < this.data.length; i++) a[i] = 255 & a[i];
					}
					t("../utils").inherits(l, r), l.prototype.byteAt = function(a) {
						return this.data[this.zero + a];
					}, l.prototype.lastIndexOfSignature = function(a) {
						for (var i = a.charCodeAt(0), o = a.charCodeAt(1), v = a.charCodeAt(2), y = a.charCodeAt(3), _ = this.length - 4; 0 <= _; --_) if (this.data[_] === i && this.data[_ + 1] === o && this.data[_ + 2] === v && this.data[_ + 3] === y) return _ - this.zero;
						return -1;
					}, l.prototype.readAndCheckSignature = function(a) {
						var i = a.charCodeAt(0), o = a.charCodeAt(1), v = a.charCodeAt(2), y = a.charCodeAt(3), _ = this.readData(4);
						return i === _[0] && o === _[1] && v === _[2] && y === _[3];
					}, l.prototype.readData = function(a) {
						if (this.checkOffset(a), a === 0) return [];
						var i = this.data.slice(this.zero + this.index, this.zero + this.index + a);
						return this.index += a, i;
					}, U.exports = l;
				}, {
					"../utils": 32,
					"./DataReader": 18
				}],
				18: [function(t, U, f) {
					"use strict";
					var r = t("../utils");
					function l(a) {
						this.data = a, this.length = a.length, this.index = 0, this.zero = 0;
					}
					l.prototype = {
						checkOffset: function(a) {
							this.checkIndex(this.index + a);
						},
						checkIndex: function(a) {
							if (this.length < this.zero + a || a < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + a + "). Corrupted zip ?");
						},
						setIndex: function(a) {
							this.checkIndex(a), this.index = a;
						},
						skip: function(a) {
							this.setIndex(this.index + a);
						},
						byteAt: function() {},
						readInt: function(a) {
							var i, o = 0;
							for (this.checkOffset(a), i = this.index + a - 1; i >= this.index; i--) o = (o << 8) + this.byteAt(i);
							return this.index += a, o;
						},
						readString: function(a) {
							return r.transformTo("string", this.readData(a));
						},
						readData: function() {},
						lastIndexOfSignature: function() {},
						readAndCheckSignature: function() {},
						readDate: function() {
							var a = this.readInt(4);
							return new Date(Date.UTC(1980 + (a >> 25 & 127), (a >> 21 & 15) - 1, a >> 16 & 31, a >> 11 & 31, a >> 5 & 63, (31 & a) << 1));
						}
					}, U.exports = l;
				}, { "../utils": 32 }],
				19: [function(t, U, f) {
					"use strict";
					var r = t("./Uint8ArrayReader");
					function l(a) {
						r.call(this, a);
					}
					t("../utils").inherits(l, r), l.prototype.readData = function(a) {
						this.checkOffset(a);
						var i = this.data.slice(this.zero + this.index, this.zero + this.index + a);
						return this.index += a, i;
					}, U.exports = l;
				}, {
					"../utils": 32,
					"./Uint8ArrayReader": 21
				}],
				20: [function(t, U, f) {
					"use strict";
					var r = t("./DataReader");
					function l(a) {
						r.call(this, a);
					}
					t("../utils").inherits(l, r), l.prototype.byteAt = function(a) {
						return this.data.charCodeAt(this.zero + a);
					}, l.prototype.lastIndexOfSignature = function(a) {
						return this.data.lastIndexOf(a) - this.zero;
					}, l.prototype.readAndCheckSignature = function(a) {
						return a === this.readData(4);
					}, l.prototype.readData = function(a) {
						this.checkOffset(a);
						var i = this.data.slice(this.zero + this.index, this.zero + this.index + a);
						return this.index += a, i;
					}, U.exports = l;
				}, {
					"../utils": 32,
					"./DataReader": 18
				}],
				21: [function(t, U, f) {
					"use strict";
					var r = t("./ArrayReader");
					function l(a) {
						r.call(this, a);
					}
					t("../utils").inherits(l, r), l.prototype.readData = function(a) {
						if (this.checkOffset(a), a === 0) return new Uint8Array(0);
						var i = this.data.subarray(this.zero + this.index, this.zero + this.index + a);
						return this.index += a, i;
					}, U.exports = l;
				}, {
					"../utils": 32,
					"./ArrayReader": 17
				}],
				22: [function(t, U, f) {
					"use strict";
					var r = t("../utils"), l = t("../support"), a = t("./ArrayReader"), i = t("./StringReader"), o = t("./NodeBufferReader"), v = t("./Uint8ArrayReader");
					U.exports = function(y) {
						var _ = r.getTypeOf(y);
						return r.checkSupport(_), _ !== "string" || l.uint8array ? _ === "nodebuffer" ? new o(y) : l.uint8array ? new v(r.transformTo("uint8array", y)) : new a(r.transformTo("array", y)) : new i(y);
					};
				}, {
					"../support": 30,
					"../utils": 32,
					"./ArrayReader": 17,
					"./NodeBufferReader": 19,
					"./StringReader": 20,
					"./Uint8ArrayReader": 21
				}],
				23: [function(t, U, f) {
					"use strict";
					f.LOCAL_FILE_HEADER = "PK", f.CENTRAL_FILE_HEADER = "PK", f.CENTRAL_DIRECTORY_END = "PK", f.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", f.ZIP64_CENTRAL_DIRECTORY_END = "PK", f.DATA_DESCRIPTOR = "PK\x07\b";
				}, {}],
				24: [function(t, U, f) {
					"use strict";
					var r = t("./GenericWorker"), l = t("../utils");
					function a(i) {
						r.call(this, "ConvertWorker to " + i), this.destType = i;
					}
					l.inherits(a, r), a.prototype.processChunk = function(i) {
						this.push({
							data: l.transformTo(this.destType, i.data),
							meta: i.meta
						});
					}, U.exports = a;
				}, {
					"../utils": 32,
					"./GenericWorker": 28
				}],
				25: [function(t, U, f) {
					"use strict";
					var r = t("./GenericWorker"), l = t("../crc32");
					function a() {
						r.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
					}
					t("../utils").inherits(a, r), a.prototype.processChunk = function(i) {
						this.streamInfo.crc32 = l(i.data, this.streamInfo.crc32 || 0), this.push(i);
					}, U.exports = a;
				}, {
					"../crc32": 4,
					"../utils": 32,
					"./GenericWorker": 28
				}],
				26: [function(t, U, f) {
					"use strict";
					var r = t("../utils"), l = t("./GenericWorker");
					function a(i) {
						l.call(this, "DataLengthProbe for " + i), this.propName = i, this.withStreamInfo(i, 0);
					}
					r.inherits(a, l), a.prototype.processChunk = function(i) {
						if (i) {
							var o = this.streamInfo[this.propName] || 0;
							this.streamInfo[this.propName] = o + i.data.length;
						}
						l.prototype.processChunk.call(this, i);
					}, U.exports = a;
				}, {
					"../utils": 32,
					"./GenericWorker": 28
				}],
				27: [function(t, U, f) {
					"use strict";
					var r = t("../utils"), l = t("./GenericWorker");
					function a(i) {
						l.call(this, "DataWorker");
						var o = this;
						this.dataIsReady = !1, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = !1, i.then(function(v) {
							o.dataIsReady = !0, o.data = v, o.max = v && v.length || 0, o.type = r.getTypeOf(v), o.isPaused || o._tickAndRepeat();
						}, function(v) {
							o.error(v);
						});
					}
					r.inherits(a, l), a.prototype.cleanUp = function() {
						l.prototype.cleanUp.call(this), this.data = null;
					}, a.prototype.resume = function() {
						return !!l.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = !0, r.delay(this._tickAndRepeat, [], this)), !0);
					}, a.prototype._tickAndRepeat = function() {
						this._tickScheduled = !1, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (r.delay(this._tickAndRepeat, [], this), this._tickScheduled = !0));
					}, a.prototype._tick = function() {
						if (this.isPaused || this.isFinished) return !1;
						var i = null, o = Math.min(this.max, this.index + 16384);
						if (this.index >= this.max) return this.end();
						switch (this.type) {
							case "string":
								i = this.data.substring(this.index, o);
								break;
							case "uint8array":
								i = this.data.subarray(this.index, o);
								break;
							case "array":
							case "nodebuffer": i = this.data.slice(this.index, o);
						}
						return this.index = o, this.push({
							data: i,
							meta: { percent: this.max ? this.index / this.max * 100 : 0 }
						});
					}, U.exports = a;
				}, {
					"../utils": 32,
					"./GenericWorker": 28
				}],
				28: [function(t, U, f) {
					"use strict";
					function r(l) {
						this.name = l || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = !0, this.isFinished = !1, this.isLocked = !1, this._listeners = {
							data: [],
							end: [],
							error: []
						}, this.previous = null;
					}
					r.prototype = {
						push: function(l) {
							this.emit("data", l);
						},
						end: function() {
							if (this.isFinished) return !1;
							this.flush();
							try {
								this.emit("end"), this.cleanUp(), this.isFinished = !0;
							} catch (l) {
								this.emit("error", l);
							}
							return !0;
						},
						error: function(l) {
							return !this.isFinished && (this.isPaused ? this.generatedError = l : (this.isFinished = !0, this.emit("error", l), this.previous && this.previous.error(l), this.cleanUp()), !0);
						},
						on: function(l, a) {
							return this._listeners[l].push(a), this;
						},
						cleanUp: function() {
							this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
						},
						emit: function(l, a) {
							if (this._listeners[l]) for (var i = 0; i < this._listeners[l].length; i++) this._listeners[l][i].call(this, a);
						},
						pipe: function(l) {
							return l.registerPrevious(this);
						},
						registerPrevious: function(l) {
							if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
							this.streamInfo = l.streamInfo, this.mergeStreamInfo(), this.previous = l;
							var a = this;
							return l.on("data", function(i) {
								a.processChunk(i);
							}), l.on("end", function() {
								a.end();
							}), l.on("error", function(i) {
								a.error(i);
							}), this;
						},
						pause: function() {
							return !this.isPaused && !this.isFinished && (this.isPaused = !0, this.previous && this.previous.pause(), !0);
						},
						resume: function() {
							if (!this.isPaused || this.isFinished) return !1;
							var l = this.isPaused = !1;
							return this.generatedError && (this.error(this.generatedError), l = !0), this.previous && this.previous.resume(), !l;
						},
						flush: function() {},
						processChunk: function(l) {
							this.push(l);
						},
						withStreamInfo: function(l, a) {
							return this.extraStreamInfo[l] = a, this.mergeStreamInfo(), this;
						},
						mergeStreamInfo: function() {
							for (var l in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, l) && (this.streamInfo[l] = this.extraStreamInfo[l]);
						},
						lock: function() {
							if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
							this.isLocked = !0, this.previous && this.previous.lock();
						},
						toString: function() {
							var l = "Worker " + this.name;
							return this.previous ? this.previous + " -> " + l : l;
						}
					}, U.exports = r;
				}, {}],
				29: [function(t, U, f) {
					"use strict";
					var r = t("../utils"), l = t("./ConvertWorker"), a = t("./GenericWorker"), i = t("../base64"), o = t("../support"), v = t("../external"), y = null;
					if (o.nodestream) try {
						y = t("../nodejs/NodejsStreamOutputAdapter");
					} catch {}
					function _(p, m) {
						return new v.Promise(function(u, D) {
							var h = [], c = p._internalType, b = p._outputType, L = p._mimeType;
							p.on("data", function(S, R) {
								h.push(S), m && m(R);
							}).on("error", function(S) {
								h = [], D(S);
							}).on("end", function() {
								try {
									u((function(S, R, P) {
										switch (S) {
											case "blob": return r.newBlob(r.transformTo("arraybuffer", R), P);
											case "base64": return i.encode(R);
											default: return r.transformTo(S, R);
										}
									})(b, (function(S, R) {
										var P, M = 0, ee = null, V = 0;
										for (P = 0; P < R.length; P++) V += R[P].length;
										switch (S) {
											case "string": return R.join("");
											case "array": return Array.prototype.concat.apply([], R);
											case "uint8array":
												for (ee = new Uint8Array(V), P = 0; P < R.length; P++) ee.set(R[P], M), M += R[P].length;
												return ee;
											case "nodebuffer": return Buffer.concat(R);
											default: throw new Error("concat : unsupported type '" + S + "'");
										}
									})(c, h), L));
								} catch (S) {
									D(S);
								}
								h = [];
							}).resume();
						});
					}
					function g(p, m, u) {
						var D = m;
						switch (m) {
							case "blob":
							case "arraybuffer":
								D = "uint8array";
								break;
							case "base64": D = "string";
						}
						try {
							this._internalType = D, this._outputType = m, this._mimeType = u, r.checkSupport(D), this._worker = p.pipe(new l(D)), p.lock();
						} catch (h) {
							this._worker = new a("error"), this._worker.error(h);
						}
					}
					g.prototype = {
						accumulate: function(p) {
							return _(this, p);
						},
						on: function(p, m) {
							var u = this;
							return p === "data" ? this._worker.on(p, function(D) {
								m.call(u, D.data, D.meta);
							}) : this._worker.on(p, function() {
								r.delay(m, arguments, u);
							}), this;
						},
						resume: function() {
							return r.delay(this._worker.resume, [], this._worker), this;
						},
						pause: function() {
							return this._worker.pause(), this;
						},
						toNodejsStream: function(p) {
							if (r.checkSupport("nodestream"), this._outputType !== "nodebuffer") throw new Error(this._outputType + " is not supported by this method");
							return new y(this, { objectMode: this._outputType !== "nodebuffer" }, p);
						}
					}, U.exports = g;
				}, {
					"../base64": 1,
					"../external": 6,
					"../nodejs/NodejsStreamOutputAdapter": 13,
					"../support": 30,
					"../utils": 32,
					"./ConvertWorker": 24,
					"./GenericWorker": 28
				}],
				30: [function(t, U, f) {
					"use strict";
					if (f.base64 = !0, f.array = !0, f.string = !0, f.arraybuffer = typeof ArrayBuffer < "u" && typeof Uint8Array < "u", f.nodebuffer = typeof Buffer < "u", f.uint8array = typeof Uint8Array < "u", typeof ArrayBuffer > "u") f.blob = !1;
					else {
						var r = /* @__PURE__ */ new ArrayBuffer(0);
						try {
							f.blob = new Blob([r], { type: "application/zip" }).size === 0;
						} catch {
							try {
								var l = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
								l.append(r), f.blob = l.getBlob("application/zip").size === 0;
							} catch {
								f.blob = !1;
							}
						}
					}
					try {
						f.nodestream = !!t("readable-stream").Readable;
					} catch {
						f.nodestream = !1;
					}
				}, { "readable-stream": 16 }],
				31: [function(t, U, f) {
					"use strict";
					for (var r = t("./utils"), l = t("./support"), a = t("./nodejsUtils"), i = t("./stream/GenericWorker"), o = new Array(256), v = 0; v < 256; v++) o[v] = 252 <= v ? 6 : 248 <= v ? 5 : 240 <= v ? 4 : 224 <= v ? 3 : 192 <= v ? 2 : 1;
					o[254] = o[254] = 1;
					function y() {
						i.call(this, "utf-8 decode"), this.leftOver = null;
					}
					function _() {
						i.call(this, "utf-8 encode");
					}
					f.utf8encode = function(g) {
						return l.nodebuffer ? a.newBufferFrom(g, "utf-8") : (function(p) {
							var m, u, D, h, c, b = p.length, L = 0;
							for (h = 0; h < b; h++) (64512 & (u = p.charCodeAt(h))) == 55296 && h + 1 < b && (64512 & (D = p.charCodeAt(h + 1))) == 56320 && (u = 65536 + (u - 55296 << 10) + (D - 56320), h++), L += u < 128 ? 1 : u < 2048 ? 2 : u < 65536 ? 3 : 4;
							for (m = l.uint8array ? new Uint8Array(L) : new Array(L), h = c = 0; c < L; h++) (64512 & (u = p.charCodeAt(h))) == 55296 && h + 1 < b && (64512 & (D = p.charCodeAt(h + 1))) == 56320 && (u = 65536 + (u - 55296 << 10) + (D - 56320), h++), u < 128 ? m[c++] = u : (u < 2048 ? m[c++] = 192 | u >>> 6 : (u < 65536 ? m[c++] = 224 | u >>> 12 : (m[c++] = 240 | u >>> 18, m[c++] = 128 | u >>> 12 & 63), m[c++] = 128 | u >>> 6 & 63), m[c++] = 128 | 63 & u);
							return m;
						})(g);
					}, f.utf8decode = function(g) {
						return l.nodebuffer ? r.transformTo("nodebuffer", g).toString("utf-8") : (function(p) {
							var m, u, D, h, c = p.length, b = new Array(2 * c);
							for (m = u = 0; m < c;) if ((D = p[m++]) < 128) b[u++] = D;
							else if (4 < (h = o[D])) b[u++] = 65533, m += h - 1;
							else {
								for (D &= h === 2 ? 31 : h === 3 ? 15 : 7; 1 < h && m < c;) D = D << 6 | 63 & p[m++], h--;
								1 < h ? b[u++] = 65533 : D < 65536 ? b[u++] = D : (D -= 65536, b[u++] = 55296 | D >> 10 & 1023, b[u++] = 56320 | 1023 & D);
							}
							return b.length !== u && (b.subarray ? b = b.subarray(0, u) : b.length = u), r.applyFromCharCode(b);
						})(g = r.transformTo(l.uint8array ? "uint8array" : "array", g));
					}, r.inherits(y, i), y.prototype.processChunk = function(g) {
						var p = r.transformTo(l.uint8array ? "uint8array" : "array", g.data);
						if (this.leftOver && this.leftOver.length) {
							if (l.uint8array) {
								var m = p;
								(p = new Uint8Array(m.length + this.leftOver.length)).set(this.leftOver, 0), p.set(m, this.leftOver.length);
							} else p = this.leftOver.concat(p);
							this.leftOver = null;
						}
						var u = (function(h, c) {
							var b;
							for ((c = c || h.length) > h.length && (c = h.length), b = c - 1; 0 <= b && (192 & h[b]) == 128;) b--;
							return b < 0 || b === 0 ? c : b + o[h[b]] > c ? b : c;
						})(p), D = p;
						u !== p.length && (l.uint8array ? (D = p.subarray(0, u), this.leftOver = p.subarray(u, p.length)) : (D = p.slice(0, u), this.leftOver = p.slice(u, p.length))), this.push({
							data: f.utf8decode(D),
							meta: g.meta
						});
					}, y.prototype.flush = function() {
						this.leftOver && this.leftOver.length && (this.push({
							data: f.utf8decode(this.leftOver),
							meta: {}
						}), this.leftOver = null);
					}, f.Utf8DecodeWorker = y, r.inherits(_, i), _.prototype.processChunk = function(g) {
						this.push({
							data: f.utf8encode(g.data),
							meta: g.meta
						});
					}, f.Utf8EncodeWorker = _;
				}, {
					"./nodejsUtils": 14,
					"./stream/GenericWorker": 28,
					"./support": 30,
					"./utils": 32
				}],
				32: [function(t, U, f) {
					"use strict";
					var r = t("./support"), l = t("./base64"), a = t("./nodejsUtils"), i = t("./external");
					function o(m) {
						return m;
					}
					function v(m, u) {
						for (var D = 0; D < m.length; ++D) u[D] = 255 & m.charCodeAt(D);
						return u;
					}
					t("setimmediate"), f.newBlob = function(m, u) {
						f.checkSupport("blob");
						try {
							return new Blob([m], { type: u });
						} catch {
							try {
								var D = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
								return D.append(m), D.getBlob(u);
							} catch {
								throw new Error("Bug : can't construct the Blob.");
							}
						}
					};
					var y = {
						stringifyByChunk: function(m, u, D) {
							var h = [], c = 0, b = m.length;
							if (b <= D) return String.fromCharCode.apply(null, m);
							for (; c < b;) u === "array" || u === "nodebuffer" ? h.push(String.fromCharCode.apply(null, m.slice(c, Math.min(c + D, b)))) : h.push(String.fromCharCode.apply(null, m.subarray(c, Math.min(c + D, b)))), c += D;
							return h.join("");
						},
						stringifyByChar: function(m) {
							for (var u = "", D = 0; D < m.length; D++) u += String.fromCharCode(m[D]);
							return u;
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
									return r.nodebuffer && String.fromCharCode.apply(null, a.allocBuffer(1)).length === 1;
								} catch {
									return !1;
								}
							})()
						}
					};
					function _(m) {
						var u = 65536, D = f.getTypeOf(m), h = !0;
						if (D === "uint8array" ? h = y.applyCanBeUsed.uint8array : D === "nodebuffer" && (h = y.applyCanBeUsed.nodebuffer), h) for (; 1 < u;) try {
							return y.stringifyByChunk(m, D, u);
						} catch {
							u = Math.floor(u / 2);
						}
						return y.stringifyByChar(m);
					}
					function g(m, u) {
						for (var D = 0; D < m.length; D++) u[D] = m[D];
						return u;
					}
					f.applyFromCharCode = _;
					var p = {};
					p.string = {
						string: o,
						array: function(m) {
							return v(m, new Array(m.length));
						},
						arraybuffer: function(m) {
							return p.string.uint8array(m).buffer;
						},
						uint8array: function(m) {
							return v(m, new Uint8Array(m.length));
						},
						nodebuffer: function(m) {
							return v(m, a.allocBuffer(m.length));
						}
					}, p.array = {
						string: _,
						array: o,
						arraybuffer: function(m) {
							return new Uint8Array(m).buffer;
						},
						uint8array: function(m) {
							return new Uint8Array(m);
						},
						nodebuffer: function(m) {
							return a.newBufferFrom(m);
						}
					}, p.arraybuffer = {
						string: function(m) {
							return _(new Uint8Array(m));
						},
						array: function(m) {
							return g(new Uint8Array(m), new Array(m.byteLength));
						},
						arraybuffer: o,
						uint8array: function(m) {
							return new Uint8Array(m);
						},
						nodebuffer: function(m) {
							return a.newBufferFrom(new Uint8Array(m));
						}
					}, p.uint8array = {
						string: _,
						array: function(m) {
							return g(m, new Array(m.length));
						},
						arraybuffer: function(m) {
							return m.buffer;
						},
						uint8array: o,
						nodebuffer: function(m) {
							return a.newBufferFrom(m);
						}
					}, p.nodebuffer = {
						string: _,
						array: function(m) {
							return g(m, new Array(m.length));
						},
						arraybuffer: function(m) {
							return p.nodebuffer.uint8array(m).buffer;
						},
						uint8array: function(m) {
							return g(m, new Uint8Array(m.length));
						},
						nodebuffer: o
					}, f.transformTo = function(m, u) {
						return u = u || "", m ? (f.checkSupport(m), p[f.getTypeOf(u)][m](u)) : u;
					}, f.resolve = function(m) {
						for (var u = m.split("/"), D = [], h = 0; h < u.length; h++) {
							var c = u[h];
							c === "." || c === "" && h !== 0 && h !== u.length - 1 || (c === ".." ? D.pop() : D.push(c));
						}
						return D.join("/");
					}, f.getTypeOf = function(m) {
						return typeof m == "string" ? "string" : Object.prototype.toString.call(m) === "[object Array]" ? "array" : r.nodebuffer && a.isBuffer(m) ? "nodebuffer" : r.uint8array && m instanceof Uint8Array ? "uint8array" : r.arraybuffer && m instanceof ArrayBuffer ? "arraybuffer" : void 0;
					}, f.checkSupport = function(m) {
						if (!r[m.toLowerCase()]) throw new Error(m + " is not supported by this platform");
					}, f.MAX_VALUE_16BITS = 65535, f.MAX_VALUE_32BITS = -1, f.pretty = function(m) {
						var u, D, h = "";
						for (D = 0; D < (m || "").length; D++) h += "\\x" + ((u = m.charCodeAt(D)) < 16 ? "0" : "") + u.toString(16).toUpperCase();
						return h;
					}, f.delay = function(m, u, D) {
						setImmediate(function() {
							m.apply(D || null, u || []);
						});
					}, f.inherits = function(m, u) {
						function D() {}
						D.prototype = u.prototype, m.prototype = new D();
					}, f.extend = function() {
						var m, u, D = {};
						for (m = 0; m < arguments.length; m++) for (u in arguments[m]) Object.prototype.hasOwnProperty.call(arguments[m], u) && D[u] === void 0 && (D[u] = arguments[m][u]);
						return D;
					}, f.prepareContent = function(m, u, D, h, c) {
						return i.Promise.resolve(u).then(function(b) {
							return r.blob && (b instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(b)) !== -1) && typeof FileReader < "u" ? new i.Promise(function(L, S) {
								var R = new FileReader();
								R.onload = function(P) {
									L(P.target.result);
								}, R.onerror = function(P) {
									S(P.target.error);
								}, R.readAsArrayBuffer(b);
							}) : b;
						}).then(function(b) {
							var L = f.getTypeOf(b);
							return L ? (L === "arraybuffer" ? b = f.transformTo("uint8array", b) : L === "string" && (c ? b = l.decode(b) : D && h !== !0 && (b = (function(S) {
								return v(S, r.uint8array ? new Uint8Array(S.length) : new Array(S.length));
							})(b))), b) : i.Promise.reject(/* @__PURE__ */ new Error("Can't read the data of '" + m + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
						});
					};
				}, {
					"./base64": 1,
					"./external": 6,
					"./nodejsUtils": 14,
					"./support": 30,
					setimmediate: 54
				}],
				33: [function(t, U, f) {
					"use strict";
					var r = t("./reader/readerFor"), l = t("./utils"), a = t("./signature"), i = t("./zipEntry"), o = t("./support");
					function v(y) {
						this.files = [], this.loadOptions = y;
					}
					v.prototype = {
						checkSignature: function(y) {
							if (!this.reader.readAndCheckSignature(y)) {
								this.reader.index -= 4;
								var _ = this.reader.readString(4);
								throw new Error("Corrupted zip or bug: unexpected signature (" + l.pretty(_) + ", expected " + l.pretty(y) + ")");
							}
						},
						isSignature: function(y, _) {
							var g = this.reader.index;
							this.reader.setIndex(y);
							var p = this.reader.readString(4) === _;
							return this.reader.setIndex(g), p;
						},
						readBlockEndOfCentral: function() {
							this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
							var y = this.reader.readData(this.zipCommentLength), _ = o.uint8array ? "uint8array" : "array", g = l.transformTo(_, y);
							this.zipComment = this.loadOptions.decodeFileName(g);
						},
						readBlockZip64EndOfCentral: function() {
							this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
							for (var y, _, g, p = this.zip64EndOfCentralSize - 44; 0 < p;) y = this.reader.readInt(2), _ = this.reader.readInt(4), g = this.reader.readData(_), this.zip64ExtensibleData[y] = {
								id: y,
								length: _,
								value: g
							};
						},
						readBlockZip64EndOfCentralLocator: function() {
							if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
						},
						readLocalFiles: function() {
							var y, _;
							for (y = 0; y < this.files.length; y++) _ = this.files[y], this.reader.setIndex(_.localHeaderOffset), this.checkSignature(a.LOCAL_FILE_HEADER), _.readLocalPart(this.reader), _.handleUTF8(), _.processAttributes();
						},
						readCentralDir: function() {
							var y;
							for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(a.CENTRAL_FILE_HEADER);) (y = new i({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(y);
							if (this.centralDirRecords !== this.files.length && this.centralDirRecords !== 0 && this.files.length === 0) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
						},
						readEndOfCentral: function() {
							var y = this.reader.lastIndexOfSignature(a.CENTRAL_DIRECTORY_END);
							if (y < 0) throw this.isSignature(0, a.LOCAL_FILE_HEADER) ? /* @__PURE__ */ new Error("Corrupted zip: can't find end of central directory") : /* @__PURE__ */ new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
							this.reader.setIndex(y);
							var _ = y;
							if (this.checkSignature(a.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === l.MAX_VALUE_16BITS || this.diskWithCentralDirStart === l.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === l.MAX_VALUE_16BITS || this.centralDirRecords === l.MAX_VALUE_16BITS || this.centralDirSize === l.MAX_VALUE_32BITS || this.centralDirOffset === l.MAX_VALUE_32BITS) {
								if (this.zip64 = !0, (y = this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
								if (this.reader.setIndex(y), this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, a.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
								this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
							}
							var g = this.centralDirOffset + this.centralDirSize;
							this.zip64 && (g += 20, g += 12 + this.zip64EndOfCentralSize);
							var p = _ - g;
							if (0 < p) this.isSignature(_, a.CENTRAL_FILE_HEADER) || (this.reader.zero = p);
							else if (p < 0) throw new Error("Corrupted zip: missing " + Math.abs(p) + " bytes.");
						},
						prepareReader: function(y) {
							this.reader = r(y);
						},
						load: function(y) {
							this.prepareReader(y), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
						}
					}, U.exports = v;
				}, {
					"./reader/readerFor": 22,
					"./signature": 23,
					"./support": 30,
					"./utils": 32,
					"./zipEntry": 34
				}],
				34: [function(t, U, f) {
					"use strict";
					var r = t("./reader/readerFor"), l = t("./utils"), a = t("./compressedObject"), i = t("./crc32"), o = t("./utf8"), v = t("./compressions"), y = t("./support");
					function _(g, p) {
						this.options = g, this.loadOptions = p;
					}
					_.prototype = {
						isEncrypted: function() {
							return (1 & this.bitFlag) == 1;
						},
						useUTF8: function() {
							return (2048 & this.bitFlag) == 2048;
						},
						readLocalPart: function(g) {
							var p, m;
							if (g.skip(22), this.fileNameLength = g.readInt(2), m = g.readInt(2), this.fileName = g.readData(this.fileNameLength), g.skip(m), this.compressedSize === -1 || this.uncompressedSize === -1) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
							if ((p = (function(u) {
								for (var D in v) if (Object.prototype.hasOwnProperty.call(v, D) && v[D].magic === u) return v[D];
								return null;
							})(this.compressionMethod)) === null) throw new Error("Corrupted zip : compression " + l.pretty(this.compressionMethod) + " unknown (inner file : " + l.transformTo("string", this.fileName) + ")");
							this.decompressed = new a(this.compressedSize, this.uncompressedSize, this.crc32, p, g.readData(this.compressedSize));
						},
						readCentralPart: function(g) {
							this.versionMadeBy = g.readInt(2), g.skip(2), this.bitFlag = g.readInt(2), this.compressionMethod = g.readString(2), this.date = g.readDate(), this.crc32 = g.readInt(4), this.compressedSize = g.readInt(4), this.uncompressedSize = g.readInt(4);
							var p = g.readInt(2);
							if (this.extraFieldsLength = g.readInt(2), this.fileCommentLength = g.readInt(2), this.diskNumberStart = g.readInt(2), this.internalFileAttributes = g.readInt(2), this.externalFileAttributes = g.readInt(4), this.localHeaderOffset = g.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
							g.skip(p), this.readExtraFields(g), this.parseZIP64ExtraField(g), this.fileComment = g.readData(this.fileCommentLength);
						},
						processAttributes: function() {
							this.unixPermissions = null, this.dosPermissions = null;
							var g = this.versionMadeBy >> 8;
							this.dir = !!(16 & this.externalFileAttributes), g == 0 && (this.dosPermissions = 63 & this.externalFileAttributes), g == 3 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || this.fileNameStr.slice(-1) !== "/" || (this.dir = !0);
						},
						parseZIP64ExtraField: function() {
							if (this.extraFields[1]) {
								var g = r(this.extraFields[1].value);
								this.uncompressedSize === l.MAX_VALUE_32BITS && (this.uncompressedSize = g.readInt(8)), this.compressedSize === l.MAX_VALUE_32BITS && (this.compressedSize = g.readInt(8)), this.localHeaderOffset === l.MAX_VALUE_32BITS && (this.localHeaderOffset = g.readInt(8)), this.diskNumberStart === l.MAX_VALUE_32BITS && (this.diskNumberStart = g.readInt(4));
							}
						},
						readExtraFields: function(g) {
							var p, m, u, D = g.index + this.extraFieldsLength;
							for (this.extraFields || (this.extraFields = {}); g.index + 4 < D;) p = g.readInt(2), m = g.readInt(2), u = g.readData(m), this.extraFields[p] = {
								id: p,
								length: m,
								value: u
							};
							g.setIndex(D);
						},
						handleUTF8: function() {
							var g = y.uint8array ? "uint8array" : "array";
							if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
							else {
								var p = this.findExtraFieldUnicodePath();
								if (p !== null) this.fileNameStr = p;
								else {
									var m = l.transformTo(g, this.fileName);
									this.fileNameStr = this.loadOptions.decodeFileName(m);
								}
								var u = this.findExtraFieldUnicodeComment();
								if (u !== null) this.fileCommentStr = u;
								else {
									var D = l.transformTo(g, this.fileComment);
									this.fileCommentStr = this.loadOptions.decodeFileName(D);
								}
							}
						},
						findExtraFieldUnicodePath: function() {
							var g = this.extraFields[28789];
							if (g) {
								var p = r(g.value);
								return p.readInt(1) !== 1 || i(this.fileName) !== p.readInt(4) ? null : o.utf8decode(p.readData(g.length - 5));
							}
							return null;
						},
						findExtraFieldUnicodeComment: function() {
							var g = this.extraFields[25461];
							if (g) {
								var p = r(g.value);
								return p.readInt(1) !== 1 || i(this.fileComment) !== p.readInt(4) ? null : o.utf8decode(p.readData(g.length - 5));
							}
							return null;
						}
					}, U.exports = _;
				}, {
					"./compressedObject": 2,
					"./compressions": 3,
					"./crc32": 4,
					"./reader/readerFor": 22,
					"./support": 30,
					"./utf8": 31,
					"./utils": 32
				}],
				35: [function(t, U, f) {
					"use strict";
					function r(p, m, u) {
						this.name = p, this.dir = u.dir, this.date = u.date, this.comment = u.comment, this.unixPermissions = u.unixPermissions, this.dosPermissions = u.dosPermissions, this._data = m, this._dataBinary = u.binary, this.options = {
							compression: u.compression,
							compressionOptions: u.compressionOptions
						};
					}
					var l = t("./stream/StreamHelper"), a = t("./stream/DataWorker"), i = t("./utf8"), o = t("./compressedObject"), v = t("./stream/GenericWorker");
					r.prototype = {
						internalStream: function(p) {
							var m = null, u = "string";
							try {
								if (!p) throw new Error("No output type specified.");
								var D = (u = p.toLowerCase()) === "string" || u === "text";
								u !== "binarystring" && u !== "text" || (u = "string"), m = this._decompressWorker();
								var h = !this._dataBinary;
								h && !D && (m = m.pipe(new i.Utf8EncodeWorker())), !h && D && (m = m.pipe(new i.Utf8DecodeWorker()));
							} catch (c) {
								(m = new v("error")).error(c);
							}
							return new l(m, u, "");
						},
						async: function(p, m) {
							return this.internalStream(p).accumulate(m);
						},
						nodeStream: function(p, m) {
							return this.internalStream(p || "nodebuffer").toNodejsStream(m);
						},
						_compressWorker: function(p, m) {
							if (this._data instanceof o && this._data.compression.magic === p.magic) return this._data.getCompressedWorker();
							var u = this._decompressWorker();
							return this._dataBinary || (u = u.pipe(new i.Utf8EncodeWorker())), o.createWorkerFrom(u, p, m);
						},
						_decompressWorker: function() {
							return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof v ? this._data : new a(this._data);
						}
					};
					for (var y = [
						"asText",
						"asBinary",
						"asNodeBuffer",
						"asUint8Array",
						"asArrayBuffer"
					], _ = function() {
						throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
					}, g = 0; g < y.length; g++) r.prototype[y[g]] = _;
					U.exports = r;
				}, {
					"./compressedObject": 2,
					"./stream/DataWorker": 27,
					"./stream/GenericWorker": 28,
					"./stream/StreamHelper": 29,
					"./utf8": 31
				}],
				36: [function(t, U, f) {
					(function(r) {
						"use strict";
						var l, a, i = r.MutationObserver || r.WebKitMutationObserver;
						if (i) {
							var o = 0, v = new i(p), y = r.document.createTextNode("");
							v.observe(y, { characterData: !0 }), l = function() {
								y.data = o = ++o % 2;
							};
						} else if (r.setImmediate || r.MessageChannel === void 0) l = "document" in r && "onreadystatechange" in r.document.createElement("script") ? function() {
							var m = r.document.createElement("script");
							m.onreadystatechange = function() {
								p(), m.onreadystatechange = null, m.parentNode.removeChild(m), m = null;
							}, r.document.documentElement.appendChild(m);
						} : function() {
							setTimeout(p, 0);
						};
						else {
							var _ = new r.MessageChannel();
							_.port1.onmessage = p, l = function() {
								_.port2.postMessage(0);
							};
						}
						var g = [];
						function p() {
							var m, u;
							a = !0;
							for (var D = g.length; D;) {
								for (u = g, g = [], m = -1; ++m < D;) u[m]();
								D = g.length;
							}
							a = !1;
						}
						U.exports = function(m) {
							g.push(m) !== 1 || a || l();
						};
					}).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
				}, {}],
				37: [function(t, U, f) {
					"use strict";
					var r = t("immediate");
					function l() {}
					var a = {}, i = ["REJECTED"], o = ["FULFILLED"], v = ["PENDING"];
					function y(D) {
						if (typeof D != "function") throw new TypeError("resolver must be a function");
						this.state = v, this.queue = [], this.outcome = void 0, D !== l && m(this, D);
					}
					function _(D, h, c) {
						this.promise = D, typeof h == "function" && (this.onFulfilled = h, this.callFulfilled = this.otherCallFulfilled), typeof c == "function" && (this.onRejected = c, this.callRejected = this.otherCallRejected);
					}
					function g(D, h, c) {
						r(function() {
							var b;
							try {
								b = h(c);
							} catch (L) {
								return a.reject(D, L);
							}
							b === D ? a.reject(D, /* @__PURE__ */ new TypeError("Cannot resolve promise with itself")) : a.resolve(D, b);
						});
					}
					function p(D) {
						var h = D && D.then;
						if (D && (typeof D == "object" || typeof D == "function") && typeof h == "function") return function() {
							h.apply(D, arguments);
						};
					}
					function m(D, h) {
						var c = !1;
						function b(R) {
							c || (c = !0, a.reject(D, R));
						}
						function L(R) {
							c || (c = !0, a.resolve(D, R));
						}
						var S = u(function() {
							h(L, b);
						});
						S.status === "error" && b(S.value);
					}
					function u(D, h) {
						var c = {};
						try {
							c.value = D(h), c.status = "success";
						} catch (b) {
							c.status = "error", c.value = b;
						}
						return c;
					}
					(U.exports = y).prototype.finally = function(D) {
						if (typeof D != "function") return this;
						var h = this.constructor;
						return this.then(function(c) {
							return h.resolve(D()).then(function() {
								return c;
							});
						}, function(c) {
							return h.resolve(D()).then(function() {
								throw c;
							});
						});
					}, y.prototype.catch = function(D) {
						return this.then(null, D);
					}, y.prototype.then = function(D, h) {
						if (typeof D != "function" && this.state === o || typeof h != "function" && this.state === i) return this;
						var c = new this.constructor(l);
						return this.state !== v ? g(c, this.state === o ? D : h, this.outcome) : this.queue.push(new _(c, D, h)), c;
					}, _.prototype.callFulfilled = function(D) {
						a.resolve(this.promise, D);
					}, _.prototype.otherCallFulfilled = function(D) {
						g(this.promise, this.onFulfilled, D);
					}, _.prototype.callRejected = function(D) {
						a.reject(this.promise, D);
					}, _.prototype.otherCallRejected = function(D) {
						g(this.promise, this.onRejected, D);
					}, a.resolve = function(D, h) {
						var c = u(p, h);
						if (c.status === "error") return a.reject(D, c.value);
						var b = c.value;
						if (b) m(D, b);
						else {
							D.state = o, D.outcome = h;
							for (var L = -1, S = D.queue.length; ++L < S;) D.queue[L].callFulfilled(h);
						}
						return D;
					}, a.reject = function(D, h) {
						D.state = i, D.outcome = h;
						for (var c = -1, b = D.queue.length; ++c < b;) D.queue[c].callRejected(h);
						return D;
					}, y.resolve = function(D) {
						return D instanceof this ? D : a.resolve(new this(l), D);
					}, y.reject = function(D) {
						var h = new this(l);
						return a.reject(h, D);
					}, y.all = function(D) {
						var h = this;
						if (Object.prototype.toString.call(D) !== "[object Array]") return this.reject(/* @__PURE__ */ new TypeError("must be an array"));
						var c = D.length, b = !1;
						if (!c) return this.resolve([]);
						for (var L = new Array(c), S = 0, R = -1, P = new this(l); ++R < c;) M(D[R], R);
						return P;
						function M(ee, V) {
							h.resolve(ee).then(function(F) {
								L[V] = F, ++S !== c || b || (b = !0, a.resolve(P, L));
							}, function(F) {
								b || (b = !0, a.reject(P, F));
							});
						}
					}, y.race = function(D) {
						var h = this;
						if (Object.prototype.toString.call(D) !== "[object Array]") return this.reject(/* @__PURE__ */ new TypeError("must be an array"));
						var c = D.length, b = !1;
						if (!c) return this.resolve([]);
						for (var L = -1, S = new this(l); ++L < c;) R = D[L], h.resolve(R).then(function(P) {
							b || (b = !0, a.resolve(S, P));
						}, function(P) {
							b || (b = !0, a.reject(S, P));
						});
						var R;
						return S;
					};
				}, { immediate: 36 }],
				38: [function(t, U, f) {
					"use strict";
					var r = {};
					(0, t("./lib/utils/common").assign)(r, t("./lib/deflate"), t("./lib/inflate"), t("./lib/zlib/constants")), U.exports = r;
				}, {
					"./lib/deflate": 39,
					"./lib/inflate": 40,
					"./lib/utils/common": 41,
					"./lib/zlib/constants": 44
				}],
				39: [function(t, U, f) {
					"use strict";
					var r = t("./zlib/deflate"), l = t("./utils/common"), a = t("./utils/strings"), i = t("./zlib/messages"), o = t("./zlib/zstream"), v = Object.prototype.toString, y = 0, _ = -1, g = 0, p = 8;
					function m(D) {
						if (!(this instanceof m)) return new m(D);
						this.options = l.assign({
							level: _,
							method: p,
							chunkSize: 16384,
							windowBits: 15,
							memLevel: 8,
							strategy: g,
							to: ""
						}, D || {});
						var h = this.options;
						h.raw && 0 < h.windowBits ? h.windowBits = -h.windowBits : h.gzip && 0 < h.windowBits && h.windowBits < 16 && (h.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new o(), this.strm.avail_out = 0;
						var c = r.deflateInit2(this.strm, h.level, h.method, h.windowBits, h.memLevel, h.strategy);
						if (c !== y) throw new Error(i[c]);
						if (h.header && r.deflateSetHeader(this.strm, h.header), h.dictionary) {
							var b;
							if (b = typeof h.dictionary == "string" ? a.string2buf(h.dictionary) : v.call(h.dictionary) === "[object ArrayBuffer]" ? new Uint8Array(h.dictionary) : h.dictionary, (c = r.deflateSetDictionary(this.strm, b)) !== y) throw new Error(i[c]);
							this._dict_set = !0;
						}
					}
					function u(D, h) {
						var c = new m(h);
						if (c.push(D, !0), c.err) throw c.msg || i[c.err];
						return c.result;
					}
					m.prototype.push = function(D, h) {
						var c, b, L = this.strm, S = this.options.chunkSize;
						if (this.ended) return !1;
						b = h === ~~h ? h : h === !0 ? 4 : 0, typeof D == "string" ? L.input = a.string2buf(D) : v.call(D) === "[object ArrayBuffer]" ? L.input = new Uint8Array(D) : L.input = D, L.next_in = 0, L.avail_in = L.input.length;
						do {
							if (L.avail_out === 0 && (L.output = new l.Buf8(S), L.next_out = 0, L.avail_out = S), (c = r.deflate(L, b)) !== 1 && c !== y) return this.onEnd(c), !(this.ended = !0);
							L.avail_out !== 0 && (L.avail_in !== 0 || b !== 4 && b !== 2) || (this.options.to === "string" ? this.onData(a.buf2binstring(l.shrinkBuf(L.output, L.next_out))) : this.onData(l.shrinkBuf(L.output, L.next_out)));
						} while ((0 < L.avail_in || L.avail_out === 0) && c !== 1);
						return b === 4 ? (c = r.deflateEnd(this.strm), this.onEnd(c), this.ended = !0, c === y) : b !== 2 || (this.onEnd(y), !(L.avail_out = 0));
					}, m.prototype.onData = function(D) {
						this.chunks.push(D);
					}, m.prototype.onEnd = function(D) {
						D === y && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = l.flattenChunks(this.chunks)), this.chunks = [], this.err = D, this.msg = this.strm.msg;
					}, f.Deflate = m, f.deflate = u, f.deflateRaw = function(D, h) {
						return (h = h || {}).raw = !0, u(D, h);
					}, f.gzip = function(D, h) {
						return (h = h || {}).gzip = !0, u(D, h);
					};
				}, {
					"./utils/common": 41,
					"./utils/strings": 42,
					"./zlib/deflate": 46,
					"./zlib/messages": 51,
					"./zlib/zstream": 53
				}],
				40: [function(t, U, f) {
					"use strict";
					var r = t("./zlib/inflate"), l = t("./utils/common"), a = t("./utils/strings"), i = t("./zlib/constants"), o = t("./zlib/messages"), v = t("./zlib/zstream"), y = t("./zlib/gzheader"), _ = Object.prototype.toString;
					function g(m) {
						if (!(this instanceof g)) return new g(m);
						this.options = l.assign({
							chunkSize: 16384,
							windowBits: 0,
							to: ""
						}, m || {});
						var u = this.options;
						u.raw && 0 <= u.windowBits && u.windowBits < 16 && (u.windowBits = -u.windowBits, u.windowBits === 0 && (u.windowBits = -15)), !(0 <= u.windowBits && u.windowBits < 16) || m && m.windowBits || (u.windowBits += 32), 15 < u.windowBits && u.windowBits < 48 && !(15 & u.windowBits) && (u.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new v(), this.strm.avail_out = 0;
						var D = r.inflateInit2(this.strm, u.windowBits);
						if (D !== i.Z_OK) throw new Error(o[D]);
						this.header = new y(), r.inflateGetHeader(this.strm, this.header);
					}
					function p(m, u) {
						var D = new g(u);
						if (D.push(m, !0), D.err) throw D.msg || o[D.err];
						return D.result;
					}
					g.prototype.push = function(m, u) {
						var D, h, c, b, L, S, R = this.strm, P = this.options.chunkSize, M = this.options.dictionary, ee = !1;
						if (this.ended) return !1;
						h = u === ~~u ? u : u === !0 ? i.Z_FINISH : i.Z_NO_FLUSH, typeof m == "string" ? R.input = a.binstring2buf(m) : _.call(m) === "[object ArrayBuffer]" ? R.input = new Uint8Array(m) : R.input = m, R.next_in = 0, R.avail_in = R.input.length;
						do {
							if (R.avail_out === 0 && (R.output = new l.Buf8(P), R.next_out = 0, R.avail_out = P), (D = r.inflate(R, i.Z_NO_FLUSH)) === i.Z_NEED_DICT && M && (S = typeof M == "string" ? a.string2buf(M) : _.call(M) === "[object ArrayBuffer]" ? new Uint8Array(M) : M, D = r.inflateSetDictionary(this.strm, S)), D === i.Z_BUF_ERROR && ee === !0 && (D = i.Z_OK, ee = !1), D !== i.Z_STREAM_END && D !== i.Z_OK) return this.onEnd(D), !(this.ended = !0);
							R.next_out && (R.avail_out !== 0 && D !== i.Z_STREAM_END && (R.avail_in !== 0 || h !== i.Z_FINISH && h !== i.Z_SYNC_FLUSH) || (this.options.to === "string" ? (c = a.utf8border(R.output, R.next_out), b = R.next_out - c, L = a.buf2string(R.output, c), R.next_out = b, R.avail_out = P - b, b && l.arraySet(R.output, R.output, c, b, 0), this.onData(L)) : this.onData(l.shrinkBuf(R.output, R.next_out)))), R.avail_in === 0 && R.avail_out === 0 && (ee = !0);
						} while ((0 < R.avail_in || R.avail_out === 0) && D !== i.Z_STREAM_END);
						return D === i.Z_STREAM_END && (h = i.Z_FINISH), h === i.Z_FINISH ? (D = r.inflateEnd(this.strm), this.onEnd(D), this.ended = !0, D === i.Z_OK) : h !== i.Z_SYNC_FLUSH || (this.onEnd(i.Z_OK), !(R.avail_out = 0));
					}, g.prototype.onData = function(m) {
						this.chunks.push(m);
					}, g.prototype.onEnd = function(m) {
						m === i.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = l.flattenChunks(this.chunks)), this.chunks = [], this.err = m, this.msg = this.strm.msg;
					}, f.Inflate = g, f.inflate = p, f.inflateRaw = function(m, u) {
						return (u = u || {}).raw = !0, p(m, u);
					}, f.ungzip = p;
				}, {
					"./utils/common": 41,
					"./utils/strings": 42,
					"./zlib/constants": 44,
					"./zlib/gzheader": 47,
					"./zlib/inflate": 49,
					"./zlib/messages": 51,
					"./zlib/zstream": 53
				}],
				41: [function(t, U, f) {
					"use strict";
					var r = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
					f.assign = function(i) {
						for (var o = Array.prototype.slice.call(arguments, 1); o.length;) {
							var v = o.shift();
							if (v) {
								if (typeof v != "object") throw new TypeError(v + "must be non-object");
								for (var y in v) v.hasOwnProperty(y) && (i[y] = v[y]);
							}
						}
						return i;
					}, f.shrinkBuf = function(i, o) {
						return i.length === o ? i : i.subarray ? i.subarray(0, o) : (i.length = o, i);
					};
					var l = {
						arraySet: function(i, o, v, y, _) {
							if (o.subarray && i.subarray) i.set(o.subarray(v, v + y), _);
							else for (var g = 0; g < y; g++) i[_ + g] = o[v + g];
						},
						flattenChunks: function(i) {
							var o, v, y, _, g, p;
							for (o = y = 0, v = i.length; o < v; o++) y += i[o].length;
							for (p = new Uint8Array(y), o = _ = 0, v = i.length; o < v; o++) g = i[o], p.set(g, _), _ += g.length;
							return p;
						}
					}, a = {
						arraySet: function(i, o, v, y, _) {
							for (var g = 0; g < y; g++) i[_ + g] = o[v + g];
						},
						flattenChunks: function(i) {
							return [].concat.apply([], i);
						}
					};
					f.setTyped = function(i) {
						i ? (f.Buf8 = Uint8Array, f.Buf16 = Uint16Array, f.Buf32 = Int32Array, f.assign(f, l)) : (f.Buf8 = Array, f.Buf16 = Array, f.Buf32 = Array, f.assign(f, a));
					}, f.setTyped(r);
				}, {}],
				42: [function(t, U, f) {
					"use strict";
					var r = t("./common"), l = !0, a = !0;
					try {
						String.fromCharCode.apply(null, [0]);
					} catch {
						l = !1;
					}
					try {
						String.fromCharCode.apply(null, new Uint8Array(1));
					} catch {
						a = !1;
					}
					for (var i = new r.Buf8(256), o = 0; o < 256; o++) i[o] = 252 <= o ? 6 : 248 <= o ? 5 : 240 <= o ? 4 : 224 <= o ? 3 : 192 <= o ? 2 : 1;
					function v(y, _) {
						if (_ < 65537 && (y.subarray && a || !y.subarray && l)) return String.fromCharCode.apply(null, r.shrinkBuf(y, _));
						for (var g = "", p = 0; p < _; p++) g += String.fromCharCode(y[p]);
						return g;
					}
					i[254] = i[254] = 1, f.string2buf = function(y) {
						var _, g, p, m, u, D = y.length, h = 0;
						for (m = 0; m < D; m++) (64512 & (g = y.charCodeAt(m))) == 55296 && m + 1 < D && (64512 & (p = y.charCodeAt(m + 1))) == 56320 && (g = 65536 + (g - 55296 << 10) + (p - 56320), m++), h += g < 128 ? 1 : g < 2048 ? 2 : g < 65536 ? 3 : 4;
						for (_ = new r.Buf8(h), m = u = 0; u < h; m++) (64512 & (g = y.charCodeAt(m))) == 55296 && m + 1 < D && (64512 & (p = y.charCodeAt(m + 1))) == 56320 && (g = 65536 + (g - 55296 << 10) + (p - 56320), m++), g < 128 ? _[u++] = g : (g < 2048 ? _[u++] = 192 | g >>> 6 : (g < 65536 ? _[u++] = 224 | g >>> 12 : (_[u++] = 240 | g >>> 18, _[u++] = 128 | g >>> 12 & 63), _[u++] = 128 | g >>> 6 & 63), _[u++] = 128 | 63 & g);
						return _;
					}, f.buf2binstring = function(y) {
						return v(y, y.length);
					}, f.binstring2buf = function(y) {
						for (var _ = new r.Buf8(y.length), g = 0, p = _.length; g < p; g++) _[g] = y.charCodeAt(g);
						return _;
					}, f.buf2string = function(y, _) {
						var g, p, m, u, D = _ || y.length, h = new Array(2 * D);
						for (g = p = 0; g < D;) if ((m = y[g++]) < 128) h[p++] = m;
						else if (4 < (u = i[m])) h[p++] = 65533, g += u - 1;
						else {
							for (m &= u === 2 ? 31 : u === 3 ? 15 : 7; 1 < u && g < D;) m = m << 6 | 63 & y[g++], u--;
							1 < u ? h[p++] = 65533 : m < 65536 ? h[p++] = m : (m -= 65536, h[p++] = 55296 | m >> 10 & 1023, h[p++] = 56320 | 1023 & m);
						}
						return v(h, p);
					}, f.utf8border = function(y, _) {
						var g;
						for ((_ = _ || y.length) > y.length && (_ = y.length), g = _ - 1; 0 <= g && (192 & y[g]) == 128;) g--;
						return g < 0 || g === 0 ? _ : g + i[y[g]] > _ ? g : _;
					};
				}, { "./common": 41 }],
				43: [function(t, U, f) {
					"use strict";
					U.exports = function(r, l, a, i) {
						for (var o = 65535 & r | 0, v = r >>> 16 & 65535 | 0, y = 0; a !== 0;) {
							for (a -= y = 2e3 < a ? 2e3 : a; v = v + (o = o + l[i++] | 0) | 0, --y;);
							o %= 65521, v %= 65521;
						}
						return o | v << 16 | 0;
					};
				}, {}],
				44: [function(t, U, f) {
					"use strict";
					U.exports = {
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
				45: [function(t, U, f) {
					"use strict";
					var r = (function() {
						for (var l, a = [], i = 0; i < 256; i++) {
							l = i;
							for (var o = 0; o < 8; o++) l = 1 & l ? 3988292384 ^ l >>> 1 : l >>> 1;
							a[i] = l;
						}
						return a;
					})();
					U.exports = function(l, a, i, o) {
						var v = r, y = o + i;
						l ^= -1;
						for (var _ = o; _ < y; _++) l = l >>> 8 ^ v[255 & (l ^ a[_])];
						return -1 ^ l;
					};
				}, {}],
				46: [function(t, U, f) {
					"use strict";
					var r, l = t("../utils/common"), a = t("./trees"), i = t("./adler32"), o = t("./crc32"), v = t("./messages"), y = 0, _ = 4, g = 0, p = -2, m = -1, u = 4, D = 2, h = 8, c = 9, b = 286, L = 30, S = 19, R = 2 * b + 1, P = 15, M = 3, ee = 258, V = ee + M + 1, F = 42, K = 113, k = 1, Q = 2, J = 3, n = 4;
					function s(T, ke) {
						return T.msg = v[ke], ke;
					}
					function ie(T) {
						return (T << 1) - (4 < T ? 9 : 0);
					}
					function ce(T) {
						for (var ke = T.length; 0 <= --ke;) T[ke] = 0;
					}
					function I(T) {
						var ke = T.state, be = ke.pending;
						be > T.avail_out && (be = T.avail_out), be !== 0 && (l.arraySet(T.output, ke.pending_buf, ke.pending_out, be, T.next_out), T.next_out += be, ke.pending_out += be, T.total_out += be, T.avail_out -= be, ke.pending -= be, ke.pending === 0 && (ke.pending_out = 0));
					}
					function C(T, ke) {
						a._tr_flush_block(T, 0 <= T.block_start ? T.block_start : -1, T.strstart - T.block_start, ke), T.block_start = T.strstart, I(T.strm);
					}
					function Y(T, ke) {
						T.pending_buf[T.pending++] = ke;
					}
					function ve(T, ke) {
						T.pending_buf[T.pending++] = ke >>> 8 & 255, T.pending_buf[T.pending++] = 255 & ke;
					}
					function _e(T, ke) {
						var be, G, z = T.max_chain_length, se = T.strstart, We = T.prev_length, Ce = T.nice_match, pe = T.strstart > T.w_size - V ? T.strstart - (T.w_size - V) : 0, He = T.window, tt = T.w_mask, $e = T.prev, bt = T.strstart + ee, Pt = He[se + We - 1], Bt = He[se + We];
						T.prev_length >= T.good_match && (z >>= 2), Ce > T.lookahead && (Ce = T.lookahead);
						do
							if (He[(be = ke) + We] === Bt && He[be + We - 1] === Pt && He[be] === He[se] && He[++be] === He[se + 1]) {
								se += 2, be++;
								do								;
while (He[++se] === He[++be] && He[++se] === He[++be] && He[++se] === He[++be] && He[++se] === He[++be] && He[++se] === He[++be] && He[++se] === He[++be] && He[++se] === He[++be] && He[++se] === He[++be] && se < bt);
								if (G = ee - (bt - se), se = bt - ee, We < G) {
									if (T.match_start = ke, Ce <= (We = G)) break;
									Pt = He[se + We - 1], Bt = He[se + We];
								}
							}
						while ((ke = $e[ke & tt]) > pe && --z != 0);
						return We <= T.lookahead ? We : T.lookahead;
					}
					function Ye(T) {
						var ke, be, G, z, se, We, Ce, pe, He, tt, $e = T.w_size;
						do {
							if (z = T.window_size - T.lookahead - T.strstart, T.strstart >= $e + ($e - V)) {
								for (l.arraySet(T.window, T.window, $e, $e, 0), T.match_start -= $e, T.strstart -= $e, T.block_start -= $e, ke = be = T.hash_size; G = T.head[--ke], T.head[ke] = $e <= G ? G - $e : 0, --be;);
								for (ke = be = $e; G = T.prev[--ke], T.prev[ke] = $e <= G ? G - $e : 0, --be;);
								z += $e;
							}
							if (T.strm.avail_in === 0) break;
							if (We = T.strm, Ce = T.window, pe = T.strstart + T.lookahead, He = z, tt = void 0, tt = We.avail_in, He < tt && (tt = He), be = tt === 0 ? 0 : (We.avail_in -= tt, l.arraySet(Ce, We.input, We.next_in, tt, pe), We.state.wrap === 1 ? We.adler = i(We.adler, Ce, tt, pe) : We.state.wrap === 2 && (We.adler = o(We.adler, Ce, tt, pe)), We.next_in += tt, We.total_in += tt, tt), T.lookahead += be, T.lookahead + T.insert >= M) for (se = T.strstart - T.insert, T.ins_h = T.window[se], T.ins_h = (T.ins_h << T.hash_shift ^ T.window[se + 1]) & T.hash_mask; T.insert && (T.ins_h = (T.ins_h << T.hash_shift ^ T.window[se + M - 1]) & T.hash_mask, T.prev[se & T.w_mask] = T.head[T.ins_h], T.head[T.ins_h] = se, se++, T.insert--, !(T.lookahead + T.insert < M)););
						} while (T.lookahead < V && T.strm.avail_in !== 0);
					}
					function Je(T, ke) {
						for (var be, G;;) {
							if (T.lookahead < V) {
								if (Ye(T), T.lookahead < V && ke === y) return k;
								if (T.lookahead === 0) break;
							}
							if (be = 0, T.lookahead >= M && (T.ins_h = (T.ins_h << T.hash_shift ^ T.window[T.strstart + M - 1]) & T.hash_mask, be = T.prev[T.strstart & T.w_mask] = T.head[T.ins_h], T.head[T.ins_h] = T.strstart), be !== 0 && T.strstart - be <= T.w_size - V && (T.match_length = _e(T, be)), T.match_length >= M) if (G = a._tr_tally(T, T.strstart - T.match_start, T.match_length - M), T.lookahead -= T.match_length, T.match_length <= T.max_lazy_match && T.lookahead >= M) {
								for (T.match_length--; T.strstart++, T.ins_h = (T.ins_h << T.hash_shift ^ T.window[T.strstart + M - 1]) & T.hash_mask, be = T.prev[T.strstart & T.w_mask] = T.head[T.ins_h], T.head[T.ins_h] = T.strstart, --T.match_length != 0;);
								T.strstart++;
							} else T.strstart += T.match_length, T.match_length = 0, T.ins_h = T.window[T.strstart], T.ins_h = (T.ins_h << T.hash_shift ^ T.window[T.strstart + 1]) & T.hash_mask;
							else G = a._tr_tally(T, 0, T.window[T.strstart]), T.lookahead--, T.strstart++;
							if (G && (C(T, !1), T.strm.avail_out === 0)) return k;
						}
						return T.insert = T.strstart < M - 1 ? T.strstart : M - 1, ke === _ ? (C(T, !0), T.strm.avail_out === 0 ? J : n) : T.last_lit && (C(T, !1), T.strm.avail_out === 0) ? k : Q;
					}
					function Ve(T, ke) {
						for (var be, G, z;;) {
							if (T.lookahead < V) {
								if (Ye(T), T.lookahead < V && ke === y) return k;
								if (T.lookahead === 0) break;
							}
							if (be = 0, T.lookahead >= M && (T.ins_h = (T.ins_h << T.hash_shift ^ T.window[T.strstart + M - 1]) & T.hash_mask, be = T.prev[T.strstart & T.w_mask] = T.head[T.ins_h], T.head[T.ins_h] = T.strstart), T.prev_length = T.match_length, T.prev_match = T.match_start, T.match_length = M - 1, be !== 0 && T.prev_length < T.max_lazy_match && T.strstart - be <= T.w_size - V && (T.match_length = _e(T, be), T.match_length <= 5 && (T.strategy === 1 || T.match_length === M && 4096 < T.strstart - T.match_start) && (T.match_length = M - 1)), T.prev_length >= M && T.match_length <= T.prev_length) {
								for (z = T.strstart + T.lookahead - M, G = a._tr_tally(T, T.strstart - 1 - T.prev_match, T.prev_length - M), T.lookahead -= T.prev_length - 1, T.prev_length -= 2; ++T.strstart <= z && (T.ins_h = (T.ins_h << T.hash_shift ^ T.window[T.strstart + M - 1]) & T.hash_mask, be = T.prev[T.strstart & T.w_mask] = T.head[T.ins_h], T.head[T.ins_h] = T.strstart), --T.prev_length != 0;);
								if (T.match_available = 0, T.match_length = M - 1, T.strstart++, G && (C(T, !1), T.strm.avail_out === 0)) return k;
							} else if (T.match_available) {
								if ((G = a._tr_tally(T, 0, T.window[T.strstart - 1])) && C(T, !1), T.strstart++, T.lookahead--, T.strm.avail_out === 0) return k;
							} else T.match_available = 1, T.strstart++, T.lookahead--;
						}
						return T.match_available && (G = a._tr_tally(T, 0, T.window[T.strstart - 1]), T.match_available = 0), T.insert = T.strstart < M - 1 ? T.strstart : M - 1, ke === _ ? (C(T, !0), T.strm.avail_out === 0 ? J : n) : T.last_lit && (C(T, !1), T.strm.avail_out === 0) ? k : Q;
					}
					function at(T, ke, be, G, z) {
						this.good_length = T, this.max_lazy = ke, this.nice_length = be, this.max_chain = G, this.func = z;
					}
					function W() {
						this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = h, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new l.Buf16(2 * R), this.dyn_dtree = new l.Buf16(2 * (2 * L + 1)), this.bl_tree = new l.Buf16(2 * (2 * S + 1)), ce(this.dyn_ltree), ce(this.dyn_dtree), ce(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new l.Buf16(P + 1), this.heap = new l.Buf16(2 * b + 1), ce(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new l.Buf16(2 * b + 1), ce(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
					}
					function Dt(T) {
						var ke;
						return T && T.state ? (T.total_in = T.total_out = 0, T.data_type = D, (ke = T.state).pending = 0, ke.pending_out = 0, ke.wrap < 0 && (ke.wrap = -ke.wrap), ke.status = ke.wrap ? F : K, T.adler = ke.wrap === 2 ? 0 : 1, ke.last_flush = y, a._tr_init(ke), g) : s(T, p);
					}
					function Lt(T) {
						var ke = Dt(T);
						return ke === g && (function(be) {
							be.window_size = 2 * be.w_size, ce(be.head), be.max_lazy_match = r[be.level].max_lazy, be.good_match = r[be.level].good_length, be.nice_match = r[be.level].nice_length, be.max_chain_length = r[be.level].max_chain, be.strstart = 0, be.block_start = 0, be.lookahead = 0, be.insert = 0, be.match_length = be.prev_length = M - 1, be.match_available = 0, be.ins_h = 0;
						})(T.state), ke;
					}
					function kt(T, ke, be, G, z, se) {
						if (!T) return p;
						var We = 1;
						if (ke === m && (ke = 6), G < 0 ? (We = 0, G = -G) : 15 < G && (We = 2, G -= 16), z < 1 || c < z || be !== h || G < 8 || 15 < G || ke < 0 || 9 < ke || se < 0 || u < se) return s(T, p);
						G === 8 && (G = 9);
						var Ce = new W();
						return (T.state = Ce).strm = T, Ce.wrap = We, Ce.gzhead = null, Ce.w_bits = G, Ce.w_size = 1 << Ce.w_bits, Ce.w_mask = Ce.w_size - 1, Ce.hash_bits = z + 7, Ce.hash_size = 1 << Ce.hash_bits, Ce.hash_mask = Ce.hash_size - 1, Ce.hash_shift = ~~((Ce.hash_bits + M - 1) / M), Ce.window = new l.Buf8(2 * Ce.w_size), Ce.head = new l.Buf16(Ce.hash_size), Ce.prev = new l.Buf16(Ce.w_size), Ce.lit_bufsize = 1 << z + 6, Ce.pending_buf_size = 4 * Ce.lit_bufsize, Ce.pending_buf = new l.Buf8(Ce.pending_buf_size), Ce.d_buf = 1 * Ce.lit_bufsize, Ce.l_buf = 3 * Ce.lit_bufsize, Ce.level = ke, Ce.strategy = se, Ce.method = be, Lt(T);
					}
					r = [
						new at(0, 0, 0, 0, function(T, ke) {
							var be = 65535;
							for (be > T.pending_buf_size - 5 && (be = T.pending_buf_size - 5);;) {
								if (T.lookahead <= 1) {
									if (Ye(T), T.lookahead === 0 && ke === y) return k;
									if (T.lookahead === 0) break;
								}
								T.strstart += T.lookahead, T.lookahead = 0;
								var G = T.block_start + be;
								if ((T.strstart === 0 || T.strstart >= G) && (T.lookahead = T.strstart - G, T.strstart = G, C(T, !1), T.strm.avail_out === 0) || T.strstart - T.block_start >= T.w_size - V && (C(T, !1), T.strm.avail_out === 0)) return k;
							}
							return T.insert = 0, ke === _ ? (C(T, !0), T.strm.avail_out === 0 ? J : n) : (T.strstart > T.block_start && (C(T, !1), T.strm.avail_out), k);
						}),
						new at(4, 4, 8, 4, Je),
						new at(4, 5, 16, 8, Je),
						new at(4, 6, 32, 32, Je),
						new at(4, 4, 16, 16, Ve),
						new at(8, 16, 32, 32, Ve),
						new at(8, 16, 128, 128, Ve),
						new at(8, 32, 128, 256, Ve),
						new at(32, 128, 258, 1024, Ve),
						new at(32, 258, 258, 4096, Ve)
					], f.deflateInit = function(T, ke) {
						return kt(T, ke, h, 15, 8, 0);
					}, f.deflateInit2 = kt, f.deflateReset = Lt, f.deflateResetKeep = Dt, f.deflateSetHeader = function(T, ke) {
						return T && T.state ? T.state.wrap !== 2 ? p : (T.state.gzhead = ke, g) : p;
					}, f.deflate = function(T, ke) {
						var be, G, z, se;
						if (!T || !T.state || 5 < ke || ke < 0) return T ? s(T, p) : p;
						if (G = T.state, !T.output || !T.input && T.avail_in !== 0 || G.status === 666 && ke !== _) return s(T, T.avail_out === 0 ? -5 : p);
						if (G.strm = T, be = G.last_flush, G.last_flush = ke, G.status === F) if (G.wrap === 2) T.adler = 0, Y(G, 31), Y(G, 139), Y(G, 8), G.gzhead ? (Y(G, (G.gzhead.text ? 1 : 0) + (G.gzhead.hcrc ? 2 : 0) + (G.gzhead.extra ? 4 : 0) + (G.gzhead.name ? 8 : 0) + (G.gzhead.comment ? 16 : 0)), Y(G, 255 & G.gzhead.time), Y(G, G.gzhead.time >> 8 & 255), Y(G, G.gzhead.time >> 16 & 255), Y(G, G.gzhead.time >> 24 & 255), Y(G, G.level === 9 ? 2 : 2 <= G.strategy || G.level < 2 ? 4 : 0), Y(G, 255 & G.gzhead.os), G.gzhead.extra && G.gzhead.extra.length && (Y(G, 255 & G.gzhead.extra.length), Y(G, G.gzhead.extra.length >> 8 & 255)), G.gzhead.hcrc && (T.adler = o(T.adler, G.pending_buf, G.pending, 0)), G.gzindex = 0, G.status = 69) : (Y(G, 0), Y(G, 0), Y(G, 0), Y(G, 0), Y(G, 0), Y(G, G.level === 9 ? 2 : 2 <= G.strategy || G.level < 2 ? 4 : 0), Y(G, 3), G.status = K);
						else {
							var We = h + (G.w_bits - 8 << 4) << 8;
							We |= (2 <= G.strategy || G.level < 2 ? 0 : G.level < 6 ? 1 : G.level === 6 ? 2 : 3) << 6, G.strstart !== 0 && (We |= 32), We += 31 - We % 31, G.status = K, ve(G, We), G.strstart !== 0 && (ve(G, T.adler >>> 16), ve(G, 65535 & T.adler)), T.adler = 1;
						}
						if (G.status === 69) if (G.gzhead.extra) {
							for (z = G.pending; G.gzindex < (65535 & G.gzhead.extra.length) && (G.pending !== G.pending_buf_size || (G.gzhead.hcrc && G.pending > z && (T.adler = o(T.adler, G.pending_buf, G.pending - z, z)), I(T), z = G.pending, G.pending !== G.pending_buf_size));) Y(G, 255 & G.gzhead.extra[G.gzindex]), G.gzindex++;
							G.gzhead.hcrc && G.pending > z && (T.adler = o(T.adler, G.pending_buf, G.pending - z, z)), G.gzindex === G.gzhead.extra.length && (G.gzindex = 0, G.status = 73);
						} else G.status = 73;
						if (G.status === 73) if (G.gzhead.name) {
							z = G.pending;
							do {
								if (G.pending === G.pending_buf_size && (G.gzhead.hcrc && G.pending > z && (T.adler = o(T.adler, G.pending_buf, G.pending - z, z)), I(T), z = G.pending, G.pending === G.pending_buf_size)) {
									se = 1;
									break;
								}
								se = G.gzindex < G.gzhead.name.length ? 255 & G.gzhead.name.charCodeAt(G.gzindex++) : 0, Y(G, se);
							} while (se !== 0);
							G.gzhead.hcrc && G.pending > z && (T.adler = o(T.adler, G.pending_buf, G.pending - z, z)), se === 0 && (G.gzindex = 0, G.status = 91);
						} else G.status = 91;
						if (G.status === 91) if (G.gzhead.comment) {
							z = G.pending;
							do {
								if (G.pending === G.pending_buf_size && (G.gzhead.hcrc && G.pending > z && (T.adler = o(T.adler, G.pending_buf, G.pending - z, z)), I(T), z = G.pending, G.pending === G.pending_buf_size)) {
									se = 1;
									break;
								}
								se = G.gzindex < G.gzhead.comment.length ? 255 & G.gzhead.comment.charCodeAt(G.gzindex++) : 0, Y(G, se);
							} while (se !== 0);
							G.gzhead.hcrc && G.pending > z && (T.adler = o(T.adler, G.pending_buf, G.pending - z, z)), se === 0 && (G.status = 103);
						} else G.status = 103;
						if (G.status === 103 && (G.gzhead.hcrc ? (G.pending + 2 > G.pending_buf_size && I(T), G.pending + 2 <= G.pending_buf_size && (Y(G, 255 & T.adler), Y(G, T.adler >> 8 & 255), T.adler = 0, G.status = K)) : G.status = K), G.pending !== 0) {
							if (I(T), T.avail_out === 0) return G.last_flush = -1, g;
						} else if (T.avail_in === 0 && ie(ke) <= ie(be) && ke !== _) return s(T, -5);
						if (G.status === 666 && T.avail_in !== 0) return s(T, -5);
						if (T.avail_in !== 0 || G.lookahead !== 0 || ke !== y && G.status !== 666) {
							var Ce = G.strategy === 2 ? (function(pe, He) {
								for (var tt;;) {
									if (pe.lookahead === 0 && (Ye(pe), pe.lookahead === 0)) {
										if (He === y) return k;
										break;
									}
									if (pe.match_length = 0, tt = a._tr_tally(pe, 0, pe.window[pe.strstart]), pe.lookahead--, pe.strstart++, tt && (C(pe, !1), pe.strm.avail_out === 0)) return k;
								}
								return pe.insert = 0, He === _ ? (C(pe, !0), pe.strm.avail_out === 0 ? J : n) : pe.last_lit && (C(pe, !1), pe.strm.avail_out === 0) ? k : Q;
							})(G, ke) : G.strategy === 3 ? (function(pe, He) {
								for (var tt, $e, bt, Pt, Bt = pe.window;;) {
									if (pe.lookahead <= ee) {
										if (Ye(pe), pe.lookahead <= ee && He === y) return k;
										if (pe.lookahead === 0) break;
									}
									if (pe.match_length = 0, pe.lookahead >= M && 0 < pe.strstart && ($e = Bt[bt = pe.strstart - 1]) === Bt[++bt] && $e === Bt[++bt] && $e === Bt[++bt]) {
										Pt = pe.strstart + ee;
										do										;
while ($e === Bt[++bt] && $e === Bt[++bt] && $e === Bt[++bt] && $e === Bt[++bt] && $e === Bt[++bt] && $e === Bt[++bt] && $e === Bt[++bt] && $e === Bt[++bt] && bt < Pt);
										pe.match_length = ee - (Pt - bt), pe.match_length > pe.lookahead && (pe.match_length = pe.lookahead);
									}
									if (pe.match_length >= M ? (tt = a._tr_tally(pe, 1, pe.match_length - M), pe.lookahead -= pe.match_length, pe.strstart += pe.match_length, pe.match_length = 0) : (tt = a._tr_tally(pe, 0, pe.window[pe.strstart]), pe.lookahead--, pe.strstart++), tt && (C(pe, !1), pe.strm.avail_out === 0)) return k;
								}
								return pe.insert = 0, He === _ ? (C(pe, !0), pe.strm.avail_out === 0 ? J : n) : pe.last_lit && (C(pe, !1), pe.strm.avail_out === 0) ? k : Q;
							})(G, ke) : r[G.level].func(G, ke);
							if (Ce !== J && Ce !== n || (G.status = 666), Ce === k || Ce === J) return T.avail_out === 0 && (G.last_flush = -1), g;
							if (Ce === Q && (ke === 1 ? a._tr_align(G) : ke !== 5 && (a._tr_stored_block(G, 0, 0, !1), ke === 3 && (ce(G.head), G.lookahead === 0 && (G.strstart = 0, G.block_start = 0, G.insert = 0))), I(T), T.avail_out === 0)) return G.last_flush = -1, g;
						}
						return ke !== _ ? g : G.wrap <= 0 ? 1 : (G.wrap === 2 ? (Y(G, 255 & T.adler), Y(G, T.adler >> 8 & 255), Y(G, T.adler >> 16 & 255), Y(G, T.adler >> 24 & 255), Y(G, 255 & T.total_in), Y(G, T.total_in >> 8 & 255), Y(G, T.total_in >> 16 & 255), Y(G, T.total_in >> 24 & 255)) : (ve(G, T.adler >>> 16), ve(G, 65535 & T.adler)), I(T), 0 < G.wrap && (G.wrap = -G.wrap), G.pending !== 0 ? g : 1);
					}, f.deflateEnd = function(T) {
						var ke;
						return T && T.state ? (ke = T.state.status) !== F && ke !== 69 && ke !== 73 && ke !== 91 && ke !== 103 && ke !== K && ke !== 666 ? s(T, p) : (T.state = null, ke === K ? s(T, -3) : g) : p;
					}, f.deflateSetDictionary = function(T, ke) {
						var be, G, z, se, We, Ce, pe, He, tt = ke.length;
						if (!T || !T.state || (se = (be = T.state).wrap) === 2 || se === 1 && be.status !== F || be.lookahead) return p;
						for (se === 1 && (T.adler = i(T.adler, ke, tt, 0)), be.wrap = 0, tt >= be.w_size && (se === 0 && (ce(be.head), be.strstart = 0, be.block_start = 0, be.insert = 0), He = new l.Buf8(be.w_size), l.arraySet(He, ke, tt - be.w_size, be.w_size, 0), ke = He, tt = be.w_size), We = T.avail_in, Ce = T.next_in, pe = T.input, T.avail_in = tt, T.next_in = 0, T.input = ke, Ye(be); be.lookahead >= M;) {
							for (G = be.strstart, z = be.lookahead - (M - 1); be.ins_h = (be.ins_h << be.hash_shift ^ be.window[G + M - 1]) & be.hash_mask, be.prev[G & be.w_mask] = be.head[be.ins_h], be.head[be.ins_h] = G, G++, --z;);
							be.strstart = G, be.lookahead = M - 1, Ye(be);
						}
						return be.strstart += be.lookahead, be.block_start = be.strstart, be.insert = be.lookahead, be.lookahead = 0, be.match_length = be.prev_length = M - 1, be.match_available = 0, T.next_in = Ce, T.input = pe, T.avail_in = We, be.wrap = se, g;
					}, f.deflateInfo = "pako deflate (from Nodeca project)";
				}, {
					"../utils/common": 41,
					"./adler32": 43,
					"./crc32": 45,
					"./messages": 51,
					"./trees": 52
				}],
				47: [function(t, U, f) {
					"use strict";
					U.exports = function() {
						this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
					};
				}, {}],
				48: [function(t, U, f) {
					"use strict";
					U.exports = function(r, l) {
						var a = r.state, i = r.next_in, o, v, y, _, g, p, m, u, D, h, c, b, L, S, R, P, M, ee, V, F, K, k = r.input, Q;
						o = i + (r.avail_in - 5), v = r.next_out, Q = r.output, y = v - (l - r.avail_out), _ = v + (r.avail_out - 257), g = a.dmax, p = a.wsize, m = a.whave, u = a.wnext, D = a.window, h = a.hold, c = a.bits, b = a.lencode, L = a.distcode, S = (1 << a.lenbits) - 1, R = (1 << a.distbits) - 1;
						e: do {
							c < 15 && (h += k[i++] << c, c += 8, h += k[i++] << c, c += 8), P = b[h & S];
							t: for (;;) {
								if (h >>>= M = P >>> 24, c -= M, (M = P >>> 16 & 255) === 0) Q[v++] = 65535 & P;
								else {
									if (!(16 & M)) {
										if ((64 & M) == 0) {
											P = b[(65535 & P) + (h & (1 << M) - 1)];
											continue t;
										}
										if (32 & M) {
											a.mode = 12;
											break e;
										}
										r.msg = "invalid literal/length code", a.mode = 30;
										break e;
									}
									ee = 65535 & P, (M &= 15) && (c < M && (h += k[i++] << c, c += 8), ee += h & (1 << M) - 1, h >>>= M, c -= M), c < 15 && (h += k[i++] << c, c += 8, h += k[i++] << c, c += 8), P = L[h & R];
									a: for (;;) {
										if (h >>>= M = P >>> 24, c -= M, !(16 & (M = P >>> 16 & 255))) {
											if ((64 & M) == 0) {
												P = L[(65535 & P) + (h & (1 << M) - 1)];
												continue a;
											}
											r.msg = "invalid distance code", a.mode = 30;
											break e;
										}
										if (V = 65535 & P, c < (M &= 15) && (h += k[i++] << c, (c += 8) < M && (h += k[i++] << c, c += 8)), g < (V += h & (1 << M) - 1)) {
											r.msg = "invalid distance too far back", a.mode = 30;
											break e;
										}
										if (h >>>= M, c -= M, (M = v - y) < V) {
											if (m < (M = V - M) && a.sane) {
												r.msg = "invalid distance too far back", a.mode = 30;
												break e;
											}
											if (K = D, (F = 0) === u) {
												if (F += p - M, M < ee) {
													for (ee -= M; Q[v++] = D[F++], --M;);
													F = v - V, K = Q;
												}
											} else if (u < M) {
												if (F += p + u - M, (M -= u) < ee) {
													for (ee -= M; Q[v++] = D[F++], --M;);
													if (F = 0, u < ee) {
														for (ee -= M = u; Q[v++] = D[F++], --M;);
														F = v - V, K = Q;
													}
												}
											} else if (F += u - M, M < ee) {
												for (ee -= M; Q[v++] = D[F++], --M;);
												F = v - V, K = Q;
											}
											for (; 2 < ee;) Q[v++] = K[F++], Q[v++] = K[F++], Q[v++] = K[F++], ee -= 3;
											ee && (Q[v++] = K[F++], 1 < ee && (Q[v++] = K[F++]));
										} else {
											for (F = v - V; Q[v++] = Q[F++], Q[v++] = Q[F++], Q[v++] = Q[F++], 2 < (ee -= 3););
											ee && (Q[v++] = Q[F++], 1 < ee && (Q[v++] = Q[F++]));
										}
										break;
									}
								}
								break;
							}
						} while (i < o && v < _);
						i -= ee = c >> 3, h &= (1 << (c -= ee << 3)) - 1, r.next_in = i, r.next_out = v, r.avail_in = i < o ? o - i + 5 : 5 - (i - o), r.avail_out = v < _ ? _ - v + 257 : 257 - (v - _), a.hold = h, a.bits = c;
					};
				}, {}],
				49: [function(t, U, f) {
					"use strict";
					var r = t("../utils/common"), l = t("./adler32"), a = t("./crc32"), i = t("./inffast"), o = t("./inftrees"), v = 1, y = 2, _ = 0, g = -2, p = 1, m = 852, u = 592;
					function D(F) {
						return (F >>> 24 & 255) + (F >>> 8 & 65280) + ((65280 & F) << 8) + ((255 & F) << 24);
					}
					function h() {
						this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new r.Buf16(320), this.work = new r.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
					}
					function c(F) {
						var K;
						return F && F.state ? (K = F.state, F.total_in = F.total_out = K.total = 0, F.msg = "", K.wrap && (F.adler = 1 & K.wrap), K.mode = p, K.last = 0, K.havedict = 0, K.dmax = 32768, K.head = null, K.hold = 0, K.bits = 0, K.lencode = K.lendyn = new r.Buf32(m), K.distcode = K.distdyn = new r.Buf32(u), K.sane = 1, K.back = -1, _) : g;
					}
					function b(F) {
						var K;
						return F && F.state ? ((K = F.state).wsize = 0, K.whave = 0, K.wnext = 0, c(F)) : g;
					}
					function L(F, K) {
						var k, Q;
						return F && F.state ? (Q = F.state, K < 0 ? (k = 0, K = -K) : (k = 1 + (K >> 4), K < 48 && (K &= 15)), K && (K < 8 || 15 < K) ? g : (Q.window !== null && Q.wbits !== K && (Q.window = null), Q.wrap = k, Q.wbits = K, b(F))) : g;
					}
					function S(F, K) {
						var k, Q;
						return F ? (Q = new h(), (F.state = Q).window = null, (k = L(F, K)) !== _ && (F.state = null), k) : g;
					}
					var R, P, M = !0;
					function ee(F) {
						if (M) {
							var K;
							for (R = new r.Buf32(512), P = new r.Buf32(32), K = 0; K < 144;) F.lens[K++] = 8;
							for (; K < 256;) F.lens[K++] = 9;
							for (; K < 280;) F.lens[K++] = 7;
							for (; K < 288;) F.lens[K++] = 8;
							for (o(v, F.lens, 0, 288, R, 0, F.work, { bits: 9 }), K = 0; K < 32;) F.lens[K++] = 5;
							o(y, F.lens, 0, 32, P, 0, F.work, { bits: 5 }), M = !1;
						}
						F.lencode = R, F.lenbits = 9, F.distcode = P, F.distbits = 5;
					}
					function V(F, K, k, Q) {
						var J, n = F.state;
						return n.window === null && (n.wsize = 1 << n.wbits, n.wnext = 0, n.whave = 0, n.window = new r.Buf8(n.wsize)), Q >= n.wsize ? (r.arraySet(n.window, K, k - n.wsize, n.wsize, 0), n.wnext = 0, n.whave = n.wsize) : (Q < (J = n.wsize - n.wnext) && (J = Q), r.arraySet(n.window, K, k - Q, J, n.wnext), (Q -= J) ? (r.arraySet(n.window, K, k - Q, Q, 0), n.wnext = Q, n.whave = n.wsize) : (n.wnext += J, n.wnext === n.wsize && (n.wnext = 0), n.whave < n.wsize && (n.whave += J))), 0;
					}
					f.inflateReset = b, f.inflateReset2 = L, f.inflateResetKeep = c, f.inflateInit = function(F) {
						return S(F, 15);
					}, f.inflateInit2 = S, f.inflate = function(F, K) {
						var k, Q, J, n, s, ie, ce, I, C, Y, ve, _e, Ye, Je, Ve, at, W, Dt, Lt, kt, T, ke, be, G, z = 0, se = new r.Buf8(4), We = [
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
						if (!F || !F.state || !F.output || !F.input && F.avail_in !== 0) return g;
						(k = F.state).mode === 12 && (k.mode = 13), s = F.next_out, J = F.output, ce = F.avail_out, n = F.next_in, Q = F.input, ie = F.avail_in, I = k.hold, C = k.bits, Y = ie, ve = ce, ke = _;
						e: for (;;) switch (k.mode) {
							case p:
								if (k.wrap === 0) {
									k.mode = 13;
									break;
								}
								for (; C < 16;) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								if (2 & k.wrap && I === 35615) {
									se[k.check = 0] = 255 & I, se[1] = I >>> 8 & 255, k.check = a(k.check, se, 2, 0), C = I = 0, k.mode = 2;
									break;
								}
								if (k.flags = 0, k.head && (k.head.done = !1), !(1 & k.wrap) || (((255 & I) << 8) + (I >> 8)) % 31) {
									F.msg = "incorrect header check", k.mode = 30;
									break;
								}
								if ((15 & I) != 8) {
									F.msg = "unknown compression method", k.mode = 30;
									break;
								}
								if (C -= 4, T = 8 + (15 & (I >>>= 4)), k.wbits === 0) k.wbits = T;
								else if (T > k.wbits) {
									F.msg = "invalid window size", k.mode = 30;
									break;
								}
								k.dmax = 1 << T, F.adler = k.check = 1, k.mode = 512 & I ? 10 : 12, C = I = 0;
								break;
							case 2:
								for (; C < 16;) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								if (k.flags = I, (255 & k.flags) != 8) {
									F.msg = "unknown compression method", k.mode = 30;
									break;
								}
								if (57344 & k.flags) {
									F.msg = "unknown header flags set", k.mode = 30;
									break;
								}
								k.head && (k.head.text = I >> 8 & 1), 512 & k.flags && (se[0] = 255 & I, se[1] = I >>> 8 & 255, k.check = a(k.check, se, 2, 0)), C = I = 0, k.mode = 3;
							case 3:
								for (; C < 32;) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								k.head && (k.head.time = I), 512 & k.flags && (se[0] = 255 & I, se[1] = I >>> 8 & 255, se[2] = I >>> 16 & 255, se[3] = I >>> 24 & 255, k.check = a(k.check, se, 4, 0)), C = I = 0, k.mode = 4;
							case 4:
								for (; C < 16;) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								k.head && (k.head.xflags = 255 & I, k.head.os = I >> 8), 512 & k.flags && (se[0] = 255 & I, se[1] = I >>> 8 & 255, k.check = a(k.check, se, 2, 0)), C = I = 0, k.mode = 5;
							case 5:
								if (1024 & k.flags) {
									for (; C < 16;) {
										if (ie === 0) break e;
										ie--, I += Q[n++] << C, C += 8;
									}
									k.length = I, k.head && (k.head.extra_len = I), 512 & k.flags && (se[0] = 255 & I, se[1] = I >>> 8 & 255, k.check = a(k.check, se, 2, 0)), C = I = 0;
								} else k.head && (k.head.extra = null);
								k.mode = 6;
							case 6:
								if (1024 & k.flags && (ie < (_e = k.length) && (_e = ie), _e && (k.head && (T = k.head.extra_len - k.length, k.head.extra || (k.head.extra = new Array(k.head.extra_len)), r.arraySet(k.head.extra, Q, n, _e, T)), 512 & k.flags && (k.check = a(k.check, Q, _e, n)), ie -= _e, n += _e, k.length -= _e), k.length)) break e;
								k.length = 0, k.mode = 7;
							case 7:
								if (2048 & k.flags) {
									if (ie === 0) break e;
									for (_e = 0; T = Q[n + _e++], k.head && T && k.length < 65536 && (k.head.name += String.fromCharCode(T)), T && _e < ie;);
									if (512 & k.flags && (k.check = a(k.check, Q, _e, n)), ie -= _e, n += _e, T) break e;
								} else k.head && (k.head.name = null);
								k.length = 0, k.mode = 8;
							case 8:
								if (4096 & k.flags) {
									if (ie === 0) break e;
									for (_e = 0; T = Q[n + _e++], k.head && T && k.length < 65536 && (k.head.comment += String.fromCharCode(T)), T && _e < ie;);
									if (512 & k.flags && (k.check = a(k.check, Q, _e, n)), ie -= _e, n += _e, T) break e;
								} else k.head && (k.head.comment = null);
								k.mode = 9;
							case 9:
								if (512 & k.flags) {
									for (; C < 16;) {
										if (ie === 0) break e;
										ie--, I += Q[n++] << C, C += 8;
									}
									if (I !== (65535 & k.check)) {
										F.msg = "header crc mismatch", k.mode = 30;
										break;
									}
									C = I = 0;
								}
								k.head && (k.head.hcrc = k.flags >> 9 & 1, k.head.done = !0), F.adler = k.check = 0, k.mode = 12;
								break;
							case 10:
								for (; C < 32;) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								F.adler = k.check = D(I), C = I = 0, k.mode = 11;
							case 11:
								if (k.havedict === 0) return F.next_out = s, F.avail_out = ce, F.next_in = n, F.avail_in = ie, k.hold = I, k.bits = C, 2;
								F.adler = k.check = 1, k.mode = 12;
							case 12: if (K === 5 || K === 6) break e;
							case 13:
								if (k.last) {
									I >>>= 7 & C, C -= 7 & C, k.mode = 27;
									break;
								}
								for (; C < 3;) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								switch (k.last = 1 & I, C -= 1, 3 & (I >>>= 1)) {
									case 0:
										k.mode = 14;
										break;
									case 1:
										if (ee(k), k.mode = 20, K !== 6) break;
										I >>>= 2, C -= 2;
										break e;
									case 2:
										k.mode = 17;
										break;
									case 3: F.msg = "invalid block type", k.mode = 30;
								}
								I >>>= 2, C -= 2;
								break;
							case 14:
								for (I >>>= 7 & C, C -= 7 & C; C < 32;) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								if ((65535 & I) != (I >>> 16 ^ 65535)) {
									F.msg = "invalid stored block lengths", k.mode = 30;
									break;
								}
								if (k.length = 65535 & I, C = I = 0, k.mode = 15, K === 6) break e;
							case 15: k.mode = 16;
							case 16:
								if (_e = k.length) {
									if (ie < _e && (_e = ie), ce < _e && (_e = ce), _e === 0) break e;
									r.arraySet(J, Q, n, _e, s), ie -= _e, n += _e, ce -= _e, s += _e, k.length -= _e;
									break;
								}
								k.mode = 12;
								break;
							case 17:
								for (; C < 14;) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								if (k.nlen = 257 + (31 & I), I >>>= 5, C -= 5, k.ndist = 1 + (31 & I), I >>>= 5, C -= 5, k.ncode = 4 + (15 & I), I >>>= 4, C -= 4, 286 < k.nlen || 30 < k.ndist) {
									F.msg = "too many length or distance symbols", k.mode = 30;
									break;
								}
								k.have = 0, k.mode = 18;
							case 18:
								for (; k.have < k.ncode;) {
									for (; C < 3;) {
										if (ie === 0) break e;
										ie--, I += Q[n++] << C, C += 8;
									}
									k.lens[We[k.have++]] = 7 & I, I >>>= 3, C -= 3;
								}
								for (; k.have < 19;) k.lens[We[k.have++]] = 0;
								if (k.lencode = k.lendyn, k.lenbits = 7, be = { bits: k.lenbits }, ke = o(0, k.lens, 0, 19, k.lencode, 0, k.work, be), k.lenbits = be.bits, ke) {
									F.msg = "invalid code lengths set", k.mode = 30;
									break;
								}
								k.have = 0, k.mode = 19;
							case 19:
								for (; k.have < k.nlen + k.ndist;) {
									for (; at = (z = k.lencode[I & (1 << k.lenbits) - 1]) >>> 16 & 255, W = 65535 & z, !((Ve = z >>> 24) <= C);) {
										if (ie === 0) break e;
										ie--, I += Q[n++] << C, C += 8;
									}
									if (W < 16) I >>>= Ve, C -= Ve, k.lens[k.have++] = W;
									else {
										if (W === 16) {
											for (G = Ve + 2; C < G;) {
												if (ie === 0) break e;
												ie--, I += Q[n++] << C, C += 8;
											}
											if (I >>>= Ve, C -= Ve, k.have === 0) {
												F.msg = "invalid bit length repeat", k.mode = 30;
												break;
											}
											T = k.lens[k.have - 1], _e = 3 + (3 & I), I >>>= 2, C -= 2;
										} else if (W === 17) {
											for (G = Ve + 3; C < G;) {
												if (ie === 0) break e;
												ie--, I += Q[n++] << C, C += 8;
											}
											C -= Ve, T = 0, _e = 3 + (7 & (I >>>= Ve)), I >>>= 3, C -= 3;
										} else {
											for (G = Ve + 7; C < G;) {
												if (ie === 0) break e;
												ie--, I += Q[n++] << C, C += 8;
											}
											C -= Ve, T = 0, _e = 11 + (127 & (I >>>= Ve)), I >>>= 7, C -= 7;
										}
										if (k.have + _e > k.nlen + k.ndist) {
											F.msg = "invalid bit length repeat", k.mode = 30;
											break;
										}
										for (; _e--;) k.lens[k.have++] = T;
									}
								}
								if (k.mode === 30) break;
								if (k.lens[256] === 0) {
									F.msg = "invalid code -- missing end-of-block", k.mode = 30;
									break;
								}
								if (k.lenbits = 9, be = { bits: k.lenbits }, ke = o(v, k.lens, 0, k.nlen, k.lencode, 0, k.work, be), k.lenbits = be.bits, ke) {
									F.msg = "invalid literal/lengths set", k.mode = 30;
									break;
								}
								if (k.distbits = 6, k.distcode = k.distdyn, be = { bits: k.distbits }, ke = o(y, k.lens, k.nlen, k.ndist, k.distcode, 0, k.work, be), k.distbits = be.bits, ke) {
									F.msg = "invalid distances set", k.mode = 30;
									break;
								}
								if (k.mode = 20, K === 6) break e;
							case 20: k.mode = 21;
							case 21:
								if (6 <= ie && 258 <= ce) {
									F.next_out = s, F.avail_out = ce, F.next_in = n, F.avail_in = ie, k.hold = I, k.bits = C, i(F, ve), s = F.next_out, J = F.output, ce = F.avail_out, n = F.next_in, Q = F.input, ie = F.avail_in, I = k.hold, C = k.bits, k.mode === 12 && (k.back = -1);
									break;
								}
								for (k.back = 0; at = (z = k.lencode[I & (1 << k.lenbits) - 1]) >>> 16 & 255, W = 65535 & z, !((Ve = z >>> 24) <= C);) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								if (at && (240 & at) == 0) {
									for (Dt = Ve, Lt = at, kt = W; at = (z = k.lencode[kt + ((I & (1 << Dt + Lt) - 1) >> Dt)]) >>> 16 & 255, W = 65535 & z, !(Dt + (Ve = z >>> 24) <= C);) {
										if (ie === 0) break e;
										ie--, I += Q[n++] << C, C += 8;
									}
									I >>>= Dt, C -= Dt, k.back += Dt;
								}
								if (I >>>= Ve, C -= Ve, k.back += Ve, k.length = W, at === 0) {
									k.mode = 26;
									break;
								}
								if (32 & at) {
									k.back = -1, k.mode = 12;
									break;
								}
								if (64 & at) {
									F.msg = "invalid literal/length code", k.mode = 30;
									break;
								}
								k.extra = 15 & at, k.mode = 22;
							case 22:
								if (k.extra) {
									for (G = k.extra; C < G;) {
										if (ie === 0) break e;
										ie--, I += Q[n++] << C, C += 8;
									}
									k.length += I & (1 << k.extra) - 1, I >>>= k.extra, C -= k.extra, k.back += k.extra;
								}
								k.was = k.length, k.mode = 23;
							case 23:
								for (; at = (z = k.distcode[I & (1 << k.distbits) - 1]) >>> 16 & 255, W = 65535 & z, !((Ve = z >>> 24) <= C);) {
									if (ie === 0) break e;
									ie--, I += Q[n++] << C, C += 8;
								}
								if ((240 & at) == 0) {
									for (Dt = Ve, Lt = at, kt = W; at = (z = k.distcode[kt + ((I & (1 << Dt + Lt) - 1) >> Dt)]) >>> 16 & 255, W = 65535 & z, !(Dt + (Ve = z >>> 24) <= C);) {
										if (ie === 0) break e;
										ie--, I += Q[n++] << C, C += 8;
									}
									I >>>= Dt, C -= Dt, k.back += Dt;
								}
								if (I >>>= Ve, C -= Ve, k.back += Ve, 64 & at) {
									F.msg = "invalid distance code", k.mode = 30;
									break;
								}
								k.offset = W, k.extra = 15 & at, k.mode = 24;
							case 24:
								if (k.extra) {
									for (G = k.extra; C < G;) {
										if (ie === 0) break e;
										ie--, I += Q[n++] << C, C += 8;
									}
									k.offset += I & (1 << k.extra) - 1, I >>>= k.extra, C -= k.extra, k.back += k.extra;
								}
								if (k.offset > k.dmax) {
									F.msg = "invalid distance too far back", k.mode = 30;
									break;
								}
								k.mode = 25;
							case 25:
								if (ce === 0) break e;
								if (_e = ve - ce, k.offset > _e) {
									if ((_e = k.offset - _e) > k.whave && k.sane) {
										F.msg = "invalid distance too far back", k.mode = 30;
										break;
									}
									Ye = _e > k.wnext ? (_e -= k.wnext, k.wsize - _e) : k.wnext - _e, _e > k.length && (_e = k.length), Je = k.window;
								} else Je = J, Ye = s - k.offset, _e = k.length;
								for (ce < _e && (_e = ce), ce -= _e, k.length -= _e; J[s++] = Je[Ye++], --_e;);
								k.length === 0 && (k.mode = 21);
								break;
							case 26:
								if (ce === 0) break e;
								J[s++] = k.length, ce--, k.mode = 21;
								break;
							case 27:
								if (k.wrap) {
									for (; C < 32;) {
										if (ie === 0) break e;
										ie--, I |= Q[n++] << C, C += 8;
									}
									if (ve -= ce, F.total_out += ve, k.total += ve, ve && (F.adler = k.check = k.flags ? a(k.check, J, ve, s - ve) : l(k.check, J, ve, s - ve)), ve = ce, (k.flags ? I : D(I)) !== k.check) {
										F.msg = "incorrect data check", k.mode = 30;
										break;
									}
									C = I = 0;
								}
								k.mode = 28;
							case 28:
								if (k.wrap && k.flags) {
									for (; C < 32;) {
										if (ie === 0) break e;
										ie--, I += Q[n++] << C, C += 8;
									}
									if (I !== (4294967295 & k.total)) {
										F.msg = "incorrect length check", k.mode = 30;
										break;
									}
									C = I = 0;
								}
								k.mode = 29;
							case 29:
								ke = 1;
								break e;
							case 30:
								ke = -3;
								break e;
							case 31: return -4;
							default: return g;
						}
						return F.next_out = s, F.avail_out = ce, F.next_in = n, F.avail_in = ie, k.hold = I, k.bits = C, (k.wsize || ve !== F.avail_out && k.mode < 30 && (k.mode < 27 || K !== 4)) && V(F, F.output, F.next_out, ve - F.avail_out) ? (k.mode = 31, -4) : (Y -= F.avail_in, ve -= F.avail_out, F.total_in += Y, F.total_out += ve, k.total += ve, k.wrap && ve && (F.adler = k.check = k.flags ? a(k.check, J, ve, F.next_out - ve) : l(k.check, J, ve, F.next_out - ve)), F.data_type = k.bits + (k.last ? 64 : 0) + (k.mode === 12 ? 128 : 0) + (k.mode === 20 || k.mode === 15 ? 256 : 0), (Y == 0 && ve === 0 || K === 4) && ke === _ && (ke = -5), ke);
					}, f.inflateEnd = function(F) {
						if (!F || !F.state) return g;
						var K = F.state;
						return K.window && (K.window = null), F.state = null, _;
					}, f.inflateGetHeader = function(F, K) {
						var k;
						return F && F.state ? (2 & (k = F.state).wrap) == 0 ? g : ((k.head = K).done = !1, _) : g;
					}, f.inflateSetDictionary = function(F, K) {
						var k, Q = K.length;
						return F && F.state ? (k = F.state).wrap !== 0 && k.mode !== 11 ? g : k.mode === 11 && l(1, K, Q, 0) !== k.check ? -3 : V(F, K, Q, Q) ? (k.mode = 31, -4) : (k.havedict = 1, _) : g;
					}, f.inflateInfo = "pako inflate (from Nodeca project)";
				}, {
					"../utils/common": 41,
					"./adler32": 43,
					"./crc32": 45,
					"./inffast": 48,
					"./inftrees": 50
				}],
				50: [function(t, U, f) {
					"use strict";
					var r = t("../utils/common"), l = [
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
					], a = [
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
					], i = [
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
					], o = [
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
					U.exports = function(v, y, _, g, p, m, u, D) {
						var h, c, b, L, S, R, P, M, ee, V = D.bits, F = 0, K = 0, k = 0, Q = 0, J = 0, n = 0, s = 0, ie = 0, ce = 0, I = 0, C = null, Y = 0, ve = new r.Buf16(16), _e = new r.Buf16(16), Ye = null, Je = 0;
						for (F = 0; F <= 15; F++) ve[F] = 0;
						for (K = 0; K < g; K++) ve[y[_ + K]]++;
						for (J = V, Q = 15; 1 <= Q && ve[Q] === 0; Q--);
						if (Q < J && (J = Q), Q === 0) return p[m++] = 20971520, p[m++] = 20971520, D.bits = 1, 0;
						for (k = 1; k < Q && ve[k] === 0; k++);
						for (J < k && (J = k), F = ie = 1; F <= 15; F++) if (ie <<= 1, (ie -= ve[F]) < 0) return -1;
						if (0 < ie && (v === 0 || Q !== 1)) return -1;
						for (_e[1] = 0, F = 1; F < 15; F++) _e[F + 1] = _e[F] + ve[F];
						for (K = 0; K < g; K++) y[_ + K] !== 0 && (u[_e[y[_ + K]]++] = K);
						if (R = v === 0 ? (C = Ye = u, 19) : v === 1 ? (C = l, Y -= 257, Ye = a, Je -= 257, 256) : (C = i, Ye = o, -1), F = k, S = m, s = K = I = 0, b = -1, L = (ce = 1 << (n = J)) - 1, v === 1 && 852 < ce || v === 2 && 592 < ce) return 1;
						for (;;) {
							for (P = F - s, ee = u[K] < R ? (M = 0, u[K]) : u[K] > R ? (M = Ye[Je + u[K]], C[Y + u[K]]) : (M = 96, 0), h = 1 << F - s, k = c = 1 << n; p[S + (I >> s) + (c -= h)] = P << 24 | M << 16 | ee | 0, c !== 0;);
							for (h = 1 << F - 1; I & h;) h >>= 1;
							if (h !== 0 ? (I &= h - 1, I += h) : I = 0, K++, --ve[F] == 0) {
								if (F === Q) break;
								F = y[_ + u[K]];
							}
							if (J < F && (I & L) !== b) {
								for (s === 0 && (s = J), S += k, ie = 1 << (n = F - s); n + s < Q && !((ie -= ve[n + s]) <= 0);) n++, ie <<= 1;
								if (ce += 1 << n, v === 1 && 852 < ce || v === 2 && 592 < ce) return 1;
								p[b = I & L] = J << 24 | n << 16 | S - m | 0;
							}
						}
						return I !== 0 && (p[S + I] = F - s << 24 | 4194304), D.bits = J, 0;
					};
				}, { "../utils/common": 41 }],
				51: [function(t, U, f) {
					"use strict";
					U.exports = {
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
				52: [function(t, U, f) {
					"use strict";
					var r = t("../utils/common"), l = 0, a = 1;
					function i(z) {
						for (var se = z.length; 0 <= --se;) z[se] = 0;
					}
					var o = 0, v = 29, y = 256, _ = y + 1 + v, g = 30, p = 19, m = 2 * _ + 1, u = 15, D = 16, h = 7, c = 256, b = 16, L = 17, S = 18, R = [
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
					], P = [
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
					], M = [
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
					], ee = [
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
					], V = new Array(2 * (_ + 2));
					i(V);
					var F = new Array(2 * g);
					i(F);
					var K = new Array(512);
					i(K);
					var k = new Array(256);
					i(k);
					var Q = new Array(v);
					i(Q);
					var J, n, s, ie = new Array(g);
					function ce(z, se, We, Ce, pe) {
						this.static_tree = z, this.extra_bits = se, this.extra_base = We, this.elems = Ce, this.max_length = pe, this.has_stree = z && z.length;
					}
					function I(z, se) {
						this.dyn_tree = z, this.max_code = 0, this.stat_desc = se;
					}
					function C(z) {
						return z < 256 ? K[z] : K[256 + (z >>> 7)];
					}
					function Y(z, se) {
						z.pending_buf[z.pending++] = 255 & se, z.pending_buf[z.pending++] = se >>> 8 & 255;
					}
					function ve(z, se, We) {
						z.bi_valid > D - We ? (z.bi_buf |= se << z.bi_valid & 65535, Y(z, z.bi_buf), z.bi_buf = se >> D - z.bi_valid, z.bi_valid += We - D) : (z.bi_buf |= se << z.bi_valid & 65535, z.bi_valid += We);
					}
					function _e(z, se, We) {
						ve(z, We[2 * se], We[2 * se + 1]);
					}
					function Ye(z, se) {
						for (var We = 0; We |= 1 & z, z >>>= 1, We <<= 1, 0 < --se;);
						return We >>> 1;
					}
					function Je(z, se, We) {
						var Ce, pe, He = new Array(u + 1), tt = 0;
						for (Ce = 1; Ce <= u; Ce++) He[Ce] = tt = tt + We[Ce - 1] << 1;
						for (pe = 0; pe <= se; pe++) {
							var $e = z[2 * pe + 1];
							$e !== 0 && (z[2 * pe] = Ye(He[$e]++, $e));
						}
					}
					function Ve(z) {
						var se;
						for (se = 0; se < _; se++) z.dyn_ltree[2 * se] = 0;
						for (se = 0; se < g; se++) z.dyn_dtree[2 * se] = 0;
						for (se = 0; se < p; se++) z.bl_tree[2 * se] = 0;
						z.dyn_ltree[2 * c] = 1, z.opt_len = z.static_len = 0, z.last_lit = z.matches = 0;
					}
					function at(z) {
						8 < z.bi_valid ? Y(z, z.bi_buf) : 0 < z.bi_valid && (z.pending_buf[z.pending++] = z.bi_buf), z.bi_buf = 0, z.bi_valid = 0;
					}
					function W(z, se, We, Ce) {
						var pe = 2 * se, He = 2 * We;
						return z[pe] < z[He] || z[pe] === z[He] && Ce[se] <= Ce[We];
					}
					function Dt(z, se, We) {
						for (var Ce = z.heap[We], pe = We << 1; pe <= z.heap_len && (pe < z.heap_len && W(se, z.heap[pe + 1], z.heap[pe], z.depth) && pe++, !W(se, Ce, z.heap[pe], z.depth));) z.heap[We] = z.heap[pe], We = pe, pe <<= 1;
						z.heap[We] = Ce;
					}
					function Lt(z, se, We) {
						var Ce, pe, He, tt, $e = 0;
						if (z.last_lit !== 0) for (; Ce = z.pending_buf[z.d_buf + 2 * $e] << 8 | z.pending_buf[z.d_buf + 2 * $e + 1], pe = z.pending_buf[z.l_buf + $e], $e++, Ce === 0 ? _e(z, pe, se) : (_e(z, (He = k[pe]) + y + 1, se), (tt = R[He]) !== 0 && ve(z, pe -= Q[He], tt), _e(z, He = C(--Ce), We), (tt = P[He]) !== 0 && ve(z, Ce -= ie[He], tt)), $e < z.last_lit;);
						_e(z, c, se);
					}
					function kt(z, se) {
						var We, Ce, pe, He = se.dyn_tree, tt = se.stat_desc.static_tree, $e = se.stat_desc.has_stree, bt = se.stat_desc.elems, Pt = -1;
						for (z.heap_len = 0, z.heap_max = m, We = 0; We < bt; We++) He[2 * We] !== 0 ? (z.heap[++z.heap_len] = Pt = We, z.depth[We] = 0) : He[2 * We + 1] = 0;
						for (; z.heap_len < 2;) He[2 * (pe = z.heap[++z.heap_len] = Pt < 2 ? ++Pt : 0)] = 1, z.depth[pe] = 0, z.opt_len--, $e && (z.static_len -= tt[2 * pe + 1]);
						for (se.max_code = Pt, We = z.heap_len >> 1; 1 <= We; We--) Dt(z, He, We);
						for (pe = bt; We = z.heap[1], z.heap[1] = z.heap[z.heap_len--], Dt(z, He, 1), Ce = z.heap[1], z.heap[--z.heap_max] = We, z.heap[--z.heap_max] = Ce, He[2 * pe] = He[2 * We] + He[2 * Ce], z.depth[pe] = (z.depth[We] >= z.depth[Ce] ? z.depth[We] : z.depth[Ce]) + 1, He[2 * We + 1] = He[2 * Ce + 1] = pe, z.heap[1] = pe++, Dt(z, He, 1), 2 <= z.heap_len;);
						z.heap[--z.heap_max] = z.heap[1], (function(Bt, Ja) {
							var oi, ja, H, ze, Qe, oe, Fe = Ja.dyn_tree, E = Ja.max_code, Oe = Ja.stat_desc.static_tree, w = Ja.stat_desc.has_stree, re = Ja.stat_desc.extra_bits, Ne = Ja.stat_desc.extra_base, B = Ja.stat_desc.max_length, Se = 0;
							for (ze = 0; ze <= u; ze++) Bt.bl_count[ze] = 0;
							for (Fe[2 * Bt.heap[Bt.heap_max] + 1] = 0, oi = Bt.heap_max + 1; oi < m; oi++) B < (ze = Fe[2 * Fe[2 * (ja = Bt.heap[oi]) + 1] + 1] + 1) && (ze = B, Se++), Fe[2 * ja + 1] = ze, E < ja || (Bt.bl_count[ze]++, Qe = 0, Ne <= ja && (Qe = re[ja - Ne]), oe = Fe[2 * ja], Bt.opt_len += oe * (ze + Qe), w && (Bt.static_len += oe * (Oe[2 * ja + 1] + Qe)));
							if (Se !== 0) {
								do {
									for (ze = B - 1; Bt.bl_count[ze] === 0;) ze--;
									Bt.bl_count[ze]--, Bt.bl_count[ze + 1] += 2, Bt.bl_count[B]--, Se -= 2;
								} while (0 < Se);
								for (ze = B; ze !== 0; ze--) for (ja = Bt.bl_count[ze]; ja !== 0;) E < (H = Bt.heap[--oi]) || (Fe[2 * H + 1] !== ze && (Bt.opt_len += (ze - Fe[2 * H + 1]) * Fe[2 * H], Fe[2 * H + 1] = ze), ja--);
							}
						})(z, se), Je(He, Pt, z.bl_count);
					}
					function T(z, se, We) {
						var Ce, pe, He = -1, tt = se[1], $e = 0, bt = 7, Pt = 4;
						for (tt === 0 && (bt = 138, Pt = 3), se[2 * (We + 1) + 1] = 65535, Ce = 0; Ce <= We; Ce++) pe = tt, tt = se[2 * (Ce + 1) + 1], ++$e < bt && pe === tt || ($e < Pt ? z.bl_tree[2 * pe] += $e : pe !== 0 ? (pe !== He && z.bl_tree[2 * pe]++, z.bl_tree[2 * b]++) : $e <= 10 ? z.bl_tree[2 * L]++ : z.bl_tree[2 * S]++, He = pe, Pt = ($e = 0) === tt ? (bt = 138, 3) : pe === tt ? (bt = 6, 3) : (bt = 7, 4));
					}
					function ke(z, se, We) {
						var Ce, pe, He = -1, tt = se[1], $e = 0, bt = 7, Pt = 4;
						for (tt === 0 && (bt = 138, Pt = 3), Ce = 0; Ce <= We; Ce++) if (pe = tt, tt = se[2 * (Ce + 1) + 1], !(++$e < bt && pe === tt)) {
							if ($e < Pt) for (; _e(z, pe, z.bl_tree), --$e != 0;);
							else pe !== 0 ? (pe !== He && (_e(z, pe, z.bl_tree), $e--), _e(z, b, z.bl_tree), ve(z, $e - 3, 2)) : $e <= 10 ? (_e(z, L, z.bl_tree), ve(z, $e - 3, 3)) : (_e(z, S, z.bl_tree), ve(z, $e - 11, 7));
							He = pe, Pt = ($e = 0) === tt ? (bt = 138, 3) : pe === tt ? (bt = 6, 3) : (bt = 7, 4);
						}
					}
					i(ie);
					var be = !1;
					function G(z, se, We, Ce) {
						ve(z, (o << 1) + (Ce ? 1 : 0), 3), (function(pe, He, tt, $e) {
							at(pe), $e && (Y(pe, tt), Y(pe, ~tt)), r.arraySet(pe.pending_buf, pe.window, He, tt, pe.pending), pe.pending += tt;
						})(z, se, We, !0);
					}
					f._tr_init = function(z) {
						be || ((function() {
							var se, We, Ce, pe, He, tt = new Array(u + 1);
							for (pe = Ce = 0; pe < v - 1; pe++) for (Q[pe] = Ce, se = 0; se < 1 << R[pe]; se++) k[Ce++] = pe;
							for (k[Ce - 1] = pe, pe = He = 0; pe < 16; pe++) for (ie[pe] = He, se = 0; se < 1 << P[pe]; se++) K[He++] = pe;
							for (He >>= 7; pe < g; pe++) for (ie[pe] = He << 7, se = 0; se < 1 << P[pe] - 7; se++) K[256 + He++] = pe;
							for (We = 0; We <= u; We++) tt[We] = 0;
							for (se = 0; se <= 143;) V[2 * se + 1] = 8, se++, tt[8]++;
							for (; se <= 255;) V[2 * se + 1] = 9, se++, tt[9]++;
							for (; se <= 279;) V[2 * se + 1] = 7, se++, tt[7]++;
							for (; se <= 287;) V[2 * se + 1] = 8, se++, tt[8]++;
							for (Je(V, _ + 1, tt), se = 0; se < g; se++) F[2 * se + 1] = 5, F[2 * se] = Ye(se, 5);
							J = new ce(V, R, y + 1, _, u), n = new ce(F, P, 0, g, u), s = new ce(new Array(0), M, 0, p, h);
						})(), be = !0), z.l_desc = new I(z.dyn_ltree, J), z.d_desc = new I(z.dyn_dtree, n), z.bl_desc = new I(z.bl_tree, s), z.bi_buf = 0, z.bi_valid = 0, Ve(z);
					}, f._tr_stored_block = G, f._tr_flush_block = function(z, se, We, Ce) {
						var pe, He, tt = 0;
						0 < z.level ? (z.strm.data_type === 2 && (z.strm.data_type = (function($e) {
							var bt, Pt = 4093624447;
							for (bt = 0; bt <= 31; bt++, Pt >>>= 1) if (1 & Pt && $e.dyn_ltree[2 * bt] !== 0) return l;
							if ($e.dyn_ltree[18] !== 0 || $e.dyn_ltree[20] !== 0 || $e.dyn_ltree[26] !== 0) return a;
							for (bt = 32; bt < y; bt++) if ($e.dyn_ltree[2 * bt] !== 0) return a;
							return l;
						})(z)), kt(z, z.l_desc), kt(z, z.d_desc), tt = (function($e) {
							var bt;
							for (T($e, $e.dyn_ltree, $e.l_desc.max_code), T($e, $e.dyn_dtree, $e.d_desc.max_code), kt($e, $e.bl_desc), bt = p - 1; 3 <= bt && $e.bl_tree[2 * ee[bt] + 1] === 0; bt--);
							return $e.opt_len += 3 * (bt + 1) + 5 + 5 + 4, bt;
						})(z), pe = z.opt_len + 3 + 7 >>> 3, (He = z.static_len + 3 + 7 >>> 3) <= pe && (pe = He)) : pe = He = We + 5, We + 4 <= pe && se !== -1 ? G(z, se, We, Ce) : z.strategy === 4 || He === pe ? (ve(z, 2 + (Ce ? 1 : 0), 3), Lt(z, V, F)) : (ve(z, 4 + (Ce ? 1 : 0), 3), (function($e, bt, Pt, Bt) {
							var Ja;
							for (ve($e, bt - 257, 5), ve($e, Pt - 1, 5), ve($e, Bt - 4, 4), Ja = 0; Ja < Bt; Ja++) ve($e, $e.bl_tree[2 * ee[Ja] + 1], 3);
							ke($e, $e.dyn_ltree, bt - 1), ke($e, $e.dyn_dtree, Pt - 1);
						})(z, z.l_desc.max_code + 1, z.d_desc.max_code + 1, tt + 1), Lt(z, z.dyn_ltree, z.dyn_dtree)), Ve(z), Ce && at(z);
					}, f._tr_tally = function(z, se, We) {
						return z.pending_buf[z.d_buf + 2 * z.last_lit] = se >>> 8 & 255, z.pending_buf[z.d_buf + 2 * z.last_lit + 1] = 255 & se, z.pending_buf[z.l_buf + z.last_lit] = 255 & We, z.last_lit++, se === 0 ? z.dyn_ltree[2 * We]++ : (z.matches++, se--, z.dyn_ltree[2 * (k[We] + y + 1)]++, z.dyn_dtree[2 * C(se)]++), z.last_lit === z.lit_bufsize - 1;
					}, f._tr_align = function(z) {
						ve(z, 2, 3), _e(z, c, V), (function(se) {
							se.bi_valid === 16 ? (Y(se, se.bi_buf), se.bi_buf = 0, se.bi_valid = 0) : 8 <= se.bi_valid && (se.pending_buf[se.pending++] = 255 & se.bi_buf, se.bi_buf >>= 8, se.bi_valid -= 8);
						})(z);
					};
				}, { "../utils/common": 41 }],
				53: [function(t, U, f) {
					"use strict";
					U.exports = function() {
						this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
					};
				}, {}],
				54: [function(t, U, f) {
					(function(r) {
						(function(l, a) {
							"use strict";
							if (!l.setImmediate) {
								var i, o, v, y, _ = 1, g = {}, p = !1, m = l.document, u = Object.getPrototypeOf && Object.getPrototypeOf(l);
								u = u && u.setTimeout ? u : l, i = {}.toString.call(l.process) === "[object process]" ? function(b) {
									process.nextTick(function() {
										h(b);
									});
								} : (function() {
									if (l.postMessage && !l.importScripts) {
										var b = !0, L = l.onmessage;
										return l.onmessage = function() {
											b = !1;
										}, l.postMessage("", "*"), l.onmessage = L, b;
									}
								})() ? (y = "setImmediate$" + Math.random() + "$", l.addEventListener ? l.addEventListener("message", c, !1) : l.attachEvent("onmessage", c), function(b) {
									l.postMessage(y + b, "*");
								}) : l.MessageChannel ? ((v = new MessageChannel()).port1.onmessage = function(b) {
									h(b.data);
								}, function(b) {
									v.port2.postMessage(b);
								}) : m && "onreadystatechange" in m.createElement("script") ? (o = m.documentElement, function(b) {
									var L = m.createElement("script");
									L.onreadystatechange = function() {
										h(b), L.onreadystatechange = null, o.removeChild(L), L = null;
									}, o.appendChild(L);
								}) : function(b) {
									setTimeout(h, 0, b);
								}, u.setImmediate = function(b) {
									typeof b != "function" && (b = new Function("" + b));
									for (var L = new Array(arguments.length - 1), S = 0; S < L.length; S++) L[S] = arguments[S + 1];
									return g[_] = {
										callback: b,
										args: L
									}, i(_), _++;
								}, u.clearImmediate = D;
							}
							function D(b) {
								delete g[b];
							}
							function h(b) {
								if (p) setTimeout(h, 0, b);
								else {
									var L = g[b];
									if (L) {
										p = !0;
										try {
											(function(S) {
												var R = S.callback, P = S.args;
												switch (P.length) {
													case 0:
														R();
														break;
													case 1:
														R(P[0]);
														break;
													case 2:
														R(P[0], P[1]);
														break;
													case 3:
														R(P[0], P[1], P[2]);
														break;
													default: R.apply(a, P);
												}
											})(L);
										} finally {
											D(b), p = !1;
										}
									}
								}
							}
							function c(b) {
								b.source === l && typeof b.data == "string" && b.data.indexOf(y) === 0 && h(+b.data.slice(y.length));
							}
						})(typeof self > "u" ? r === void 0 ? this : r : self);
					}).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
				}, {}]
			}, {}, [10])(10);
		});
	}), Nf = di((e) => {
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
	}), Hf = di((e) => {
		"use strict";
		var d = e && e.__importDefault || function(p) {
			return p && p.__esModule ? p : { default: p };
		};
		Object.defineProperty(e, "__esModule", { value: !0 }), e.hex = e.dec = e.codePoint = void 0;
		var t = d(Nf()), U = {}, f = String.fromCodePoint ? String.fromCodePoint : g;
		for (i = 0, o = t.default; i < o.length; i++) r = o[i], l = parseInt(r["Unicode dec"], 10), a = {
			codePoint: l,
			string: f(l)
		}, U[r["Typeface name"].toUpperCase() + "_" + r["Dingbat dec"]] = a;
		var r, l, a, i, o;
		function v(p, m) {
			return U[p.toUpperCase() + "_" + m];
		}
		e.codePoint = v;
		function y(p, m) {
			return v(p, parseInt(m, 10));
		}
		e.dec = y;
		function _(p, m) {
			return v(p, parseInt(m, 16));
		}
		e.hex = _;
		function g(p) {
			if (p <= 65535) return String.fromCharCode(p);
			var m = Math.floor((p - 65536) / 1024) + 55296, u = (p - 65536) % 1024 + 56320;
			return String.fromCharCode(m, u);
		}
	}), zr = di((e) => {
		"use strict";
		var d = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
		function t(r, l) {
			return Object.prototype.hasOwnProperty.call(r, l);
		}
		e.assign = function(r) {
			for (var l = Array.prototype.slice.call(arguments, 1); l.length;) {
				var a = l.shift();
				if (a) {
					if (typeof a != "object") throw new TypeError(a + "must be non-object");
					for (var i in a) t(a, i) && (r[i] = a[i]);
				}
			}
			return r;
		}, e.shrinkBuf = function(r, l) {
			return r.length === l ? r : r.subarray ? r.subarray(0, l) : (r.length = l, r);
		};
		var U = {
			arraySet: function(r, l, a, i, o) {
				if (l.subarray && r.subarray) {
					r.set(l.subarray(a, a + i), o);
					return;
				}
				for (var v = 0; v < i; v++) r[o + v] = l[a + v];
			},
			flattenChunks: function(r) {
				var l, a, i, o, v, y;
				for (i = 0, l = 0, a = r.length; l < a; l++) i += r[l].length;
				for (y = new Uint8Array(i), o = 0, l = 0, a = r.length; l < a; l++) v = r[l], y.set(v, o), o += v.length;
				return y;
			}
		}, f = {
			arraySet: function(r, l, a, i, o) {
				for (var v = 0; v < i; v++) r[o + v] = l[a + v];
			},
			flattenChunks: function(r) {
				return [].concat.apply([], r);
			}
		};
		e.setTyped = function(r) {
			r ? (e.Buf8 = Uint8Array, e.Buf16 = Uint16Array, e.Buf32 = Int32Array, e.assign(e, U)) : (e.Buf8 = Array, e.Buf16 = Array, e.Buf32 = Array, e.assign(e, f));
		}, e.setTyped(d);
	}), Zf = di((e) => {
		"use strict";
		var d = zr(), t = 4, U = 0, f = 1, r = 2;
		function l(H) {
			for (var ze = H.length; --ze >= 0;) H[ze] = 0;
		}
		var a = 0, i = 1, o = 2, v = 3, y = 258, _ = 29, g = 256, p = g + 1 + _, m = 30, u = 19, D = 2 * p + 1, h = 15, c = 16, b = 7, L = 256, S = 16, R = 17, P = 18, M = [
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
		], ee = [
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
		], V = [
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
		], F = [
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
		], K = 512, k = new Array((p + 2) * 2);
		l(k);
		var Q = new Array(m * 2);
		l(Q);
		var J = new Array(K);
		l(J);
		var n = new Array(y - v + 1);
		l(n);
		var s = new Array(_);
		l(s);
		var ie = new Array(m);
		l(ie);
		function ce(H, ze, Qe, oe, Fe) {
			this.static_tree = H, this.extra_bits = ze, this.extra_base = Qe, this.elems = oe, this.max_length = Fe, this.has_stree = H && H.length;
		}
		var I, C, Y;
		function ve(H, ze) {
			this.dyn_tree = H, this.max_code = 0, this.stat_desc = ze;
		}
		function _e(H) {
			return H < 256 ? J[H] : J[256 + (H >>> 7)];
		}
		function Ye(H, ze) {
			H.pending_buf[H.pending++] = ze & 255, H.pending_buf[H.pending++] = ze >>> 8 & 255;
		}
		function Je(H, ze, Qe) {
			H.bi_valid > c - Qe ? (H.bi_buf |= ze << H.bi_valid & 65535, Ye(H, H.bi_buf), H.bi_buf = ze >> c - H.bi_valid, H.bi_valid += Qe - c) : (H.bi_buf |= ze << H.bi_valid & 65535, H.bi_valid += Qe);
		}
		function Ve(H, ze, Qe) {
			Je(H, Qe[ze * 2], Qe[ze * 2 + 1]);
		}
		function at(H, ze) {
			var Qe = 0;
			do
				Qe |= H & 1, H >>>= 1, Qe <<= 1;
			while (--ze > 0);
			return Qe >>> 1;
		}
		function W(H) {
			H.bi_valid === 16 ? (Ye(H, H.bi_buf), H.bi_buf = 0, H.bi_valid = 0) : H.bi_valid >= 8 && (H.pending_buf[H.pending++] = H.bi_buf & 255, H.bi_buf >>= 8, H.bi_valid -= 8);
		}
		function Dt(H, ze) {
			var Qe = ze.dyn_tree, oe = ze.max_code, Fe = ze.stat_desc.static_tree, E = ze.stat_desc.has_stree, Oe = ze.stat_desc.extra_bits, w = ze.stat_desc.extra_base, re = ze.stat_desc.max_length, Ne, B, Se, fe, ge, gt, zt = 0;
			for (fe = 0; fe <= h; fe++) H.bl_count[fe] = 0;
			for (Qe[H.heap[H.heap_max] * 2 + 1] = 0, Ne = H.heap_max + 1; Ne < D; Ne++) B = H.heap[Ne], fe = Qe[Qe[B * 2 + 1] * 2 + 1] + 1, fe > re && (fe = re, zt++), Qe[B * 2 + 1] = fe, !(B > oe) && (H.bl_count[fe]++, ge = 0, B >= w && (ge = Oe[B - w]), gt = Qe[B * 2], H.opt_len += gt * (fe + ge), E && (H.static_len += gt * (Fe[B * 2 + 1] + ge)));
			if (zt !== 0) {
				do {
					for (fe = re - 1; H.bl_count[fe] === 0;) fe--;
					H.bl_count[fe]--, H.bl_count[fe + 1] += 2, H.bl_count[re]--, zt -= 2;
				} while (zt > 0);
				for (fe = re; fe !== 0; fe--) for (B = H.bl_count[fe]; B !== 0;) Se = H.heap[--Ne], !(Se > oe) && (Qe[Se * 2 + 1] !== fe && (H.opt_len += (fe - Qe[Se * 2 + 1]) * Qe[Se * 2], Qe[Se * 2 + 1] = fe), B--);
			}
		}
		function Lt(H, ze, Qe) {
			var oe = new Array(h + 1), Fe = 0, E, Oe;
			for (E = 1; E <= h; E++) oe[E] = Fe = Fe + Qe[E - 1] << 1;
			for (Oe = 0; Oe <= ze; Oe++) {
				var w = H[Oe * 2 + 1];
				w !== 0 && (H[Oe * 2] = at(oe[w]++, w));
			}
		}
		function kt() {
			var H, ze, Qe, oe, Fe, E = new Array(h + 1);
			for (Qe = 0, oe = 0; oe < _ - 1; oe++) for (s[oe] = Qe, H = 0; H < 1 << M[oe]; H++) n[Qe++] = oe;
			for (n[Qe - 1] = oe, Fe = 0, oe = 0; oe < 16; oe++) for (ie[oe] = Fe, H = 0; H < 1 << ee[oe]; H++) J[Fe++] = oe;
			for (Fe >>= 7; oe < m; oe++) for (ie[oe] = Fe << 7, H = 0; H < 1 << ee[oe] - 7; H++) J[256 + Fe++] = oe;
			for (ze = 0; ze <= h; ze++) E[ze] = 0;
			for (H = 0; H <= 143;) k[H * 2 + 1] = 8, H++, E[8]++;
			for (; H <= 255;) k[H * 2 + 1] = 9, H++, E[9]++;
			for (; H <= 279;) k[H * 2 + 1] = 7, H++, E[7]++;
			for (; H <= 287;) k[H * 2 + 1] = 8, H++, E[8]++;
			for (Lt(k, p + 1, E), H = 0; H < m; H++) Q[H * 2 + 1] = 5, Q[H * 2] = at(H, 5);
			I = new ce(k, M, g + 1, p, h), C = new ce(Q, ee, 0, m, h), Y = new ce(new Array(0), V, 0, u, b);
		}
		function T(H) {
			var ze;
			for (ze = 0; ze < p; ze++) H.dyn_ltree[ze * 2] = 0;
			for (ze = 0; ze < m; ze++) H.dyn_dtree[ze * 2] = 0;
			for (ze = 0; ze < u; ze++) H.bl_tree[ze * 2] = 0;
			H.dyn_ltree[L * 2] = 1, H.opt_len = H.static_len = 0, H.last_lit = H.matches = 0;
		}
		function ke(H) {
			H.bi_valid > 8 ? Ye(H, H.bi_buf) : H.bi_valid > 0 && (H.pending_buf[H.pending++] = H.bi_buf), H.bi_buf = 0, H.bi_valid = 0;
		}
		function be(H, ze, Qe, oe) {
			ke(H), oe && (Ye(H, Qe), Ye(H, ~Qe)), d.arraySet(H.pending_buf, H.window, ze, Qe, H.pending), H.pending += Qe;
		}
		function G(H, ze, Qe, oe) {
			var Fe = ze * 2, E = Qe * 2;
			return H[Fe] < H[E] || H[Fe] === H[E] && oe[ze] <= oe[Qe];
		}
		function z(H, ze, Qe) {
			for (var oe = H.heap[Qe], Fe = Qe << 1; Fe <= H.heap_len && (Fe < H.heap_len && G(ze, H.heap[Fe + 1], H.heap[Fe], H.depth) && Fe++, !G(ze, oe, H.heap[Fe], H.depth));) H.heap[Qe] = H.heap[Fe], Qe = Fe, Fe <<= 1;
			H.heap[Qe] = oe;
		}
		function se(H, ze, Qe) {
			var oe, Fe, E = 0, Oe, w;
			if (H.last_lit !== 0) do
				oe = H.pending_buf[H.d_buf + E * 2] << 8 | H.pending_buf[H.d_buf + E * 2 + 1], Fe = H.pending_buf[H.l_buf + E], E++, oe === 0 ? Ve(H, Fe, ze) : (Oe = n[Fe], Ve(H, Oe + g + 1, ze), w = M[Oe], w !== 0 && (Fe -= s[Oe], Je(H, Fe, w)), oe--, Oe = _e(oe), Ve(H, Oe, Qe), w = ee[Oe], w !== 0 && (oe -= ie[Oe], Je(H, oe, w)));
			while (E < H.last_lit);
			Ve(H, L, ze);
		}
		function We(H, ze) {
			var Qe = ze.dyn_tree, oe = ze.stat_desc.static_tree, Fe = ze.stat_desc.has_stree, E = ze.stat_desc.elems, Oe, w, re = -1, Ne;
			for (H.heap_len = 0, H.heap_max = D, Oe = 0; Oe < E; Oe++) Qe[Oe * 2] !== 0 ? (H.heap[++H.heap_len] = re = Oe, H.depth[Oe] = 0) : Qe[Oe * 2 + 1] = 0;
			for (; H.heap_len < 2;) Ne = H.heap[++H.heap_len] = re < 2 ? ++re : 0, Qe[Ne * 2] = 1, H.depth[Ne] = 0, H.opt_len--, Fe && (H.static_len -= oe[Ne * 2 + 1]);
			for (ze.max_code = re, Oe = H.heap_len >> 1; Oe >= 1; Oe--) z(H, Qe, Oe);
			Ne = E;
			do
				Oe = H.heap[1], H.heap[1] = H.heap[H.heap_len--], z(H, Qe, 1), w = H.heap[1], H.heap[--H.heap_max] = Oe, H.heap[--H.heap_max] = w, Qe[Ne * 2] = Qe[Oe * 2] + Qe[w * 2], H.depth[Ne] = (H.depth[Oe] >= H.depth[w] ? H.depth[Oe] : H.depth[w]) + 1, Qe[Oe * 2 + 1] = Qe[w * 2 + 1] = Ne, H.heap[1] = Ne++, z(H, Qe, 1);
			while (H.heap_len >= 2);
			H.heap[--H.heap_max] = H.heap[1], Dt(H, ze), Lt(Qe, re, H.bl_count);
		}
		function Ce(H, ze, Qe) {
			var oe, Fe = -1, E, Oe = ze[1], w = 0, re = 7, Ne = 4;
			for (Oe === 0 && (re = 138, Ne = 3), ze[(Qe + 1) * 2 + 1] = 65535, oe = 0; oe <= Qe; oe++) E = Oe, Oe = ze[(oe + 1) * 2 + 1], !(++w < re && E === Oe) && (w < Ne ? H.bl_tree[E * 2] += w : E !== 0 ? (E !== Fe && H.bl_tree[E * 2]++, H.bl_tree[S * 2]++) : w <= 10 ? H.bl_tree[R * 2]++ : H.bl_tree[P * 2]++, w = 0, Fe = E, Oe === 0 ? (re = 138, Ne = 3) : E === Oe ? (re = 6, Ne = 3) : (re = 7, Ne = 4));
		}
		function pe(H, ze, Qe) {
			var oe, Fe = -1, E, Oe = ze[1], w = 0, re = 7, Ne = 4;
			for (Oe === 0 && (re = 138, Ne = 3), oe = 0; oe <= Qe; oe++) if (E = Oe, Oe = ze[(oe + 1) * 2 + 1], !(++w < re && E === Oe)) {
				if (w < Ne) do
					Ve(H, E, H.bl_tree);
				while (--w !== 0);
				else E !== 0 ? (E !== Fe && (Ve(H, E, H.bl_tree), w--), Ve(H, S, H.bl_tree), Je(H, w - 3, 2)) : w <= 10 ? (Ve(H, R, H.bl_tree), Je(H, w - 3, 3)) : (Ve(H, P, H.bl_tree), Je(H, w - 11, 7));
				w = 0, Fe = E, Oe === 0 ? (re = 138, Ne = 3) : E === Oe ? (re = 6, Ne = 3) : (re = 7, Ne = 4);
			}
		}
		function He(H) {
			var ze;
			for (Ce(H, H.dyn_ltree, H.l_desc.max_code), Ce(H, H.dyn_dtree, H.d_desc.max_code), We(H, H.bl_desc), ze = u - 1; ze >= 3 && H.bl_tree[F[ze] * 2 + 1] === 0; ze--);
			return H.opt_len += 3 * (ze + 1) + 5 + 5 + 4, ze;
		}
		function tt(H, ze, Qe, oe) {
			var Fe;
			for (Je(H, ze - 257, 5), Je(H, Qe - 1, 5), Je(H, oe - 4, 4), Fe = 0; Fe < oe; Fe++) Je(H, H.bl_tree[F[Fe] * 2 + 1], 3);
			pe(H, H.dyn_ltree, ze - 1), pe(H, H.dyn_dtree, Qe - 1);
		}
		function $e(H) {
			var ze = 4093624447, Qe;
			for (Qe = 0; Qe <= 31; Qe++, ze >>>= 1) if (ze & 1 && H.dyn_ltree[Qe * 2] !== 0) return U;
			if (H.dyn_ltree[18] !== 0 || H.dyn_ltree[20] !== 0 || H.dyn_ltree[26] !== 0) return f;
			for (Qe = 32; Qe < g; Qe++) if (H.dyn_ltree[Qe * 2] !== 0) return f;
			return U;
		}
		var bt = !1;
		function Pt(H) {
			bt || (kt(), bt = !0), H.l_desc = new ve(H.dyn_ltree, I), H.d_desc = new ve(H.dyn_dtree, C), H.bl_desc = new ve(H.bl_tree, Y), H.bi_buf = 0, H.bi_valid = 0, T(H);
		}
		function Bt(H, ze, Qe, oe) {
			Je(H, (a << 1) + (oe ? 1 : 0), 3), be(H, ze, Qe, !0);
		}
		function Ja(H) {
			Je(H, i << 1, 3), Ve(H, L, k), W(H);
		}
		function oi(H, ze, Qe, oe) {
			var Fe, E, Oe = 0;
			H.level > 0 ? (H.strm.data_type === r && (H.strm.data_type = $e(H)), We(H, H.l_desc), We(H, H.d_desc), Oe = He(H), Fe = H.opt_len + 3 + 7 >>> 3, E = H.static_len + 3 + 7 >>> 3, E <= Fe && (Fe = E)) : Fe = E = Qe + 5, Qe + 4 <= Fe && ze !== -1 ? Bt(H, ze, Qe, oe) : H.strategy === t || E === Fe ? (Je(H, (i << 1) + (oe ? 1 : 0), 3), se(H, k, Q)) : (Je(H, (o << 1) + (oe ? 1 : 0), 3), tt(H, H.l_desc.max_code + 1, H.d_desc.max_code + 1, Oe + 1), se(H, H.dyn_ltree, H.dyn_dtree)), T(H), oe && ke(H);
		}
		function ja(H, ze, Qe) {
			return H.pending_buf[H.d_buf + H.last_lit * 2] = ze >>> 8 & 255, H.pending_buf[H.d_buf + H.last_lit * 2 + 1] = ze & 255, H.pending_buf[H.l_buf + H.last_lit] = Qe & 255, H.last_lit++, ze === 0 ? H.dyn_ltree[Qe * 2]++ : (H.matches++, ze--, H.dyn_ltree[(n[Qe] + g + 1) * 2]++, H.dyn_dtree[_e(ze) * 2]++), H.last_lit === H.lit_bufsize - 1;
		}
		e._tr_init = Pt, e._tr_stored_block = Bt, e._tr_flush_block = oi, e._tr_tally = ja, e._tr_align = Ja;
	}), jh = di((e, d) => {
		"use strict";
		function t(U, f, r, l) {
			for (var a = U & 65535 | 0, i = U >>> 16 & 65535 | 0, o = 0; r !== 0;) {
				o = r > 2e3 ? 2e3 : r, r -= o;
				do
					a = a + f[l++] | 0, i = i + a | 0;
				while (--o);
				a %= 65521, i %= 65521;
			}
			return a | i << 16 | 0;
		}
		d.exports = t;
	}), Gh = di((e, d) => {
		"use strict";
		function t() {
			for (var r, l = [], a = 0; a < 256; a++) {
				r = a;
				for (var i = 0; i < 8; i++) r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
				l[a] = r;
			}
			return l;
		}
		var U = t();
		function f(r, l, a, i) {
			var o = U, v = i + a;
			r ^= -1;
			for (var y = i; y < v; y++) r = r >>> 8 ^ o[(r ^ l[y]) & 255];
			return r ^ -1;
		}
		d.exports = f;
	}), g1 = di((e, d) => {
		"use strict";
		d.exports = {
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
	}), Xf = di((e) => {
		"use strict";
		var d = zr(), t = Zf(), U = jh(), f = Gh(), r = g1(), l = 0, a = 1, i = 3, o = 4, v = 5, y = 0, _ = 1, g = -2, p = -3, m = -5, u = -1, D = 1, h = 2, c = 3, b = 4, L = 0, S = 2, R = 8, P = 9, M = 15, ee = 8, V = 286, F = 30, K = 19, k = 2 * V + 1, Q = 15, J = 3, n = 258, s = n + J + 1, ie = 32, ce = 42, I = 69, C = 73, Y = 91, ve = 103, _e = 113, Ye = 666, Je = 1, Ve = 2, at = 3, W = 4, Dt = 3;
		function Lt(w, re) {
			return w.msg = r[re], re;
		}
		function kt(w) {
			return (w << 1) - (w > 4 ? 9 : 0);
		}
		function T(w) {
			for (var re = w.length; --re >= 0;) w[re] = 0;
		}
		function ke(w) {
			var re = w.state, Ne = re.pending;
			Ne > w.avail_out && (Ne = w.avail_out), Ne !== 0 && (d.arraySet(w.output, re.pending_buf, re.pending_out, Ne, w.next_out), w.next_out += Ne, re.pending_out += Ne, w.total_out += Ne, w.avail_out -= Ne, re.pending -= Ne, re.pending === 0 && (re.pending_out = 0));
		}
		function be(w, re) {
			t._tr_flush_block(w, w.block_start >= 0 ? w.block_start : -1, w.strstart - w.block_start, re), w.block_start = w.strstart, ke(w.strm);
		}
		function G(w, re) {
			w.pending_buf[w.pending++] = re;
		}
		function z(w, re) {
			w.pending_buf[w.pending++] = re >>> 8 & 255, w.pending_buf[w.pending++] = re & 255;
		}
		function se(w, re, Ne, B) {
			var Se = w.avail_in;
			return Se > B && (Se = B), Se === 0 ? 0 : (w.avail_in -= Se, d.arraySet(re, w.input, w.next_in, Se, Ne), w.state.wrap === 1 ? w.adler = U(w.adler, re, Se, Ne) : w.state.wrap === 2 && (w.adler = f(w.adler, re, Se, Ne)), w.next_in += Se, w.total_in += Se, Se);
		}
		function We(w, re) {
			var Ne = w.max_chain_length, B = w.strstart, Se, fe, ge = w.prev_length, gt = w.nice_match, zt = w.strstart > w.w_size - s ? w.strstart - (w.w_size - s) : 0, qe = w.window, va = w.w_mask, Ga = w.prev, ea = w.strstart + n, oa = qe[B + ge - 1], Ka = qe[B + ge];
			w.prev_length >= w.good_match && (Ne >>= 2), gt > w.lookahead && (gt = w.lookahead);
			do
				if (Se = re, !(qe[Se + ge] !== Ka || qe[Se + ge - 1] !== oa || qe[Se] !== qe[B] || qe[++Se] !== qe[B + 1])) {
					B += 2, Se++;
					do					;
while (qe[++B] === qe[++Se] && qe[++B] === qe[++Se] && qe[++B] === qe[++Se] && qe[++B] === qe[++Se] && qe[++B] === qe[++Se] && qe[++B] === qe[++Se] && qe[++B] === qe[++Se] && qe[++B] === qe[++Se] && B < ea);
					if (fe = n - (ea - B), B = ea - n, fe > ge) {
						if (w.match_start = re, ge = fe, fe >= gt) break;
						oa = qe[B + ge - 1], Ka = qe[B + ge];
					}
				}
			while ((re = Ga[re & va]) > zt && --Ne !== 0);
			return ge <= w.lookahead ? ge : w.lookahead;
		}
		function Ce(w) {
			var re = w.w_size, Ne, B, Se, fe, ge;
			do {
				if (fe = w.window_size - w.lookahead - w.strstart, w.strstart >= re + (re - s)) {
					d.arraySet(w.window, w.window, re, re, 0), w.match_start -= re, w.strstart -= re, w.block_start -= re, B = w.hash_size, Ne = B;
					do
						Se = w.head[--Ne], w.head[Ne] = Se >= re ? Se - re : 0;
					while (--B);
					B = re, Ne = B;
					do
						Se = w.prev[--Ne], w.prev[Ne] = Se >= re ? Se - re : 0;
					while (--B);
					fe += re;
				}
				if (w.strm.avail_in === 0) break;
				if (B = se(w.strm, w.window, w.strstart + w.lookahead, fe), w.lookahead += B, w.lookahead + w.insert >= J) for (ge = w.strstart - w.insert, w.ins_h = w.window[ge], w.ins_h = (w.ins_h << w.hash_shift ^ w.window[ge + 1]) & w.hash_mask; w.insert && (w.ins_h = (w.ins_h << w.hash_shift ^ w.window[ge + J - 1]) & w.hash_mask, w.prev[ge & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = ge, ge++, w.insert--, !(w.lookahead + w.insert < J)););
			} while (w.lookahead < s && w.strm.avail_in !== 0);
		}
		function pe(w, re) {
			var Ne = 65535;
			for (Ne > w.pending_buf_size - 5 && (Ne = w.pending_buf_size - 5);;) {
				if (w.lookahead <= 1) {
					if (Ce(w), w.lookahead === 0 && re === l) return Je;
					if (w.lookahead === 0) break;
				}
				w.strstart += w.lookahead, w.lookahead = 0;
				var B = w.block_start + Ne;
				if ((w.strstart === 0 || w.strstart >= B) && (w.lookahead = w.strstart - B, w.strstart = B, be(w, !1), w.strm.avail_out === 0) || w.strstart - w.block_start >= w.w_size - s && (be(w, !1), w.strm.avail_out === 0)) return Je;
			}
			return w.insert = 0, re === o ? (be(w, !0), w.strm.avail_out === 0 ? at : W) : (w.strstart > w.block_start && (be(w, !1), w.strm.avail_out), Je);
		}
		function He(w, re) {
			for (var Ne, B;;) {
				if (w.lookahead < s) {
					if (Ce(w), w.lookahead < s && re === l) return Je;
					if (w.lookahead === 0) break;
				}
				if (Ne = 0, w.lookahead >= J && (w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + J - 1]) & w.hash_mask, Ne = w.prev[w.strstart & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = w.strstart), Ne !== 0 && w.strstart - Ne <= w.w_size - s && (w.match_length = We(w, Ne)), w.match_length >= J) if (B = t._tr_tally(w, w.strstart - w.match_start, w.match_length - J), w.lookahead -= w.match_length, w.match_length <= w.max_lazy_match && w.lookahead >= J) {
					w.match_length--;
					do
						w.strstart++, w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + J - 1]) & w.hash_mask, Ne = w.prev[w.strstart & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = w.strstart;
					while (--w.match_length !== 0);
					w.strstart++;
				} else w.strstart += w.match_length, w.match_length = 0, w.ins_h = w.window[w.strstart], w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + 1]) & w.hash_mask;
				else B = t._tr_tally(w, 0, w.window[w.strstart]), w.lookahead--, w.strstart++;
				if (B && (be(w, !1), w.strm.avail_out === 0)) return Je;
			}
			return w.insert = w.strstart < J - 1 ? w.strstart : J - 1, re === o ? (be(w, !0), w.strm.avail_out === 0 ? at : W) : w.last_lit && (be(w, !1), w.strm.avail_out === 0) ? Je : Ve;
		}
		function tt(w, re) {
			for (var Ne, B, Se;;) {
				if (w.lookahead < s) {
					if (Ce(w), w.lookahead < s && re === l) return Je;
					if (w.lookahead === 0) break;
				}
				if (Ne = 0, w.lookahead >= J && (w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + J - 1]) & w.hash_mask, Ne = w.prev[w.strstart & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = w.strstart), w.prev_length = w.match_length, w.prev_match = w.match_start, w.match_length = J - 1, Ne !== 0 && w.prev_length < w.max_lazy_match && w.strstart - Ne <= w.w_size - s && (w.match_length = We(w, Ne), w.match_length <= 5 && (w.strategy === D || w.match_length === J && w.strstart - w.match_start > 4096) && (w.match_length = J - 1)), w.prev_length >= J && w.match_length <= w.prev_length) {
					Se = w.strstart + w.lookahead - J, B = t._tr_tally(w, w.strstart - 1 - w.prev_match, w.prev_length - J), w.lookahead -= w.prev_length - 1, w.prev_length -= 2;
					do
						++w.strstart <= Se && (w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + J - 1]) & w.hash_mask, Ne = w.prev[w.strstart & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = w.strstart);
					while (--w.prev_length !== 0);
					if (w.match_available = 0, w.match_length = J - 1, w.strstart++, B && (be(w, !1), w.strm.avail_out === 0)) return Je;
				} else if (w.match_available) {
					if (B = t._tr_tally(w, 0, w.window[w.strstart - 1]), B && be(w, !1), w.strstart++, w.lookahead--, w.strm.avail_out === 0) return Je;
				} else w.match_available = 1, w.strstart++, w.lookahead--;
			}
			return w.match_available && (B = t._tr_tally(w, 0, w.window[w.strstart - 1]), w.match_available = 0), w.insert = w.strstart < J - 1 ? w.strstart : J - 1, re === o ? (be(w, !0), w.strm.avail_out === 0 ? at : W) : w.last_lit && (be(w, !1), w.strm.avail_out === 0) ? Je : Ve;
		}
		function $e(w, re) {
			for (var Ne, B, Se, fe, ge = w.window;;) {
				if (w.lookahead <= n) {
					if (Ce(w), w.lookahead <= n && re === l) return Je;
					if (w.lookahead === 0) break;
				}
				if (w.match_length = 0, w.lookahead >= J && w.strstart > 0 && (Se = w.strstart - 1, B = ge[Se], B === ge[++Se] && B === ge[++Se] && B === ge[++Se])) {
					fe = w.strstart + n;
					do					;
while (B === ge[++Se] && B === ge[++Se] && B === ge[++Se] && B === ge[++Se] && B === ge[++Se] && B === ge[++Se] && B === ge[++Se] && B === ge[++Se] && Se < fe);
					w.match_length = n - (fe - Se), w.match_length > w.lookahead && (w.match_length = w.lookahead);
				}
				if (w.match_length >= J ? (Ne = t._tr_tally(w, 1, w.match_length - J), w.lookahead -= w.match_length, w.strstart += w.match_length, w.match_length = 0) : (Ne = t._tr_tally(w, 0, w.window[w.strstart]), w.lookahead--, w.strstart++), Ne && (be(w, !1), w.strm.avail_out === 0)) return Je;
			}
			return w.insert = 0, re === o ? (be(w, !0), w.strm.avail_out === 0 ? at : W) : w.last_lit && (be(w, !1), w.strm.avail_out === 0) ? Je : Ve;
		}
		function bt(w, re) {
			for (var Ne;;) {
				if (w.lookahead === 0 && (Ce(w), w.lookahead === 0)) {
					if (re === l) return Je;
					break;
				}
				if (w.match_length = 0, Ne = t._tr_tally(w, 0, w.window[w.strstart]), w.lookahead--, w.strstart++, Ne && (be(w, !1), w.strm.avail_out === 0)) return Je;
			}
			return w.insert = 0, re === o ? (be(w, !0), w.strm.avail_out === 0 ? at : W) : w.last_lit && (be(w, !1), w.strm.avail_out === 0) ? Je : Ve;
		}
		function Pt(w, re, Ne, B, Se) {
			this.good_length = w, this.max_lazy = re, this.nice_length = Ne, this.max_chain = B, this.func = Se;
		}
		var Bt = [
			new Pt(0, 0, 0, 0, pe),
			new Pt(4, 4, 8, 4, He),
			new Pt(4, 5, 16, 8, He),
			new Pt(4, 6, 32, 32, He),
			new Pt(4, 4, 16, 16, tt),
			new Pt(8, 16, 32, 32, tt),
			new Pt(8, 16, 128, 128, tt),
			new Pt(8, 32, 128, 256, tt),
			new Pt(32, 128, 258, 1024, tt),
			new Pt(32, 258, 258, 4096, tt)
		];
		function Ja(w) {
			w.window_size = 2 * w.w_size, T(w.head), w.max_lazy_match = Bt[w.level].max_lazy, w.good_match = Bt[w.level].good_length, w.nice_match = Bt[w.level].nice_length, w.max_chain_length = Bt[w.level].max_chain, w.strstart = 0, w.block_start = 0, w.lookahead = 0, w.insert = 0, w.match_length = w.prev_length = J - 1, w.match_available = 0, w.ins_h = 0;
		}
		function oi() {
			this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = R, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new d.Buf16(k * 2), this.dyn_dtree = new d.Buf16((2 * F + 1) * 2), this.bl_tree = new d.Buf16((2 * K + 1) * 2), T(this.dyn_ltree), T(this.dyn_dtree), T(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new d.Buf16(Q + 1), this.heap = new d.Buf16(2 * V + 1), T(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new d.Buf16(2 * V + 1), T(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
		}
		function ja(w) {
			var re;
			return !w || !w.state ? Lt(w, g) : (w.total_in = w.total_out = 0, w.data_type = S, re = w.state, re.pending = 0, re.pending_out = 0, re.wrap < 0 && (re.wrap = -re.wrap), re.status = re.wrap ? ce : _e, w.adler = re.wrap === 2 ? 0 : 1, re.last_flush = l, t._tr_init(re), y);
		}
		function H(w) {
			var re = ja(w);
			return re === y && Ja(w.state), re;
		}
		function ze(w, re) {
			return !w || !w.state || w.state.wrap !== 2 ? g : (w.state.gzhead = re, y);
		}
		function Qe(w, re, Ne, B, Se, fe) {
			if (!w) return g;
			var ge = 1;
			if (re === u && (re = 6), B < 0 ? (ge = 0, B = -B) : B > 15 && (ge = 2, B -= 16), Se < 1 || Se > P || Ne !== R || B < 8 || B > 15 || re < 0 || re > 9 || fe < 0 || fe > b) return Lt(w, g);
			B === 8 && (B = 9);
			var gt = new oi();
			return w.state = gt, gt.strm = w, gt.wrap = ge, gt.gzhead = null, gt.w_bits = B, gt.w_size = 1 << gt.w_bits, gt.w_mask = gt.w_size - 1, gt.hash_bits = Se + 7, gt.hash_size = 1 << gt.hash_bits, gt.hash_mask = gt.hash_size - 1, gt.hash_shift = ~~((gt.hash_bits + J - 1) / J), gt.window = new d.Buf8(gt.w_size * 2), gt.head = new d.Buf16(gt.hash_size), gt.prev = new d.Buf16(gt.w_size), gt.lit_bufsize = 1 << Se + 6, gt.pending_buf_size = gt.lit_bufsize * 4, gt.pending_buf = new d.Buf8(gt.pending_buf_size), gt.d_buf = 1 * gt.lit_bufsize, gt.l_buf = 3 * gt.lit_bufsize, gt.level = re, gt.strategy = fe, gt.method = Ne, H(w);
		}
		function oe(w, re) {
			return Qe(w, re, R, M, ee, L);
		}
		function Fe(w, re) {
			var Ne, B, Se, fe;
			if (!w || !w.state || re > v || re < 0) return w ? Lt(w, g) : g;
			if (B = w.state, !w.output || !w.input && w.avail_in !== 0 || B.status === Ye && re !== o) return Lt(w, w.avail_out === 0 ? m : g);
			if (B.strm = w, Ne = B.last_flush, B.last_flush = re, B.status === ce) if (B.wrap === 2) w.adler = 0, G(B, 31), G(B, 139), G(B, 8), B.gzhead ? (G(B, (B.gzhead.text ? 1 : 0) + (B.gzhead.hcrc ? 2 : 0) + (B.gzhead.extra ? 4 : 0) + (B.gzhead.name ? 8 : 0) + (B.gzhead.comment ? 16 : 0)), G(B, B.gzhead.time & 255), G(B, B.gzhead.time >> 8 & 255), G(B, B.gzhead.time >> 16 & 255), G(B, B.gzhead.time >> 24 & 255), G(B, B.level === 9 ? 2 : B.strategy >= h || B.level < 2 ? 4 : 0), G(B, B.gzhead.os & 255), B.gzhead.extra && B.gzhead.extra.length && (G(B, B.gzhead.extra.length & 255), G(B, B.gzhead.extra.length >> 8 & 255)), B.gzhead.hcrc && (w.adler = f(w.adler, B.pending_buf, B.pending, 0)), B.gzindex = 0, B.status = I) : (G(B, 0), G(B, 0), G(B, 0), G(B, 0), G(B, 0), G(B, B.level === 9 ? 2 : B.strategy >= h || B.level < 2 ? 4 : 0), G(B, Dt), B.status = _e);
			else {
				var ge = R + (B.w_bits - 8 << 4) << 8, gt = -1;
				B.strategy >= h || B.level < 2 ? gt = 0 : B.level < 6 ? gt = 1 : B.level === 6 ? gt = 2 : gt = 3, ge |= gt << 6, B.strstart !== 0 && (ge |= ie), ge += 31 - ge % 31, B.status = _e, z(B, ge), B.strstart !== 0 && (z(B, w.adler >>> 16), z(B, w.adler & 65535)), w.adler = 1;
			}
			if (B.status === I) if (B.gzhead.extra) {
				for (Se = B.pending; B.gzindex < (B.gzhead.extra.length & 65535) && !(B.pending === B.pending_buf_size && (B.gzhead.hcrc && B.pending > Se && (w.adler = f(w.adler, B.pending_buf, B.pending - Se, Se)), ke(w), Se = B.pending, B.pending === B.pending_buf_size));) G(B, B.gzhead.extra[B.gzindex] & 255), B.gzindex++;
				B.gzhead.hcrc && B.pending > Se && (w.adler = f(w.adler, B.pending_buf, B.pending - Se, Se)), B.gzindex === B.gzhead.extra.length && (B.gzindex = 0, B.status = C);
			} else B.status = C;
			if (B.status === C) if (B.gzhead.name) {
				Se = B.pending;
				do {
					if (B.pending === B.pending_buf_size && (B.gzhead.hcrc && B.pending > Se && (w.adler = f(w.adler, B.pending_buf, B.pending - Se, Se)), ke(w), Se = B.pending, B.pending === B.pending_buf_size)) {
						fe = 1;
						break;
					}
					B.gzindex < B.gzhead.name.length ? fe = B.gzhead.name.charCodeAt(B.gzindex++) & 255 : fe = 0, G(B, fe);
				} while (fe !== 0);
				B.gzhead.hcrc && B.pending > Se && (w.adler = f(w.adler, B.pending_buf, B.pending - Se, Se)), fe === 0 && (B.gzindex = 0, B.status = Y);
			} else B.status = Y;
			if (B.status === Y) if (B.gzhead.comment) {
				Se = B.pending;
				do {
					if (B.pending === B.pending_buf_size && (B.gzhead.hcrc && B.pending > Se && (w.adler = f(w.adler, B.pending_buf, B.pending - Se, Se)), ke(w), Se = B.pending, B.pending === B.pending_buf_size)) {
						fe = 1;
						break;
					}
					B.gzindex < B.gzhead.comment.length ? fe = B.gzhead.comment.charCodeAt(B.gzindex++) & 255 : fe = 0, G(B, fe);
				} while (fe !== 0);
				B.gzhead.hcrc && B.pending > Se && (w.adler = f(w.adler, B.pending_buf, B.pending - Se, Se)), fe === 0 && (B.status = ve);
			} else B.status = ve;
			if (B.status === ve && (B.gzhead.hcrc ? (B.pending + 2 > B.pending_buf_size && ke(w), B.pending + 2 <= B.pending_buf_size && (G(B, w.adler & 255), G(B, w.adler >> 8 & 255), w.adler = 0, B.status = _e)) : B.status = _e), B.pending !== 0) {
				if (ke(w), w.avail_out === 0) return B.last_flush = -1, y;
			} else if (w.avail_in === 0 && kt(re) <= kt(Ne) && re !== o) return Lt(w, m);
			if (B.status === Ye && w.avail_in !== 0) return Lt(w, m);
			if (w.avail_in !== 0 || B.lookahead !== 0 || re !== l && B.status !== Ye) {
				var zt = B.strategy === h ? bt(B, re) : B.strategy === c ? $e(B, re) : Bt[B.level].func(B, re);
				if ((zt === at || zt === W) && (B.status = Ye), zt === Je || zt === at) return w.avail_out === 0 && (B.last_flush = -1), y;
				if (zt === Ve && (re === a ? t._tr_align(B) : re !== v && (t._tr_stored_block(B, 0, 0, !1), re === i && (T(B.head), B.lookahead === 0 && (B.strstart = 0, B.block_start = 0, B.insert = 0))), ke(w), w.avail_out === 0)) return B.last_flush = -1, y;
			}
			return re !== o ? y : B.wrap <= 0 ? _ : (B.wrap === 2 ? (G(B, w.adler & 255), G(B, w.adler >> 8 & 255), G(B, w.adler >> 16 & 255), G(B, w.adler >> 24 & 255), G(B, w.total_in & 255), G(B, w.total_in >> 8 & 255), G(B, w.total_in >> 16 & 255), G(B, w.total_in >> 24 & 255)) : (z(B, w.adler >>> 16), z(B, w.adler & 65535)), ke(w), B.wrap > 0 && (B.wrap = -B.wrap), B.pending !== 0 ? y : _);
		}
		function E(w) {
			var re;
			return !w || !w.state ? g : (re = w.state.status, re !== ce && re !== I && re !== C && re !== Y && re !== ve && re !== _e && re !== Ye ? Lt(w, g) : (w.state = null, re === _e ? Lt(w, p) : y));
		}
		function Oe(w, re) {
			var Ne = re.length, B, Se, fe, ge, gt, zt, qe, va;
			if (!w || !w.state || (B = w.state, ge = B.wrap, ge === 2 || ge === 1 && B.status !== ce || B.lookahead)) return g;
			for (ge === 1 && (w.adler = U(w.adler, re, Ne, 0)), B.wrap = 0, Ne >= B.w_size && (ge === 0 && (T(B.head), B.strstart = 0, B.block_start = 0, B.insert = 0), va = new d.Buf8(B.w_size), d.arraySet(va, re, Ne - B.w_size, B.w_size, 0), re = va, Ne = B.w_size), gt = w.avail_in, zt = w.next_in, qe = w.input, w.avail_in = Ne, w.next_in = 0, w.input = re, Ce(B); B.lookahead >= J;) {
				Se = B.strstart, fe = B.lookahead - (J - 1);
				do
					B.ins_h = (B.ins_h << B.hash_shift ^ B.window[Se + J - 1]) & B.hash_mask, B.prev[Se & B.w_mask] = B.head[B.ins_h], B.head[B.ins_h] = Se, Se++;
				while (--fe);
				B.strstart = Se, B.lookahead = J - 1, Ce(B);
			}
			return B.strstart += B.lookahead, B.block_start = B.strstart, B.insert = B.lookahead, B.lookahead = 0, B.match_length = B.prev_length = J - 1, B.match_available = 0, w.next_in = zt, w.input = qe, w.avail_in = gt, B.wrap = ge, y;
		}
		e.deflateInit = oe, e.deflateInit2 = Qe, e.deflateReset = H, e.deflateResetKeep = ja, e.deflateSetHeader = ze, e.deflate = Fe, e.deflateEnd = E, e.deflateSetDictionary = Oe, e.deflateInfo = "pako deflate (from Nodeca project)";
	}), Nh = di((e) => {
		"use strict";
		var d = zr(), t = !0, U = !0;
		try {
			String.fromCharCode.apply(null, [0]);
		} catch {
			t = !1;
		}
		try {
			String.fromCharCode.apply(null, new Uint8Array(1));
		} catch {
			U = !1;
		}
		var f = new d.Buf8(256);
		for (r = 0; r < 256; r++) f[r] = r >= 252 ? 6 : r >= 248 ? 5 : r >= 240 ? 4 : r >= 224 ? 3 : r >= 192 ? 2 : 1;
		var r;
		f[254] = f[254] = 1, e.string2buf = function(a) {
			var i, o, v, y, _, g = a.length, p = 0;
			for (y = 0; y < g; y++) o = a.charCodeAt(y), (o & 64512) === 55296 && y + 1 < g && (v = a.charCodeAt(y + 1), (v & 64512) === 56320 && (o = 65536 + (o - 55296 << 10) + (v - 56320), y++)), p += o < 128 ? 1 : o < 2048 ? 2 : o < 65536 ? 3 : 4;
			for (i = new d.Buf8(p), _ = 0, y = 0; _ < p; y++) o = a.charCodeAt(y), (o & 64512) === 55296 && y + 1 < g && (v = a.charCodeAt(y + 1), (v & 64512) === 56320 && (o = 65536 + (o - 55296 << 10) + (v - 56320), y++)), o < 128 ? i[_++] = o : o < 2048 ? (i[_++] = 192 | o >>> 6, i[_++] = 128 | o & 63) : o < 65536 ? (i[_++] = 224 | o >>> 12, i[_++] = 128 | o >>> 6 & 63, i[_++] = 128 | o & 63) : (i[_++] = 240 | o >>> 18, i[_++] = 128 | o >>> 12 & 63, i[_++] = 128 | o >>> 6 & 63, i[_++] = 128 | o & 63);
			return i;
		};
		function l(a, i) {
			if (i < 65534 && (a.subarray && U || !a.subarray && t)) return String.fromCharCode.apply(null, d.shrinkBuf(a, i));
			for (var o = "", v = 0; v < i; v++) o += String.fromCharCode(a[v]);
			return o;
		}
		e.buf2binstring = function(a) {
			return l(a, a.length);
		}, e.binstring2buf = function(a) {
			for (var i = new d.Buf8(a.length), o = 0, v = i.length; o < v; o++) i[o] = a.charCodeAt(o);
			return i;
		}, e.buf2string = function(a, i) {
			var o, v, y, _, g = i || a.length, p = new Array(g * 2);
			for (v = 0, o = 0; o < g;) {
				if (y = a[o++], y < 128) {
					p[v++] = y;
					continue;
				}
				if (_ = f[y], _ > 4) {
					p[v++] = 65533, o += _ - 1;
					continue;
				}
				for (y &= _ === 2 ? 31 : _ === 3 ? 15 : 7; _ > 1 && o < g;) y = y << 6 | a[o++] & 63, _--;
				if (_ > 1) {
					p[v++] = 65533;
					continue;
				}
				y < 65536 ? p[v++] = y : (y -= 65536, p[v++] = 55296 | y >> 10 & 1023, p[v++] = 56320 | y & 1023);
			}
			return l(p, v);
		}, e.utf8border = function(a, i) {
			var o;
			for (i = i || a.length, i > a.length && (i = a.length), o = i - 1; o >= 0 && (a[o] & 192) === 128;) o--;
			return o < 0 || o === 0 ? i : o + f[a[o]] > i ? o : i;
		};
	}), Hh = di((e, d) => {
		"use strict";
		function t() {
			this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
		}
		d.exports = t;
	}), Jf = di((e) => {
		"use strict";
		var d = Xf(), t = zr(), U = Nh(), f = g1(), r = Hh(), l = Object.prototype.toString, a = 0, i = 4, o = 0, v = 1, y = 2, _ = -1, g = 0, p = 8;
		function m(c) {
			if (!(this instanceof m)) return new m(c);
			this.options = t.assign({
				level: _,
				method: p,
				chunkSize: 16384,
				windowBits: 15,
				memLevel: 8,
				strategy: g,
				to: ""
			}, c || {});
			var b = this.options;
			b.raw && b.windowBits > 0 ? b.windowBits = -b.windowBits : b.gzip && b.windowBits > 0 && b.windowBits < 16 && (b.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new r(), this.strm.avail_out = 0;
			var L = d.deflateInit2(this.strm, b.level, b.method, b.windowBits, b.memLevel, b.strategy);
			if (L !== o) throw new Error(f[L]);
			if (b.header && d.deflateSetHeader(this.strm, b.header), b.dictionary) {
				var S;
				if (typeof b.dictionary == "string" ? S = U.string2buf(b.dictionary) : l.call(b.dictionary) === "[object ArrayBuffer]" ? S = new Uint8Array(b.dictionary) : S = b.dictionary, L = d.deflateSetDictionary(this.strm, S), L !== o) throw new Error(f[L]);
				this._dict_set = !0;
			}
		}
		m.prototype.push = function(c, b) {
			var L = this.strm, S = this.options.chunkSize, R, P;
			if (this.ended) return !1;
			P = b === ~~b ? b : b === !0 ? i : a, typeof c == "string" ? L.input = U.string2buf(c) : l.call(c) === "[object ArrayBuffer]" ? L.input = new Uint8Array(c) : L.input = c, L.next_in = 0, L.avail_in = L.input.length;
			do {
				if (L.avail_out === 0 && (L.output = new t.Buf8(S), L.next_out = 0, L.avail_out = S), R = d.deflate(L, P), R !== v && R !== o) return this.onEnd(R), this.ended = !0, !1;
				(L.avail_out === 0 || L.avail_in === 0 && (P === i || P === y)) && (this.options.to === "string" ? this.onData(U.buf2binstring(t.shrinkBuf(L.output, L.next_out))) : this.onData(t.shrinkBuf(L.output, L.next_out)));
			} while ((L.avail_in > 0 || L.avail_out === 0) && R !== v);
			return P === i ? (R = d.deflateEnd(this.strm), this.onEnd(R), this.ended = !0, R === o) : (P === y && (this.onEnd(o), L.avail_out = 0), !0);
		}, m.prototype.onData = function(c) {
			this.chunks.push(c);
		}, m.prototype.onEnd = function(c) {
			c === o && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = t.flattenChunks(this.chunks)), this.chunks = [], this.err = c, this.msg = this.strm.msg;
		};
		function u(c, b) {
			var L = new m(b);
			if (L.push(c, !0), L.err) throw L.msg || f[L.err];
			return L.result;
		}
		function D(c, b) {
			return b = b || {}, b.raw = !0, u(c, b);
		}
		function h(c, b) {
			return b = b || {}, b.gzip = !0, u(c, b);
		}
		e.Deflate = m, e.deflate = u, e.deflateRaw = D, e.gzip = h;
	}), Yf = di((e, d) => {
		"use strict";
		var t = 30, U = 12;
		d.exports = function(f, r) {
			var l = f.state, a = f.next_in, i, o, v, y, _, g, p, m, u, D, h, c, b, L, S, R, P, M, ee, V, F, K = f.input, k;
			i = a + (f.avail_in - 5), o = f.next_out, k = f.output, v = o - (r - f.avail_out), y = o + (f.avail_out - 257), _ = l.dmax, g = l.wsize, p = l.whave, m = l.wnext, u = l.window, D = l.hold, h = l.bits, c = l.lencode, b = l.distcode, L = (1 << l.lenbits) - 1, S = (1 << l.distbits) - 1;
			e: do {
				h < 15 && (D += K[a++] << h, h += 8, D += K[a++] << h, h += 8), R = c[D & L];
				t: for (;;) {
					if (P = R >>> 24, D >>>= P, h -= P, P = R >>> 16 & 255, P === 0) k[o++] = R & 65535;
					else if (P & 16) {
						M = R & 65535, P &= 15, P && (h < P && (D += K[a++] << h, h += 8), M += D & (1 << P) - 1, D >>>= P, h -= P), h < 15 && (D += K[a++] << h, h += 8, D += K[a++] << h, h += 8), R = b[D & S];
						a: for (;;) {
							if (P = R >>> 24, D >>>= P, h -= P, P = R >>> 16 & 255, P & 16) {
								if (ee = R & 65535, P &= 15, h < P && (D += K[a++] << h, h += 8, h < P && (D += K[a++] << h, h += 8)), ee += D & (1 << P) - 1, ee > _) {
									f.msg = "invalid distance too far back", l.mode = t;
									break e;
								}
								if (D >>>= P, h -= P, P = o - v, ee > P) {
									if (P = ee - P, P > p && l.sane) {
										f.msg = "invalid distance too far back", l.mode = t;
										break e;
									}
									if (V = 0, F = u, m === 0) {
										if (V += g - P, P < M) {
											M -= P;
											do
												k[o++] = u[V++];
											while (--P);
											V = o - ee, F = k;
										}
									} else if (m < P) {
										if (V += g + m - P, P -= m, P < M) {
											M -= P;
											do
												k[o++] = u[V++];
											while (--P);
											if (V = 0, m < M) {
												P = m, M -= P;
												do
													k[o++] = u[V++];
												while (--P);
												V = o - ee, F = k;
											}
										}
									} else if (V += m - P, P < M) {
										M -= P;
										do
											k[o++] = u[V++];
										while (--P);
										V = o - ee, F = k;
									}
									for (; M > 2;) k[o++] = F[V++], k[o++] = F[V++], k[o++] = F[V++], M -= 3;
									M && (k[o++] = F[V++], M > 1 && (k[o++] = F[V++]));
								} else {
									V = o - ee;
									do
										k[o++] = k[V++], k[o++] = k[V++], k[o++] = k[V++], M -= 3;
									while (M > 2);
									M && (k[o++] = k[V++], M > 1 && (k[o++] = k[V++]));
								}
							} else if ((P & 64) === 0) {
								R = b[(R & 65535) + (D & (1 << P) - 1)];
								continue a;
							} else {
								f.msg = "invalid distance code", l.mode = t;
								break e;
							}
							break;
						}
					} else if ((P & 64) === 0) {
						R = c[(R & 65535) + (D & (1 << P) - 1)];
						continue t;
					} else if (P & 32) {
						l.mode = U;
						break e;
					} else {
						f.msg = "invalid literal/length code", l.mode = t;
						break e;
					}
					break;
				}
			} while (a < i && o < y);
			M = h >> 3, a -= M, h -= M << 3, D &= (1 << h) - 1, f.next_in = a, f.next_out = o, f.avail_in = a < i ? 5 + (i - a) : 5 - (a - i), f.avail_out = o < y ? 257 + (y - o) : 257 - (o - y), l.hold = D, l.bits = h;
		};
	}), $f = di((e, d) => {
		"use strict";
		var t = zr(), U = 15, f = 852, r = 592, l = 0, a = 1, i = 2, o = [
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
		], v = [
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
		], y = [
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
		], _ = [
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
		d.exports = function(g, p, m, u, D, h, c, b) {
			var L = b.bits, S = 0, R = 0, P = 0, M = 0, ee = 0, V = 0, F = 0, K = 0, k = 0, Q = 0, J, n, s, ie, ce, I = null, C = 0, Y, ve = new t.Buf16(U + 1), _e = new t.Buf16(U + 1), Ye = null, Je = 0, Ve, at, W;
			for (S = 0; S <= U; S++) ve[S] = 0;
			for (R = 0; R < u; R++) ve[p[m + R]]++;
			for (ee = L, M = U; M >= 1 && ve[M] === 0; M--);
			if (ee > M && (ee = M), M === 0) return D[h++] = 20971520, D[h++] = 20971520, b.bits = 1, 0;
			for (P = 1; P < M && ve[P] === 0; P++);
			for (ee < P && (ee = P), K = 1, S = 1; S <= U; S++) if (K <<= 1, K -= ve[S], K < 0) return -1;
			if (K > 0 && (g === l || M !== 1)) return -1;
			for (_e[1] = 0, S = 1; S < U; S++) _e[S + 1] = _e[S] + ve[S];
			for (R = 0; R < u; R++) p[m + R] !== 0 && (c[_e[p[m + R]]++] = R);
			if (g === l ? (I = Ye = c, Y = 19) : g === a ? (I = o, C -= 257, Ye = v, Je -= 257, Y = 256) : (I = y, Ye = _, Y = -1), Q = 0, R = 0, S = P, ce = h, V = ee, F = 0, s = -1, k = 1 << ee, ie = k - 1, g === a && k > f || g === i && k > r) return 1;
			for (;;) {
				Ve = S - F, c[R] < Y ? (at = 0, W = c[R]) : c[R] > Y ? (at = Ye[Je + c[R]], W = I[C + c[R]]) : (at = 96, W = 0), J = 1 << S - F, n = 1 << V, P = n;
				do
					n -= J, D[ce + (Q >> F) + n] = Ve << 24 | at << 16 | W | 0;
				while (n !== 0);
				for (J = 1 << S - 1; Q & J;) J >>= 1;
				if (J !== 0 ? (Q &= J - 1, Q += J) : Q = 0, R++, --ve[S] === 0) {
					if (S === M) break;
					S = p[m + c[R]];
				}
				if (S > ee && (Q & ie) !== s) {
					for (F === 0 && (F = ee), ce += P, V = S - F, K = 1 << V; V + F < M && (K -= ve[V + F], !(K <= 0));) V++, K <<= 1;
					if (k += 1 << V, g === a && k > f || g === i && k > r) return 1;
					s = Q & ie, D[s] = ee << 24 | V << 16 | ce - h | 0;
				}
			}
			return Q !== 0 && (D[ce + Q] = S - F << 24 | 4194304), b.bits = ee, 0;
		};
	}), qf = di((e) => {
		"use strict";
		var d = zr(), t = jh(), U = Gh(), f = Yf(), r = $f(), l = 0, a = 1, i = 2, o = 4, v = 5, y = 6, _ = 0, g = 1, p = 2, m = -2, u = -3, D = -4, h = -5, c = 8, b = 1, L = 2, S = 3, R = 4, P = 5, M = 6, ee = 7, V = 8, F = 9, K = 10, k = 11, Q = 12, J = 13, n = 14, s = 15, ie = 16, ce = 17, I = 18, C = 19, Y = 20, ve = 21, _e = 22, Ye = 23, Je = 24, Ve = 25, at = 26, W = 27, Dt = 28, Lt = 29, kt = 30, T = 31, ke = 32, be = 852, G = 592, z = 15;
		function se(oe) {
			return (oe >>> 24 & 255) + (oe >>> 8 & 65280) + ((oe & 65280) << 8) + ((oe & 255) << 24);
		}
		function We() {
			this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new d.Buf16(320), this.work = new d.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
		}
		function Ce(oe) {
			var Fe;
			return !oe || !oe.state ? m : (Fe = oe.state, oe.total_in = oe.total_out = Fe.total = 0, oe.msg = "", Fe.wrap && (oe.adler = Fe.wrap & 1), Fe.mode = b, Fe.last = 0, Fe.havedict = 0, Fe.dmax = 32768, Fe.head = null, Fe.hold = 0, Fe.bits = 0, Fe.lencode = Fe.lendyn = new d.Buf32(be), Fe.distcode = Fe.distdyn = new d.Buf32(G), Fe.sane = 1, Fe.back = -1, _);
		}
		function pe(oe) {
			var Fe;
			return !oe || !oe.state ? m : (Fe = oe.state, Fe.wsize = 0, Fe.whave = 0, Fe.wnext = 0, Ce(oe));
		}
		function He(oe, Fe) {
			var E, Oe;
			return !oe || !oe.state || (Oe = oe.state, Fe < 0 ? (E = 0, Fe = -Fe) : (E = (Fe >> 4) + 1, Fe < 48 && (Fe &= 15)), Fe && (Fe < 8 || Fe > 15)) ? m : (Oe.window !== null && Oe.wbits !== Fe && (Oe.window = null), Oe.wrap = E, Oe.wbits = Fe, pe(oe));
		}
		function tt(oe, Fe) {
			var E, Oe;
			return oe ? (Oe = new We(), oe.state = Oe, Oe.window = null, E = He(oe, Fe), E !== _ && (oe.state = null), E) : m;
		}
		function $e(oe) {
			return tt(oe, z);
		}
		var bt = !0, Pt, Bt;
		function Ja(oe) {
			if (bt) {
				var Fe;
				for (Pt = new d.Buf32(512), Bt = new d.Buf32(32), Fe = 0; Fe < 144;) oe.lens[Fe++] = 8;
				for (; Fe < 256;) oe.lens[Fe++] = 9;
				for (; Fe < 280;) oe.lens[Fe++] = 7;
				for (; Fe < 288;) oe.lens[Fe++] = 8;
				for (r(a, oe.lens, 0, 288, Pt, 0, oe.work, { bits: 9 }), Fe = 0; Fe < 32;) oe.lens[Fe++] = 5;
				r(i, oe.lens, 0, 32, Bt, 0, oe.work, { bits: 5 }), bt = !1;
			}
			oe.lencode = Pt, oe.lenbits = 9, oe.distcode = Bt, oe.distbits = 5;
		}
		function oi(oe, Fe, E, Oe) {
			var w, re = oe.state;
			return re.window === null && (re.wsize = 1 << re.wbits, re.wnext = 0, re.whave = 0, re.window = new d.Buf8(re.wsize)), Oe >= re.wsize ? (d.arraySet(re.window, Fe, E - re.wsize, re.wsize, 0), re.wnext = 0, re.whave = re.wsize) : (w = re.wsize - re.wnext, w > Oe && (w = Oe), d.arraySet(re.window, Fe, E - Oe, w, re.wnext), Oe -= w, Oe ? (d.arraySet(re.window, Fe, E - Oe, Oe, 0), re.wnext = Oe, re.whave = re.wsize) : (re.wnext += w, re.wnext === re.wsize && (re.wnext = 0), re.whave < re.wsize && (re.whave += w))), 0;
		}
		function ja(oe, Fe) {
			var E, Oe, w, re, Ne, B, Se, fe, ge, gt, zt, qe, va, Ga, ea = 0, oa, Ka, Qa, Ya, Z, ue, ei, Mi, ri = new d.Buf8(4), Di, Bi, Ei = [
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
			if (!oe || !oe.state || !oe.output || !oe.input && oe.avail_in !== 0) return m;
			E = oe.state, E.mode === Q && (E.mode = J), Ne = oe.next_out, w = oe.output, Se = oe.avail_out, re = oe.next_in, Oe = oe.input, B = oe.avail_in, fe = E.hold, ge = E.bits, gt = B, zt = Se, Mi = _;
			e: for (;;) switch (E.mode) {
				case b:
					if (E.wrap === 0) {
						E.mode = J;
						break;
					}
					for (; ge < 16;) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					if (E.wrap & 2 && fe === 35615) {
						E.check = 0, ri[0] = fe & 255, ri[1] = fe >>> 8 & 255, E.check = U(E.check, ri, 2, 0), fe = 0, ge = 0, E.mode = L;
						break;
					}
					if (E.flags = 0, E.head && (E.head.done = !1), !(E.wrap & 1) || (((fe & 255) << 8) + (fe >> 8)) % 31) {
						oe.msg = "incorrect header check", E.mode = kt;
						break;
					}
					if ((fe & 15) !== c) {
						oe.msg = "unknown compression method", E.mode = kt;
						break;
					}
					if (fe >>>= 4, ge -= 4, ei = (fe & 15) + 8, E.wbits === 0) E.wbits = ei;
					else if (ei > E.wbits) {
						oe.msg = "invalid window size", E.mode = kt;
						break;
					}
					E.dmax = 1 << ei, oe.adler = E.check = 1, E.mode = fe & 512 ? K : Q, fe = 0, ge = 0;
					break;
				case L:
					for (; ge < 16;) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					if (E.flags = fe, (E.flags & 255) !== c) {
						oe.msg = "unknown compression method", E.mode = kt;
						break;
					}
					if (E.flags & 57344) {
						oe.msg = "unknown header flags set", E.mode = kt;
						break;
					}
					E.head && (E.head.text = fe >> 8 & 1), E.flags & 512 && (ri[0] = fe & 255, ri[1] = fe >>> 8 & 255, E.check = U(E.check, ri, 2, 0)), fe = 0, ge = 0, E.mode = S;
				case S:
					for (; ge < 32;) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					E.head && (E.head.time = fe), E.flags & 512 && (ri[0] = fe & 255, ri[1] = fe >>> 8 & 255, ri[2] = fe >>> 16 & 255, ri[3] = fe >>> 24 & 255, E.check = U(E.check, ri, 4, 0)), fe = 0, ge = 0, E.mode = R;
				case R:
					for (; ge < 16;) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					E.head && (E.head.xflags = fe & 255, E.head.os = fe >> 8), E.flags & 512 && (ri[0] = fe & 255, ri[1] = fe >>> 8 & 255, E.check = U(E.check, ri, 2, 0)), fe = 0, ge = 0, E.mode = P;
				case P:
					if (E.flags & 1024) {
						for (; ge < 16;) {
							if (B === 0) break e;
							B--, fe += Oe[re++] << ge, ge += 8;
						}
						E.length = fe, E.head && (E.head.extra_len = fe), E.flags & 512 && (ri[0] = fe & 255, ri[1] = fe >>> 8 & 255, E.check = U(E.check, ri, 2, 0)), fe = 0, ge = 0;
					} else E.head && (E.head.extra = null);
					E.mode = M;
				case M:
					if (E.flags & 1024 && (qe = E.length, qe > B && (qe = B), qe && (E.head && (ei = E.head.extra_len - E.length, E.head.extra || (E.head.extra = new Array(E.head.extra_len)), d.arraySet(E.head.extra, Oe, re, qe, ei)), E.flags & 512 && (E.check = U(E.check, Oe, qe, re)), B -= qe, re += qe, E.length -= qe), E.length)) break e;
					E.length = 0, E.mode = ee;
				case ee:
					if (E.flags & 2048) {
						if (B === 0) break e;
						qe = 0;
						do
							ei = Oe[re + qe++], E.head && ei && E.length < 65536 && (E.head.name += String.fromCharCode(ei));
						while (ei && qe < B);
						if (E.flags & 512 && (E.check = U(E.check, Oe, qe, re)), B -= qe, re += qe, ei) break e;
					} else E.head && (E.head.name = null);
					E.length = 0, E.mode = V;
				case V:
					if (E.flags & 4096) {
						if (B === 0) break e;
						qe = 0;
						do
							ei = Oe[re + qe++], E.head && ei && E.length < 65536 && (E.head.comment += String.fromCharCode(ei));
						while (ei && qe < B);
						if (E.flags & 512 && (E.check = U(E.check, Oe, qe, re)), B -= qe, re += qe, ei) break e;
					} else E.head && (E.head.comment = null);
					E.mode = F;
				case F:
					if (E.flags & 512) {
						for (; ge < 16;) {
							if (B === 0) break e;
							B--, fe += Oe[re++] << ge, ge += 8;
						}
						if (fe !== (E.check & 65535)) {
							oe.msg = "header crc mismatch", E.mode = kt;
							break;
						}
						fe = 0, ge = 0;
					}
					E.head && (E.head.hcrc = E.flags >> 9 & 1, E.head.done = !0), oe.adler = E.check = 0, E.mode = Q;
					break;
				case K:
					for (; ge < 32;) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					oe.adler = E.check = se(fe), fe = 0, ge = 0, E.mode = k;
				case k:
					if (E.havedict === 0) return oe.next_out = Ne, oe.avail_out = Se, oe.next_in = re, oe.avail_in = B, E.hold = fe, E.bits = ge, p;
					oe.adler = E.check = 1, E.mode = Q;
				case Q: if (Fe === v || Fe === y) break e;
				case J:
					if (E.last) {
						fe >>>= ge & 7, ge -= ge & 7, E.mode = W;
						break;
					}
					for (; ge < 3;) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					switch (E.last = fe & 1, fe >>>= 1, ge -= 1, fe & 3) {
						case 0:
							E.mode = n;
							break;
						case 1:
							if (Ja(E), E.mode = Y, Fe === y) {
								fe >>>= 2, ge -= 2;
								break e;
							}
							break;
						case 2:
							E.mode = ce;
							break;
						case 3: oe.msg = "invalid block type", E.mode = kt;
					}
					fe >>>= 2, ge -= 2;
					break;
				case n:
					for (fe >>>= ge & 7, ge -= ge & 7; ge < 32;) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					if ((fe & 65535) !== (fe >>> 16 ^ 65535)) {
						oe.msg = "invalid stored block lengths", E.mode = kt;
						break;
					}
					if (E.length = fe & 65535, fe = 0, ge = 0, E.mode = s, Fe === y) break e;
				case s: E.mode = ie;
				case ie:
					if (qe = E.length, qe) {
						if (qe > B && (qe = B), qe > Se && (qe = Se), qe === 0) break e;
						d.arraySet(w, Oe, re, qe, Ne), B -= qe, re += qe, Se -= qe, Ne += qe, E.length -= qe;
						break;
					}
					E.mode = Q;
					break;
				case ce:
					for (; ge < 14;) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					if (E.nlen = (fe & 31) + 257, fe >>>= 5, ge -= 5, E.ndist = (fe & 31) + 1, fe >>>= 5, ge -= 5, E.ncode = (fe & 15) + 4, fe >>>= 4, ge -= 4, E.nlen > 286 || E.ndist > 30) {
						oe.msg = "too many length or distance symbols", E.mode = kt;
						break;
					}
					E.have = 0, E.mode = I;
				case I:
					for (; E.have < E.ncode;) {
						for (; ge < 3;) {
							if (B === 0) break e;
							B--, fe += Oe[re++] << ge, ge += 8;
						}
						E.lens[Ei[E.have++]] = fe & 7, fe >>>= 3, ge -= 3;
					}
					for (; E.have < 19;) E.lens[Ei[E.have++]] = 0;
					if (E.lencode = E.lendyn, E.lenbits = 7, Di = { bits: E.lenbits }, Mi = r(l, E.lens, 0, 19, E.lencode, 0, E.work, Di), E.lenbits = Di.bits, Mi) {
						oe.msg = "invalid code lengths set", E.mode = kt;
						break;
					}
					E.have = 0, E.mode = C;
				case C:
					for (; E.have < E.nlen + E.ndist;) {
						for (; ea = E.lencode[fe & (1 << E.lenbits) - 1], oa = ea >>> 24, Ka = ea >>> 16 & 255, Qa = ea & 65535, !(oa <= ge);) {
							if (B === 0) break e;
							B--, fe += Oe[re++] << ge, ge += 8;
						}
						if (Qa < 16) fe >>>= oa, ge -= oa, E.lens[E.have++] = Qa;
						else {
							if (Qa === 16) {
								for (Bi = oa + 2; ge < Bi;) {
									if (B === 0) break e;
									B--, fe += Oe[re++] << ge, ge += 8;
								}
								if (fe >>>= oa, ge -= oa, E.have === 0) {
									oe.msg = "invalid bit length repeat", E.mode = kt;
									break;
								}
								ei = E.lens[E.have - 1], qe = 3 + (fe & 3), fe >>>= 2, ge -= 2;
							} else if (Qa === 17) {
								for (Bi = oa + 3; ge < Bi;) {
									if (B === 0) break e;
									B--, fe += Oe[re++] << ge, ge += 8;
								}
								fe >>>= oa, ge -= oa, ei = 0, qe = 3 + (fe & 7), fe >>>= 3, ge -= 3;
							} else {
								for (Bi = oa + 7; ge < Bi;) {
									if (B === 0) break e;
									B--, fe += Oe[re++] << ge, ge += 8;
								}
								fe >>>= oa, ge -= oa, ei = 0, qe = 11 + (fe & 127), fe >>>= 7, ge -= 7;
							}
							if (E.have + qe > E.nlen + E.ndist) {
								oe.msg = "invalid bit length repeat", E.mode = kt;
								break;
							}
							for (; qe--;) E.lens[E.have++] = ei;
						}
					}
					if (E.mode === kt) break;
					if (E.lens[256] === 0) {
						oe.msg = "invalid code -- missing end-of-block", E.mode = kt;
						break;
					}
					if (E.lenbits = 9, Di = { bits: E.lenbits }, Mi = r(a, E.lens, 0, E.nlen, E.lencode, 0, E.work, Di), E.lenbits = Di.bits, Mi) {
						oe.msg = "invalid literal/lengths set", E.mode = kt;
						break;
					}
					if (E.distbits = 6, E.distcode = E.distdyn, Di = { bits: E.distbits }, Mi = r(i, E.lens, E.nlen, E.ndist, E.distcode, 0, E.work, Di), E.distbits = Di.bits, Mi) {
						oe.msg = "invalid distances set", E.mode = kt;
						break;
					}
					if (E.mode = Y, Fe === y) break e;
				case Y: E.mode = ve;
				case ve:
					if (B >= 6 && Se >= 258) {
						oe.next_out = Ne, oe.avail_out = Se, oe.next_in = re, oe.avail_in = B, E.hold = fe, E.bits = ge, f(oe, zt), Ne = oe.next_out, w = oe.output, Se = oe.avail_out, re = oe.next_in, Oe = oe.input, B = oe.avail_in, fe = E.hold, ge = E.bits, E.mode === Q && (E.back = -1);
						break;
					}
					for (E.back = 0; ea = E.lencode[fe & (1 << E.lenbits) - 1], oa = ea >>> 24, Ka = ea >>> 16 & 255, Qa = ea & 65535, !(oa <= ge);) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					if (Ka && (Ka & 240) === 0) {
						for (Ya = oa, Z = Ka, ue = Qa; ea = E.lencode[ue + ((fe & (1 << Ya + Z) - 1) >> Ya)], oa = ea >>> 24, Ka = ea >>> 16 & 255, Qa = ea & 65535, !(Ya + oa <= ge);) {
							if (B === 0) break e;
							B--, fe += Oe[re++] << ge, ge += 8;
						}
						fe >>>= Ya, ge -= Ya, E.back += Ya;
					}
					if (fe >>>= oa, ge -= oa, E.back += oa, E.length = Qa, Ka === 0) {
						E.mode = at;
						break;
					}
					if (Ka & 32) {
						E.back = -1, E.mode = Q;
						break;
					}
					if (Ka & 64) {
						oe.msg = "invalid literal/length code", E.mode = kt;
						break;
					}
					E.extra = Ka & 15, E.mode = _e;
				case _e:
					if (E.extra) {
						for (Bi = E.extra; ge < Bi;) {
							if (B === 0) break e;
							B--, fe += Oe[re++] << ge, ge += 8;
						}
						E.length += fe & (1 << E.extra) - 1, fe >>>= E.extra, ge -= E.extra, E.back += E.extra;
					}
					E.was = E.length, E.mode = Ye;
				case Ye:
					for (; ea = E.distcode[fe & (1 << E.distbits) - 1], oa = ea >>> 24, Ka = ea >>> 16 & 255, Qa = ea & 65535, !(oa <= ge);) {
						if (B === 0) break e;
						B--, fe += Oe[re++] << ge, ge += 8;
					}
					if ((Ka & 240) === 0) {
						for (Ya = oa, Z = Ka, ue = Qa; ea = E.distcode[ue + ((fe & (1 << Ya + Z) - 1) >> Ya)], oa = ea >>> 24, Ka = ea >>> 16 & 255, Qa = ea & 65535, !(Ya + oa <= ge);) {
							if (B === 0) break e;
							B--, fe += Oe[re++] << ge, ge += 8;
						}
						fe >>>= Ya, ge -= Ya, E.back += Ya;
					}
					if (fe >>>= oa, ge -= oa, E.back += oa, Ka & 64) {
						oe.msg = "invalid distance code", E.mode = kt;
						break;
					}
					E.offset = Qa, E.extra = Ka & 15, E.mode = Je;
				case Je:
					if (E.extra) {
						for (Bi = E.extra; ge < Bi;) {
							if (B === 0) break e;
							B--, fe += Oe[re++] << ge, ge += 8;
						}
						E.offset += fe & (1 << E.extra) - 1, fe >>>= E.extra, ge -= E.extra, E.back += E.extra;
					}
					if (E.offset > E.dmax) {
						oe.msg = "invalid distance too far back", E.mode = kt;
						break;
					}
					E.mode = Ve;
				case Ve:
					if (Se === 0) break e;
					if (qe = zt - Se, E.offset > qe) {
						if (qe = E.offset - qe, qe > E.whave && E.sane) {
							oe.msg = "invalid distance too far back", E.mode = kt;
							break;
						}
						qe > E.wnext ? (qe -= E.wnext, va = E.wsize - qe) : va = E.wnext - qe, qe > E.length && (qe = E.length), Ga = E.window;
					} else Ga = w, va = Ne - E.offset, qe = E.length;
					qe > Se && (qe = Se), Se -= qe, E.length -= qe;
					do
						w[Ne++] = Ga[va++];
					while (--qe);
					E.length === 0 && (E.mode = ve);
					break;
				case at:
					if (Se === 0) break e;
					w[Ne++] = E.length, Se--, E.mode = ve;
					break;
				case W:
					if (E.wrap) {
						for (; ge < 32;) {
							if (B === 0) break e;
							B--, fe |= Oe[re++] << ge, ge += 8;
						}
						if (zt -= Se, oe.total_out += zt, E.total += zt, zt && (oe.adler = E.check = E.flags ? U(E.check, w, zt, Ne - zt) : t(E.check, w, zt, Ne - zt)), zt = Se, (E.flags ? fe : se(fe)) !== E.check) {
							oe.msg = "incorrect data check", E.mode = kt;
							break;
						}
						fe = 0, ge = 0;
					}
					E.mode = Dt;
				case Dt:
					if (E.wrap && E.flags) {
						for (; ge < 32;) {
							if (B === 0) break e;
							B--, fe += Oe[re++] << ge, ge += 8;
						}
						if (fe !== (E.total & 4294967295)) {
							oe.msg = "incorrect length check", E.mode = kt;
							break;
						}
						fe = 0, ge = 0;
					}
					E.mode = Lt;
				case Lt:
					Mi = g;
					break e;
				case kt:
					Mi = u;
					break e;
				case T: return D;
				case ke:
				default: return m;
			}
			return oe.next_out = Ne, oe.avail_out = Se, oe.next_in = re, oe.avail_in = B, E.hold = fe, E.bits = ge, (E.wsize || zt !== oe.avail_out && E.mode < kt && (E.mode < W || Fe !== o)) && oi(oe, oe.output, oe.next_out, zt - oe.avail_out) ? (E.mode = T, D) : (gt -= oe.avail_in, zt -= oe.avail_out, oe.total_in += gt, oe.total_out += zt, E.total += zt, E.wrap && zt && (oe.adler = E.check = E.flags ? U(E.check, w, zt, oe.next_out - zt) : t(E.check, w, zt, oe.next_out - zt)), oe.data_type = E.bits + (E.last ? 64 : 0) + (E.mode === Q ? 128 : 0) + (E.mode === Y || E.mode === s ? 256 : 0), (gt === 0 && zt === 0 || Fe === o) && Mi === _ && (Mi = h), Mi);
		}
		function H(oe) {
			if (!oe || !oe.state) return m;
			var Fe = oe.state;
			return Fe.window && (Fe.window = null), oe.state = null, _;
		}
		function ze(oe, Fe) {
			var E;
			return !oe || !oe.state || (E = oe.state, (E.wrap & 2) === 0) ? m : (E.head = Fe, Fe.done = !1, _);
		}
		function Qe(oe, Fe) {
			var E = Fe.length, Oe, w, re;
			return !oe || !oe.state || (Oe = oe.state, Oe.wrap !== 0 && Oe.mode !== k) ? m : Oe.mode === k && (w = 1, w = t(w, Fe, E, 0), w !== Oe.check) ? u : (re = oi(oe, Fe, E, E), re ? (Oe.mode = T, D) : (Oe.havedict = 1, _));
		}
		e.inflateReset = pe, e.inflateReset2 = He, e.inflateResetKeep = Ce, e.inflateInit = $e, e.inflateInit2 = tt, e.inflate = ja, e.inflateEnd = H, e.inflateGetHeader = ze, e.inflateSetDictionary = Qe, e.inflateInfo = "pako inflate (from Nodeca project)";
	}), Zh = di((e, d) => {
		"use strict";
		d.exports = {
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
	}), Vf = di((e, d) => {
		"use strict";
		function t() {
			this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
		}
		d.exports = t;
	}), Kf = di((e) => {
		"use strict";
		var d = qf(), t = zr(), U = Nh(), f = Zh(), r = g1(), l = Hh(), a = Vf(), i = Object.prototype.toString;
		function o(_) {
			if (!(this instanceof o)) return new o(_);
			this.options = t.assign({
				chunkSize: 16384,
				windowBits: 0,
				to: ""
			}, _ || {});
			var g = this.options;
			g.raw && g.windowBits >= 0 && g.windowBits < 16 && (g.windowBits = -g.windowBits, g.windowBits === 0 && (g.windowBits = -15)), g.windowBits >= 0 && g.windowBits < 16 && !(_ && _.windowBits) && (g.windowBits += 32), g.windowBits > 15 && g.windowBits < 48 && !(g.windowBits & 15) && (g.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new l(), this.strm.avail_out = 0;
			var p = d.inflateInit2(this.strm, g.windowBits);
			if (p !== f.Z_OK) throw new Error(r[p]);
			if (this.header = new a(), d.inflateGetHeader(this.strm, this.header), g.dictionary && (typeof g.dictionary == "string" ? g.dictionary = U.string2buf(g.dictionary) : i.call(g.dictionary) === "[object ArrayBuffer]" && (g.dictionary = new Uint8Array(g.dictionary)), g.raw && (p = d.inflateSetDictionary(this.strm, g.dictionary), p !== f.Z_OK))) throw new Error(r[p]);
		}
		o.prototype.push = function(_, g) {
			var p = this.strm, m = this.options.chunkSize, u = this.options.dictionary, D, h, c, b, L, S = !1;
			if (this.ended) return !1;
			h = g === ~~g ? g : g === !0 ? f.Z_FINISH : f.Z_NO_FLUSH, typeof _ == "string" ? p.input = U.binstring2buf(_) : i.call(_) === "[object ArrayBuffer]" ? p.input = new Uint8Array(_) : p.input = _, p.next_in = 0, p.avail_in = p.input.length;
			do {
				if (p.avail_out === 0 && (p.output = new t.Buf8(m), p.next_out = 0, p.avail_out = m), D = d.inflate(p, f.Z_NO_FLUSH), D === f.Z_NEED_DICT && u && (D = d.inflateSetDictionary(this.strm, u)), D === f.Z_BUF_ERROR && S === !0 && (D = f.Z_OK, S = !1), D !== f.Z_STREAM_END && D !== f.Z_OK) return this.onEnd(D), this.ended = !0, !1;
				p.next_out && (p.avail_out === 0 || D === f.Z_STREAM_END || p.avail_in === 0 && (h === f.Z_FINISH || h === f.Z_SYNC_FLUSH)) && (this.options.to === "string" ? (c = U.utf8border(p.output, p.next_out), b = p.next_out - c, L = U.buf2string(p.output, c), p.next_out = b, p.avail_out = m - b, b && t.arraySet(p.output, p.output, c, b, 0), this.onData(L)) : this.onData(t.shrinkBuf(p.output, p.next_out))), p.avail_in === 0 && p.avail_out === 0 && (S = !0);
			} while ((p.avail_in > 0 || p.avail_out === 0) && D !== f.Z_STREAM_END);
			return D === f.Z_STREAM_END && (h = f.Z_FINISH), h === f.Z_FINISH ? (D = d.inflateEnd(this.strm), this.onEnd(D), this.ended = !0, D === f.Z_OK) : (h === f.Z_SYNC_FLUSH && (this.onEnd(f.Z_OK), p.avail_out = 0), !0);
		}, o.prototype.onData = function(_) {
			this.chunks.push(_);
		}, o.prototype.onEnd = function(_) {
			_ === f.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = t.flattenChunks(this.chunks)), this.chunks = [], this.err = _, this.msg = this.strm.msg;
		};
		function v(_, g) {
			var p = new o(g);
			if (p.push(_, !0), p.err) throw p.msg || r[p.err];
			return p.result;
		}
		function y(_, g) {
			return g = g || {}, g.raw = !0, v(_, g);
		}
		e.Inflate = o, e.inflate = v, e.inflateRaw = y, e.ungzip = v;
	}), Qf = di((e, d) => {
		"use strict";
		var t = zr().assign, U = Jf(), f = Kf(), r = Zh(), l = {};
		t(l, U, f, r), d.exports = l;
	}), e2 = di((e, d) => {
		(function() {
			var t = {};
			typeof d == "object" ? d.exports = t : self.UTIF = t;
			var U;
			typeof ao == "function" ? U = Qf() : U = self.pako;
			function f() {
				typeof process > "u" && console.log.apply(console, arguments);
			}
			(function(r, l) {
				(function() {
					var a = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(v) {
						return typeof v;
					} : function(v) {
						return v && typeof Symbol == "function" && v.constructor === Symbol && v !== Symbol.prototype ? "symbol" : typeof v;
					}, i = (function() {
						function v(y) {
							this.message = "JPEG error: " + y;
						}
						return v.prototype = Error(), v.prototype.name = "JpegError", v.constructor = v;
					})(), o = (function() {
						function v(y, _) {
							this.message = y, this.g = _;
						}
						return v.prototype = Error(), v.prototype.name = "DNLMarkerError", v.constructor = v;
					})();
					(function() {
						function v() {
							this.M = null, this.B = -1;
						}
						function y(u, D) {
							for (var h = 0, c = [], b, L, S = 16; 0 < S && !u[S - 1];) S--;
							c.push({
								children: [],
								index: 0
							});
							var R = c[0], P;
							for (b = 0; b < S; b++) {
								for (L = 0; L < u[b]; L++) {
									for (R = c.pop(), R.children[R.index] = D[h]; 0 < R.index;) R = c.pop();
									for (R.index++, c.push(R); c.length <= b;) c.push(P = {
										children: [],
										index: 0
									}), R.children[R.index] = P.children, R = P;
									h++;
								}
								b + 1 < S && (c.push(P = {
									children: [],
									index: 0
								}), R.children[R.index] = P.children, R = P);
							}
							return c[0].children;
						}
						function _(u, D, h, c, b, L, S, R, P) {
							function M() {
								if (0 < C) return C--, I >> C & 1;
								if (I = u[D++], I === 255) {
									var z = u[D++];
									if (z) {
										if (z === 220 && s) {
											D += 2;
											var se = u[D++] << 8 | u[D++];
											if (0 < se && se !== h.g) throw new o("Found DNL marker (0xFFDC) while parsing scan data", se);
										}
										throw new i("unexpected marker " + (I << 8 | z).toString(16));
									}
								}
								return C = 7, I >>> 7;
							}
							function ee(z) {
								for (;;) {
									if (z = z[M()], typeof z == "number") return z;
									if ((typeof z > "u" ? "undefined" : a(z)) !== "object") throw new i("invalid huffman sequence");
								}
							}
							function V(z) {
								for (var se = 0; 0 < z;) se = se << 1 | M(), z--;
								return se;
							}
							function F(z) {
								if (z === 1) return M() === 1 ? 1 : -1;
								var se = V(z);
								return se >= 1 << z - 1 ? se : se + (-1 << z) + 1;
							}
							function K(z, se) {
								var We = ee(z.D);
								for (We = We === 0 ? 0 : F(We), z.a[se] = z.m += We, We = 1; 64 > We;) {
									var Ce = ee(z.o), pe = Ce & 15;
									if (Ce >>= 4, pe === 0) {
										if (15 > Ce) break;
										We += 16;
									} else We += Ce, z.a[se + m[We]] = F(pe), We++;
								}
							}
							function k(z, se) {
								var We = ee(z.D);
								We = We === 0 ? 0 : F(We) << P, z.a[se] = z.m += We;
							}
							function Q(z, se) {
								z.a[se] |= M() << P;
							}
							function J(z, se) {
								if (0 < Y) Y--;
								else for (var We = L; We <= S;) {
									var Ce = ee(z.o), pe = Ce & 15;
									if (Ce >>= 4, pe === 0) {
										if (15 > Ce) {
											Y = V(Ce) + (1 << Ce) - 1;
											break;
										}
										We += 16;
									} else We += Ce, z.a[se + m[We]] = F(pe) * (1 << P), We++;
								}
							}
							function n(z, se) {
								for (var We = L, Ce = 0, pe; We <= S;) {
									pe = se + m[We];
									var He = 0 > z.a[pe] ? -1 : 1;
									switch (ve) {
										case 0:
											if (Ce = ee(z.o), pe = Ce & 15, Ce >>= 4, pe === 0) 15 > Ce ? (Y = V(Ce) + (1 << Ce), ve = 4) : (Ce = 16, ve = 1);
											else {
												if (pe !== 1) throw new i("invalid ACn encoding");
												_e = F(pe), ve = Ce ? 2 : 3;
											}
											continue;
										case 1:
										case 2:
											z.a[pe] ? z.a[pe] += He * (M() << P) : (Ce--, Ce === 0 && (ve = ve === 2 ? 3 : 0));
											break;
										case 3:
											z.a[pe] ? z.a[pe] += He * (M() << P) : (z.a[pe] = _e << P, ve = 0);
											break;
										case 4: z.a[pe] && (z.a[pe] += He * (M() << P));
									}
									We++;
								}
								ve === 4 && (Y--, Y === 0 && (ve = 0));
							}
							for (var s = 9 < arguments.length && arguments[9] !== void 0 ? arguments[9] : !1, ie = h.P, ce = D, I = 0, C = 0, Y = 0, ve = 0, _e, Ye = c.length, Je, Ve, at, W, Dt = h.S ? L === 0 ? R === 0 ? k : Q : R === 0 ? J : n : K, Lt = 0, kt = Ye === 1 ? c[0].c * c[0].l : ie * h.O, T, ke; Lt < kt;) {
								var be = b ? Math.min(kt - Lt, b) : kt;
								for (Je = 0; Je < Ye; Je++) c[Je].m = 0;
								if (Y = 0, Ye === 1) {
									var G = c[0];
									for (W = 0; W < be; W++) Dt(G, 64 * ((G.c + 1) * (Lt / G.c | 0) + Lt % G.c)), Lt++;
								} else for (W = 0; W < be; W++) {
									for (Je = 0; Je < Ye; Je++) for (G = c[Je], T = G.h, ke = G.j, Ve = 0; Ve < ke; Ve++) for (at = 0; at < T; at++) Dt(G, 64 * ((G.c + 1) * ((Lt / ie | 0) * G.j + Ve) + (Lt % ie * G.h + at)));
									Lt++;
								}
								if (C = 0, (G = p(u, D)) && G.f && ((0, _util.warn)("decodeScan - unexpected MCU data, current marker is: " + G.f), D = G.offset), G = G && G.F, !G || 65280 >= G) throw new i("marker was not found");
								if (65488 <= G && 65495 >= G) D += 2;
								else break;
							}
							return (G = p(u, D)) && G.f && ((0, _util.warn)("decodeScan - unexpected Scan data, current marker is: " + G.f), D = G.offset), D - ce;
						}
						function g(u, D) {
							for (var h = D.c, c = D.l, b = new Int16Array(64), L = 0; L < c; L++) for (var S = 0; S < h; S++) {
								var R = 64 * ((D.c + 1) * L + S), P = b, M = D.G, ee = D.a;
								if (!M) throw new i("missing required Quantization Table.");
								for (var V = 0; 64 > V; V += 8) {
									var F = ee[R + V], K = ee[R + V + 1], k = ee[R + V + 2], Q = ee[R + V + 3], J = ee[R + V + 4], n = ee[R + V + 5], s = ee[R + V + 6], ie = ee[R + V + 7];
									if (F *= M[V], (K | k | Q | J | n | s | ie) === 0) F = 5793 * F + 512 >> 10, P[V] = F, P[V + 1] = F, P[V + 2] = F, P[V + 3] = F, P[V + 4] = F, P[V + 5] = F, P[V + 6] = F, P[V + 7] = F;
									else {
										K *= M[V + 1], k *= M[V + 2], Q *= M[V + 3], J *= M[V + 4], n *= M[V + 5], s *= M[V + 6], ie *= M[V + 7];
										var ce = 5793 * F + 128 >> 8, I = 5793 * J + 128 >> 8, C = k, Y = s;
										J = 2896 * (K - ie) + 128 >> 8, ie = 2896 * (K + ie) + 128 >> 8, Q <<= 4, n <<= 4, ce = ce + I + 1 >> 1, I = ce - I, F = 3784 * C + 1567 * Y + 128 >> 8, C = 1567 * C - 3784 * Y + 128 >> 8, Y = F, J = J + n + 1 >> 1, n = J - n, ie = ie + Q + 1 >> 1, Q = ie - Q, ce = ce + Y + 1 >> 1, Y = ce - Y, I = I + C + 1 >> 1, C = I - C, F = 2276 * J + 3406 * ie + 2048 >> 12, J = 3406 * J - 2276 * ie + 2048 >> 12, ie = F, F = 799 * Q + 4017 * n + 2048 >> 12, Q = 4017 * Q - 799 * n + 2048 >> 12, n = F, P[V] = ce + ie, P[V + 7] = ce - ie, P[V + 1] = I + n, P[V + 6] = I - n, P[V + 2] = C + Q, P[V + 5] = C - Q, P[V + 3] = Y + J, P[V + 4] = Y - J;
									}
								}
								for (M = 0; 8 > M; ++M) F = P[M], K = P[M + 8], k = P[M + 16], Q = P[M + 24], J = P[M + 32], n = P[M + 40], s = P[M + 48], ie = P[M + 56], (K | k | Q | J | n | s | ie) === 0 ? (F = 5793 * F + 8192 >> 14, F = -2040 > F ? 0 : 2024 <= F ? 255 : F + 2056 >> 4, ee[R + M] = F, ee[R + M + 8] = F, ee[R + M + 16] = F, ee[R + M + 24] = F, ee[R + M + 32] = F, ee[R + M + 40] = F, ee[R + M + 48] = F, ee[R + M + 56] = F) : (ce = 5793 * F + 2048 >> 12, I = 5793 * J + 2048 >> 12, C = k, Y = s, J = 2896 * (K - ie) + 2048 >> 12, ie = 2896 * (K + ie) + 2048 >> 12, ce = (ce + I + 1 >> 1) + 4112, I = ce - I, F = 3784 * C + 1567 * Y + 2048 >> 12, C = 1567 * C - 3784 * Y + 2048 >> 12, Y = F, J = J + n + 1 >> 1, n = J - n, ie = ie + Q + 1 >> 1, Q = ie - Q, ce = ce + Y + 1 >> 1, Y = ce - Y, I = I + C + 1 >> 1, C = I - C, F = 2276 * J + 3406 * ie + 2048 >> 12, J = 3406 * J - 2276 * ie + 2048 >> 12, ie = F, F = 799 * Q + 4017 * n + 2048 >> 12, Q = 4017 * Q - 799 * n + 2048 >> 12, n = F, F = ce + ie, ie = ce - ie, K = I + n, s = I - n, k = C + Q, n = C - Q, Q = Y + J, J = Y - J, F = 16 > F ? 0 : 4080 <= F ? 255 : F >> 4, K = 16 > K ? 0 : 4080 <= K ? 255 : K >> 4, k = 16 > k ? 0 : 4080 <= k ? 255 : k >> 4, Q = 16 > Q ? 0 : 4080 <= Q ? 255 : Q >> 4, J = 16 > J ? 0 : 4080 <= J ? 255 : J >> 4, n = 16 > n ? 0 : 4080 <= n ? 255 : n >> 4, s = 16 > s ? 0 : 4080 <= s ? 255 : s >> 4, ie = 16 > ie ? 0 : 4080 <= ie ? 255 : ie >> 4, ee[R + M] = F, ee[R + M + 8] = K, ee[R + M + 16] = k, ee[R + M + 24] = Q, ee[R + M + 32] = J, ee[R + M + 40] = n, ee[R + M + 48] = s, ee[R + M + 56] = ie);
							}
							return D.a;
						}
						function p(u, D) {
							var h = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : D, c = u.length - 1;
							if (h = h < D ? h : D, D >= c) return null;
							var b = u[D] << 8 | u[D + 1];
							if (65472 <= b && 65534 >= b) return {
								f: null,
								F: b,
								offset: D
							};
							for (var L = u[h] << 8 | u[h + 1]; !(65472 <= L && 65534 >= L);) {
								if (++h >= c) return null;
								L = u[h] << 8 | u[h + 1];
							}
							return {
								f: b.toString(16),
								F: L,
								offset: h
							};
						}
						var m = new Uint8Array([
							0,
							1,
							8,
							16,
							9,
							2,
							3,
							10,
							17,
							24,
							32,
							25,
							18,
							11,
							4,
							5,
							12,
							19,
							26,
							33,
							40,
							48,
							41,
							34,
							27,
							20,
							13,
							6,
							7,
							14,
							21,
							28,
							35,
							42,
							49,
							56,
							57,
							50,
							43,
							36,
							29,
							22,
							15,
							23,
							30,
							37,
							44,
							51,
							58,
							59,
							52,
							45,
							38,
							31,
							39,
							46,
							53,
							60,
							61,
							54,
							47,
							55,
							62,
							63
						]);
						v.prototype = {
							parse: function(u) {
								function D() {
									var C = u[S] << 8 | u[S + 1];
									return S += 2, C;
								}
								function h() {
									var C = D();
									C = S + C - 2;
									var Y = p(u, C, S);
									return Y && Y.f && ((0, _util.warn)("readDataBlock - incorrect length, current marker is: " + Y.f), C = Y.offset), C = u.subarray(S, C), S += C.length, C;
								}
								function c(C) {
									for (var Y = Math.ceil(C.v / 8 / C.s), ve = Math.ceil(C.g / 8 / C.u), _e = 0; _e < C.b.length; _e++) {
										ce = C.b[_e];
										var Ye = Math.ceil(Math.ceil(C.v / 8) * ce.h / C.s), Je = Math.ceil(Math.ceil(C.g / 8) * ce.j / C.u);
										ce.a = new Int16Array(64 * ve * ce.j * (Y * ce.h + 1)), ce.c = Ye, ce.l = Je;
									}
									C.P = Y, C.O = ve;
								}
								var b = (1 < arguments.length && arguments[1] !== void 0 ? arguments[1] : {}).N, L = b === void 0 ? null : b, S = 0, R = null, P = 0;
								b = [];
								var M = [], ee = [], V = D();
								if (V !== 65496) throw new i("SOI not found");
								for (V = D(); V !== 65497;) {
									switch (V) {
										case 65504:
										case 65505:
										case 65506:
										case 65507:
										case 65508:
										case 65509:
										case 65510:
										case 65511:
										case 65512:
										case 65513:
										case 65514:
										case 65515:
										case 65516:
										case 65517:
										case 65518:
										case 65519:
										case 65534:
											var F = h();
											V === 65518 && F[0] === 65 && F[1] === 100 && F[2] === 111 && F[3] === 98 && F[4] === 101 && (R = {
												version: F[5] << 8 | F[6],
												Y: F[7] << 8 | F[8],
												Z: F[9] << 8 | F[10],
												W: F[11]
											});
											break;
										case 65499:
											V = D() + S - 2;
											for (var K; S < V;) {
												var k = u[S++], Q = new Uint16Array(64);
												if (k >> 4 === 0) for (F = 0; 64 > F; F++) K = m[F], Q[K] = u[S++];
												else if (k >> 4 === 1) for (F = 0; 64 > F; F++) K = m[F], Q[K] = D();
												else throw new i("DQT - invalid table spec");
												b[k & 15] = Q;
											}
											break;
										case 65472:
										case 65473:
										case 65474:
											if (J) throw new i("Only single frame JPEGs supported");
											D();
											var J = {};
											for (J.X = V === 65473, J.S = V === 65474, J.precision = u[S++], V = D(), J.g = L || V, J.v = D(), J.b = [], J.C = {}, F = u[S++], V = Q = k = 0; V < F; V++) {
												K = u[S];
												var n = u[S + 1] >> 4, s = u[S + 1] & 15;
												k < n && (k = n), Q < s && (Q = s), n = J.b.push({
													h: n,
													j: s,
													T: u[S + 2],
													G: null
												}), J.C[K] = n - 1, S += 3;
											}
											J.s = k, J.u = Q, c(J);
											break;
										case 65476:
											for (K = D(), V = 2; V < K;) {
												for (k = u[S++], Q = new Uint8Array(16), F = n = 0; 16 > F; F++, S++) n += Q[F] = u[S];
												for (s = new Uint8Array(n), F = 0; F < n; F++, S++) s[F] = u[S];
												V += 17 + n, (k >> 4 === 0 ? ee : M)[k & 15] = y(Q, s);
											}
											break;
										case 65501:
											D();
											var ie = D();
											break;
										case 65498:
											for (F = ++P === 1 && !L, D(), k = u[S++], K = [], V = 0; V < k; V++) {
												Q = J.C[u[S++]];
												var ce = J.b[Q];
												Q = u[S++], ce.D = ee[Q >> 4], ce.o = M[Q & 15], K.push(ce);
											}
											V = u[S++], k = u[S++], Q = u[S++];
											try {
												var I = _(u, S, J, K, ie, V, k, Q >> 4, Q & 15, F);
												S += I;
											} catch (C) {
												if (C instanceof o) return (0, _util.warn)("Attempting to re-parse JPEG image using \"scanLines\" parameter found in DNL marker (0xFFDC) segment."), this.parse(u, { N: C.g });
												throw C;
											}
											break;
										case 65500:
											S += 4;
											break;
										case 65535:
											u[S] !== 255 && S--;
											break;
										default: if (u[S - 3] === 255 && 192 <= u[S - 2] && 254 >= u[S - 2]) S -= 3;
										else if ((F = p(u, S - 2)) && F.f) (0, _util.warn)("JpegImage.parse - unexpected data, current marker is: " + F.f), S = F.offset;
										else throw new i("unknown marker " + V.toString(16));
									}
									V = D();
								}
								for (this.width = J.v, this.height = J.g, this.A = R, this.b = [], V = 0; V < J.b.length; V++) ce = J.b[V], (ie = b[ce.T]) && (ce.G = ie), this.b.push({
									R: g(J, ce),
									U: ce.h / J.s,
									V: ce.j / J.u,
									c: ce.c,
									l: ce.l
								});
								this.i = this.b.length;
							},
							L: function(u, D) {
								var h = this.width / u, c = this.height / D, b, L, S = this.b.length, R = u * D * S, P = new Uint8ClampedArray(R), M = new Uint32Array(u);
								for (L = 0; L < S; L++) {
									var ee = this.b[L], V = ee.U * h, F = ee.V * c, K = L, k = ee.R, Q = ee.c + 1 << 3;
									for (b = 0; b < u; b++) ee = 0 | b * V, M[b] = (ee & 4294967288) << 3 | ee & 7;
									for (V = 0; V < D; V++) for (ee = 0 | V * F, ee = Q * (ee & 4294967288) | (ee & 7) << 3, b = 0; b < u; b++) P[K] = k[ee + M[b]], K += S;
								}
								if (c = this.M) for (L = 0; L < R;) for (h = ee = 0; ee < S; ee++, L++, h += 2) P[L] = (P[L] * c[h] >> 8) + c[h + 1];
								return P;
							},
							w: function() {
								return this.A ? !!this.A.W : this.i === 3 ? this.B !== 0 : this.B === 1;
							},
							I: function(u) {
								for (var D, h, c, b = 0, L = u.length; b < L; b += 3) D = u[b], h = u[b + 1], c = u[b + 2], u[b] = D - 179.456 + 1.402 * c, u[b + 1] = D + 135.459 - .344 * h - .714 * c, u[b + 2] = D - 226.816 + 1.772 * h;
								return u;
							},
							K: function(u) {
								for (var D, h, c, b, L = 0, S = 0, R = u.length; S < R; S += 4) D = u[S], h = u[S + 1], c = u[S + 2], b = u[S + 3], u[L++] = -122.67195406894 + h * (-660635669420364e-19 * h + .000437130475926232 * c - 54080610064599e-18 * D + .00048449797120281 * b - .154362151871126) + c * (-.000957964378445773 * c + .000817076911346625 * D - .00477271405408747 * b + 1.53380253221734) + D * (.000961250184130688 * D - .00266257332283933 * b + .48357088451265) + b * (-.000336197177618394 * b + .484791561490776), u[L++] = 107.268039397724 + h * (219927104525741e-19 * h - .000640992018297945 * c + .000659397001245577 * D + .000426105652938837 * b - .176491792462875) + c * (-.000778269941513683 * c + .00130872261408275 * D + .000770482631801132 * b - .151051492775562) + D * (.00126935368114843 * D - .00265090189010898 * b + .25802910206845) + b * (-.000318913117588328 * b - .213742400323665), u[L++] = -20.810012546947 + h * (-.000570115196973677 * h - 263409051004589e-19 * c + .0020741088115012 * D - .00288260236853442 * b + .814272968359295) + c * (-153496057440975e-19 * c - .000132689043961446 * D + .000560833691242812 * b - .195152027534049) + D * (.00174418132927582 * D - .00255243321439347 * b + .116935020465145) + b * (-.000343531996510555 * b + .24165260232407);
								return u.subarray(0, L);
							},
							J: function(u) {
								for (var D, h, c, b = 0, L = u.length; b < L; b += 4) D = u[b], h = u[b + 1], c = u[b + 2], u[b] = 434.456 - D - 1.402 * c, u[b + 1] = 119.541 - D + .344 * h + .714 * c, u[b + 2] = 481.816 - D - 1.772 * h;
								return u;
							},
							H: function(u) {
								for (var D, h, c, b, L = 0, S = 1 / 255, R = 0, P = u.length; R < P; R += 4) D = u[R] * S, h = u[R + 1] * S, c = u[R + 2] * S, b = u[R + 3] * S, u[L++] = 255 + D * (-4.387332384609988 * D + 54.48615194189176 * h + 18.82290502165302 * c + 212.25662451639585 * b - 285.2331026137004) + h * (1.7149763477362134 * h - 5.6096736904047315 * c - 17.873870861415444 * b - 5.497006427196366) + c * (-2.5217340131683033 * c - 21.248923337353073 * b + 17.5119270841813) - b * (21.86122147463605 * b + 189.48180835922747), u[L++] = 255 + D * (8.841041422036149 * D + 60.118027045597366 * h + 6.871425592049007 * c + 31.159100130055922 * b - 79.2970844816548) + h * (-15.310361306967817 * h + 17.575251261109482 * c + 131.35250912493976 * b - 190.9453302588951) + c * (4.444339102852739 * c + 9.8632861493405 * b - 24.86741582555878) - b * (20.737325471181034 * b + 187.80453709719578), u[L++] = 255 + D * (.8842522430003296 * D + 8.078677503112928 * h + 30.89978309703729 * c - .23883238689178934 * b - 14.183576799673286) + h * (10.49593273432072 * h + 63.02378494754052 * c + 50.606957656360734 * b - 112.23884253719248) + c * (.03296041114873217 * c + 115.60384449646641 * b - 193.58209356861505) - b * (22.33816807309886 * b + 180.12613974708367);
								return u.subarray(0, L);
							},
							getData: function(u, D, h) {
								if (4 < this.i) throw new i("Unsupported color mode");
								if (u = this.L(u, D), this.i === 1 && h) {
									h = u.length, D = new Uint8ClampedArray(3 * h);
									for (var c = 0, b = 0; b < h; b++) {
										var L = u[b];
										D[c++] = L, D[c++] = L, D[c++] = L;
									}
									return D;
								}
								if (this.i === 3 && this.w()) return this.I(u);
								if (this.i === 4) {
									if (this.w()) return h ? this.K(u) : this.J(u);
									if (h) return this.H(u);
								}
								return u;
							}
						}, r.JpegDecoder = v;
					})();
				})(), r.encodeImage = function(a, i, o, v) {
					var y = {
						t256: [i],
						t257: [o],
						t258: [
							8,
							8,
							8,
							8
						],
						t259: [1],
						t262: [2],
						t273: [1e3],
						t277: [4],
						t278: [o],
						t279: [i * o * 4],
						t282: [1],
						t283: [1],
						t284: [1],
						t286: [0],
						t287: [0],
						t296: [1],
						t305: ["Photopea (UTIF.js)"],
						t338: [1]
					};
					if (v) for (var _ in v) y[_] = v[_];
					for (var g = new Uint8Array(r.encode([y])), p = new Uint8Array(a), m = new Uint8Array(1e3 + i * o * 4), _ = 0; _ < g.length; _++) m[_] = g[_];
					for (var _ = 0; _ < p.length; _++) m[1e3 + _] = p[_];
					return m.buffer;
				}, r.encode = function(a) {
					var i = new Uint8Array(2e4), o = 4, v = r._binBE;
					i[0] = 77, i[1] = 77, i[3] = 42;
					var y = 8;
					v.writeUint(i, o, y), o += 4;
					for (var _ = 0; _ < a.length; _++) {
						var g = r._writeIFD(v, i, y, a[_]);
						y = g[1], _ < a.length - 1 && v.writeUint(i, g[0], y);
					}
					return i.slice(0, y).buffer;
				}, r.decode = function(a) {
					r.decode._decodeG3.allow2D = null;
					var i = new Uint8Array(a), o = 0, v = r._binBE.readASCII(i, o, 2);
					o += 2;
					var y = v == "II" ? r._binLE : r._binBE;
					y.readUshort(i, o), o += 2;
					var _ = y.readUint(i, o);
					o += 4;
					for (var g = [];;) {
						var p = r._readIFD(y, i, _, g, 0, !1);
						if (_ = y.readUint(i, p), _ == 0) break;
					}
					return g;
				}, r.decodeImage = function(a, i, o) {
					var v = new Uint8Array(a), y = r._binBE.readASCII(v, 0, 2);
					if (i.t256 != null) {
						i.isLE = y == "II", i.width = i.t256[0], i.height = i.t257[0];
						var _ = i.t259 ? i.t259[0] : 1, g = i.t266 ? i.t266[0] : 1;
						i.t284 && i.t284[0] == 2 && f("PlanarConfiguration 2 should not be used!");
						var p;
						i.t258 ? p = Math.min(32, i.t258[0]) * i.t258.length : p = i.t277 ? i.t277[0] : 1, _ == 1 && i.t279 != null && i.t278 && i.t262[0] == 32803 && (p = Math.round(i.t279[0] * 8 / (i.width * i.t278[0])));
						var m = Math.ceil(i.width * p / 8) * 8, u = i.t273;
						u ?? (u = i.t324);
						var D = i.t279;
						_ == 1 && u.length == 1 && (D = [i.height * (m >>> 3)]), D ?? (D = i.t325);
						var h = new Uint8Array(i.height * (m >>> 3)), c = 0;
						if (i.t322 != null) {
							for (var b = i.t322[0], L = i.t323[0], S = Math.floor((i.width + b - 1) / b), R = Math.floor((i.height + L - 1) / L), P = new Uint8Array(Math.ceil(b * L * p / 8) | 0), M = 0; M < R; M++) for (var ee = 0; ee < S; ee++) {
								for (var V = M * S + ee, F = 0; F < P.length; F++) P[F] = 0;
								r.decode._decompress(i, o, v, u[V], D[V], _, P, 0, g), _ == 6 ? h = P : r._copyTile(P, Math.ceil(b * p / 8) | 0, L, h, Math.ceil(i.width * p / 8) | 0, i.height, Math.ceil(ee * b * p / 8) | 0, M * L);
							}
							c = h.length * 8;
						} else {
							var K = i.t278 ? i.t278[0] : i.height;
							K = Math.min(K, i.height);
							for (var V = 0; V < u.length; V++) r.decode._decompress(i, o, v, u[V], D[V], _, h, Math.ceil(c / 8) | 0, g), c += m * K;
							c = Math.min(c, h.length * 8);
						}
						i.data = new Uint8Array(h.buffer, 0, Math.ceil(c / 8) | 0);
					}
				}, r.decode._decompress = function(a, i, o, v, y, _, g, p, m) {
					if (_ == 1 || y == g.length && _ != 32767) for (var u = 0; u < y; u++) g[p + u] = o[v + u];
					else if (_ == 3) r.decode._decodeG3(o, v, y, g, p, a.width, m);
					else if (_ == 4) r.decode._decodeG4(o, v, y, g, p, a.width, m);
					else if (_ == 5) r.decode._decodeLZW(o, v, g, p);
					else if (_ == 6) r.decode._decodeOldJPEG(a, o, v, y, g, p);
					else if (_ == 7) r.decode._decodeNewJPEG(a, o, v, y, g, p);
					else if (_ == 8) for (var D = new Uint8Array(o.buffer, v, y), h = l.inflate(D), c = 0; c < h.length; c++) g[p + c] = h[c];
					else _ == 32767 ? r.decode._decodeARW(a, o, v, y, g, p) : _ == 32773 ? r.decode._decodePackBits(o, v, y, g, p) : _ == 32809 ? r.decode._decodeThunder(o, v, y, g, p) : _ == 34713 ? r.decode._decodeNikon(a, i, o, v, y, g, p) : f("Unknown compression", _);
					var b = a.t258 ? Math.min(32, a.t258[0]) : 1, L = a.t277 ? a.t277[0] : 1, S = b * L >>> 3, R = a.t278 ? a.t278[0] : a.height, P = Math.ceil(b * L * a.width / 8);
					if (b == 16 && !a.isLE && a.t33422 == null) for (var M = 0; M < R; M++) for (var ee = p + M * P, V = 1; V < P; V += 2) {
						var F = g[ee + V];
						g[ee + V] = g[ee + V - 1], g[ee + V - 1] = F;
					}
					if (a.t317 && a.t317[0] == 2) for (var M = 0; M < R; M++) {
						var K = p + M * P;
						if (b == 16) for (var u = S; u < P; u += 2) {
							var k = (g[K + u + 1] << 8 | g[K + u]) + (g[K + u - S + 1] << 8 | g[K + u - S]);
							g[K + u] = k & 255, g[K + u + 1] = k >>> 8 & 255;
						}
						else if (L == 3) for (var u = 3; u < P; u += 3) g[K + u] = g[K + u] + g[K + u - 3] & 255, g[K + u + 1] = g[K + u + 1] + g[K + u - 2] & 255, g[K + u + 2] = g[K + u + 2] + g[K + u - 1] & 255;
						else for (var u = S; u < P; u++) g[K + u] = g[K + u] + g[K + u - S] & 255;
					}
				}, r.decode._ljpeg_diff = function(a, i, o) {
					var v = r.decode._getbithuff, y, _;
					return y = v(a, i, o[0], o), _ = v(a, i, y, 0), !(_ & 1 << y - 1) && (_ -= (1 << y) - 1), _;
				}, r.decode._decodeARW = function(a, i, o, v, y, _) {
					var g = a.t256[0], p = a.t257[0], m = a.t258[0], u = a.isLE ? r._binLE : r._binBE;
					if (!(g * p == v || g * p * 1.5 == v)) {
						p += 8;
						var D = [
							o,
							0,
							0,
							0
						], h = new Uint16Array(32770), c = [
							3857,
							3856,
							3599,
							3342,
							3085,
							2828,
							2571,
							2314,
							2057,
							1800,
							1543,
							1286,
							1029,
							772,
							771,
							768,
							514,
							513
						], Y, b, L, Q, k, S = 0, R = r.decode._ljpeg_diff;
						for (h[0] = 15, L = Y = 0; Y < 18; Y++) for (var P = 32768 >>> (c[Y] >>> 8), b = 0; b < P; b++) h[++L] = c[Y];
						for (Q = g; Q--;) for (k = 0; k < p + 1; k += 2) if (k == p && (k = 1), S += R(i, D, h), k < p) {
							var M = S & 4095;
							r.decode._putsF(y, (k * g + Q) * m, M << 16 - m);
						}
						return;
					}
					if (g * p * 1.5 == v) {
						for (var Y = 0; Y < v; Y += 3) {
							var ee = i[o + Y + 0], V = i[o + Y + 1], F = i[o + Y + 2];
							y[_ + Y] = V << 4 | ee >>> 4, y[_ + Y + 1] = ee << 4 | F >>> 4, y[_ + Y + 2] = F << 4 | V >>> 4;
						}
						return;
					}
					var K = new Uint16Array(16), k, Q, J, n, s, ie, ce, I, C, Y, ve, _e = new Uint8Array(g + 1);
					for (k = 0; k < p; k++) {
						for (var Ye = 0; Ye < g; Ye++) _e[Ye] = i[o++];
						for (ve = 0, Q = 0; Q < g - 30; ve += 16) {
							for (n = 2047 & (J = u.readUint(_e, ve)), s = 2047 & J >>> 11, ie = 15 & J >>> 22, ce = 15 & J >>> 26, I = 0; I < 4 && 128 << I <= n - s; I++);
							for (C = 30, Y = 0; Y < 16; Y++) Y == ie ? K[Y] = n : Y == ce ? K[Y] = s : (K[Y] = ((u.readUshort(_e, ve + (C >> 3)) >>> (C & 7) & 127) << I) + s, K[Y] > 2047 && (K[Y] = 2047), C += 7);
							for (Y = 0; Y < 16; Y++, Q += 2) {
								var M = K[Y] << 1;
								r.decode._putsF(y, (k * g + Q) * m, M << 16 - m);
							}
							Q -= Q & 1 ? 1 : 31;
						}
					}
				}, r.decode._decodeNikon = function(a, i, o, v, y, _, g) {
					var p = [
						[
							0,
							0,
							1,
							5,
							1,
							1,
							1,
							1,
							1,
							1,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							5,
							4,
							3,
							6,
							2,
							7,
							1,
							0,
							8,
							9,
							11,
							10,
							12
						],
						[
							0,
							0,
							1,
							5,
							1,
							1,
							1,
							1,
							1,
							1,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							57,
							90,
							56,
							39,
							22,
							5,
							4,
							3,
							2,
							1,
							0,
							11,
							12,
							12
						],
						[
							0,
							0,
							1,
							4,
							2,
							3,
							1,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							5,
							4,
							6,
							3,
							7,
							2,
							8,
							1,
							9,
							0,
							10,
							11,
							12
						],
						[
							0,
							0,
							1,
							4,
							3,
							1,
							1,
							1,
							1,
							1,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							5,
							6,
							4,
							7,
							8,
							3,
							9,
							2,
							1,
							0,
							10,
							11,
							12,
							13,
							14
						],
						[
							0,
							0,
							1,
							5,
							1,
							1,
							1,
							1,
							1,
							1,
							1,
							2,
							0,
							0,
							0,
							0,
							0,
							8,
							92,
							75,
							58,
							41,
							7,
							6,
							5,
							4,
							3,
							2,
							1,
							0,
							13,
							14
						],
						[
							0,
							0,
							1,
							4,
							2,
							2,
							3,
							1,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							7,
							6,
							8,
							5,
							9,
							4,
							10,
							3,
							11,
							12,
							2,
							0,
							1,
							13,
							14
						]
					], m = a.t256[0], u = a.t257[0], D = a.t258[0], h = 0, c = 0, b = r.decode._make_decoder, L = r.decode._getbithuff, S = i[0].exifIFD.makerNote, R = S.t150 ? S.t150 : S.t140, P = 0, M = R[P++], ee = R[P++];
					(M == 73 || ee == 88) && (P += 2110), M == 70 && (h = 2), D == 14 && (h += 3);
					for (var V = [[0, 0], [0, 0]], F = a.isLE ? r._binLE : r._binBE, n = 0; n < 2; n++) for (var K = 0; K < 2; K++) V[n][K] = F.readShort(R, P), P += 2;
					var k = 1 << D & 32767, Q = 0, J = F.readShort(R, P);
					P += 2, J > 1 && (Q = Math.floor(k / (J - 1))), M == 68 && ee == 32 && Q > 0 && (c = F.readShort(R, 562));
					var n, s, ie, ce, I, C, Y = [0, 0], ve = b(p[h]), _e = [
						v,
						0,
						0,
						0
					];
					for (s = 0; s < u; s++) for (c && s == c && (ve = b(p[h + 1])), ie = 0; ie < m; ie++) {
						n = L(o, _e, ve[0], ve), ce = n & 15, I = n >>> 4, C = (L(o, _e, ce - I, 0) << 1) + 1 << I >>> 1, !(C & 1 << ce - 1) && (C -= (1 << ce) - (I == 0 ? 1 : 0)), ie < 2 ? Y[ie] = V[s & 1][ie] += C : Y[ie & 1] += C;
						var Ye = Math.min(Math.max(Y[ie & 1], 0), (1 << D) - 1), Je = (s * m + ie) * D;
						r.decode._putsF(_, Je, Ye << 16 - D);
					}
				}, r.decode._putsF = function(a, i, o) {
					o = o << 8 - (i & 7);
					var v = i >>> 3;
					a[v] |= o >>> 16, a[v + 1] |= o >>> 8, a[v + 2] |= o;
				}, r.decode._getbithuff = function(a, i, o, v) {
					var y = 0;
					r.decode._get_byte;
					var _, g = i[0], p = i[1], m = i[2], u = i[3];
					if (o == 0 || m < 0) return 0;
					for (; !u && m < o && (_ = a[g++]) != -1 && !(u = y && _ == 255 && a[g++]);) p = (p << 8) + _, m += 8;
					if (_ = p << 32 - m >>> 32 - o, v ? (m -= v[_ + 1] >>> 8, _ = v[_ + 1] & 255) : m -= o, m < 0) throw "e";
					return i[0] = g, i[1] = p, i[2] = m, i[3] = u, _;
				}, r.decode._make_decoder = function(a) {
					var i, o, v, y, _, g = [];
					for (i = 16; i != 0 && !a[i]; i--);
					var p = 17;
					for (g[0] = i, v = o = 1; o <= i; o++) for (y = 0; y < a[o]; y++, ++p) for (_ = 0; _ < 1 << i - o; _++) v <= 1 << i && (g[v++] = o << 8 | a[p]);
					return g;
				}, r.decode._decodeNewJPEG = function(a, i, o, v, y, _) {
					var g = a.t347, p = g ? g.length : 0, m = new Uint8Array(p + v);
					if (g) {
						for (var u = 216, D = 217, h = 0, c = 0; c < p - 1 && !(g[c] == 255 && g[c + 1] == D); c++) m[h++] = g[c];
						var b = i[o], L = i[o + 1];
						(b != 255 || L != u) && (m[h++] = b, m[h++] = L);
						for (var c = 2; c < v; c++) m[h++] = i[o + c];
					} else for (var c = 0; c < v; c++) m[c] = i[o + c];
					if (a.t262[0] == 32803 || a.t262[0] == 34892) {
						var S = a.t258[0], R = r.LosslessJpegDecode(m), P = R.length;
						if (S == 16) if (a.isLE) for (var c = 0; c < P; c++) y[_ + (c << 1)] = R[c] & 255, y[_ + (c << 1) + 1] = R[c] >>> 8;
						else for (var c = 0; c < P; c++) y[_ + (c << 1)] = R[c] >>> 8, y[_ + (c << 1) + 1] = R[c] & 255;
						else if (S == 14 || S == 12) for (var M = 16 - S, c = 0; c < P; c++) r.decode._putsF(y, c * S, R[c] << M);
						else throw new Error("unsupported bit depth " + S);
					} else {
						var ee = new r.JpegDecoder();
						ee.parse(m);
						for (var V = ee.getData(ee.width, ee.height), c = 0; c < V.length; c++) y[_ + c] = V[c];
					}
					a.t262[0] == 6 && (a.t262[0] = 2);
				}, r.decode._decodeOldJPEGInit = function(a, i, o, v) {
					var y = 216, _ = 219, g = 196, p = 221, m = 192, u = 218, D = 0, h = 0, c, b, L = !1, S, R, P, M = a.t513, ee = M ? M[0] : 0, V = a.t514, F = V ? V[0] : 0, K = a.t324 || a.t273 || M, k = a.t530, Q = 0, J = 0, n = a.t277 ? a.t277[0] : 1, s = a.t515;
					if (K && (h = K[0], L = K.length > 1), !L) {
						if (i[o] == 255 && i[o + 1] == y) return { jpegOffset: o };
						if (M != null && (i[o + ee] == 255 && i[o + ee + 1] == y ? D = o + ee : f("JPEGInterchangeFormat does not point to SOI"), V == null ? f("JPEGInterchangeFormatLength field is missing") : (ee >= h || ee + F <= h) && f("JPEGInterchangeFormatLength field value is invalid"), D != null)) return { jpegOffset: D };
					}
					if (k != null && (Q = k[0], J = k[1]), M != null && V != null) if (F >= 2 && ee + F <= h) {
						for (i[o + ee + F - 2] == 255 && i[o + ee + F - 1] == y ? c = new Uint8Array(F - 2) : c = new Uint8Array(F), S = 0; S < c.length; S++) c[S] = i[o + ee + S];
						f("Incorrect JPEG interchange format: using JPEGInterchangeFormat offset to derive tables");
					} else f("JPEGInterchangeFormat+JPEGInterchangeFormatLength > offset to first strip or tile");
					if (c == null) {
						var ie = 0, ce = [];
						ce[ie++] = 255, ce[ie++] = y;
						var I = a.t519;
						if (I == null) throw new Error("JPEGQTables tag is missing");
						for (S = 0; S < I.length; S++) for (ce[ie++] = 255, ce[ie++] = _, ce[ie++] = 0, ce[ie++] = 67, ce[ie++] = S, R = 0; R < 64; R++) ce[ie++] = i[o + I[S] + R];
						for (P = 0; P < 2; P++) {
							var C = a[P == 0 ? "t520" : "t521"];
							if (C == null) throw new Error((P == 0 ? "JPEGDCTables" : "JPEGACTables") + " tag is missing");
							for (S = 0; S < C.length; S++) {
								ce[ie++] = 255, ce[ie++] = g;
								var Y = 19;
								for (R = 0; R < 16; R++) Y += i[o + C[S] + R];
								for (ce[ie++] = Y >>> 8, ce[ie++] = Y & 255, ce[ie++] = S | P << 4, R = 0; R < 16; R++) ce[ie++] = i[o + C[S] + R];
								for (R = 0; R < Y; R++) ce[ie++] = i[o + C[S] + 16 + R];
							}
						}
						if (ce[ie++] = 255, ce[ie++] = m, ce[ie++] = 0, ce[ie++] = 8 + 3 * n, ce[ie++] = 8, ce[ie++] = a.height >>> 8 & 255, ce[ie++] = a.height & 255, ce[ie++] = a.width >>> 8 & 255, ce[ie++] = a.width & 255, ce[ie++] = n, n == 1) ce[ie++] = 1, ce[ie++] = 17, ce[ie++] = 0;
						else for (S = 0; S < 3; S++) ce[ie++] = S + 1, ce[ie++] = S != 0 ? 17 : (Q & 15) << 4 | J & 15, ce[ie++] = S;
						s != null && s[0] != 0 && (ce[ie++] = 255, ce[ie++] = p, ce[ie++] = 0, ce[ie++] = 4, ce[ie++] = s[0] >>> 8 & 255, ce[ie++] = s[0] & 255), c = new Uint8Array(ce);
					}
					var ve = -1;
					for (S = 0; S < c.length - 1;) {
						if (c[S] == 255 && c[S + 1] == m) {
							ve = S;
							break;
						}
						S++;
					}
					if (ve == -1) {
						var _e = new Uint8Array(c.length + 10 + 3 * n);
						_e.set(c);
						var Ye = c.length;
						if (ve = c.length, c = _e, c[Ye++] = 255, c[Ye++] = m, c[Ye++] = 0, c[Ye++] = 8 + 3 * n, c[Ye++] = 8, c[Ye++] = a.height >>> 8 & 255, c[Ye++] = a.height & 255, c[Ye++] = a.width >>> 8 & 255, c[Ye++] = a.width & 255, c[Ye++] = n, n == 1) c[Ye++] = 1, c[Ye++] = 17, c[Ye++] = 0;
						else for (S = 0; S < 3; S++) c[Ye++] = S + 1, c[Ye++] = S != 0 ? 17 : (Q & 15) << 4 | J & 15, c[Ye++] = S;
					}
					if (i[h] == 255 && i[h + 1] == u) {
						var Je = i[h + 2] << 8 | i[h + 3];
						for (b = new Uint8Array(Je + 2), b[0] = i[h], b[1] = i[h + 1], b[2] = i[h + 2], b[3] = i[h + 3], S = 0; S < Je - 2; S++) b[S + 4] = i[h + S + 4];
					} else {
						b = new Uint8Array(8 + 2 * n);
						var Ve = 0;
						if (b[Ve++] = 255, b[Ve++] = u, b[Ve++] = 0, b[Ve++] = 6 + 2 * n, b[Ve++] = n, n == 1) b[Ve++] = 1, b[Ve++] = 0;
						else for (S = 0; S < 3; S++) b[Ve++] = S + 1, b[Ve++] = S << 4 | S;
						b[Ve++] = 0, b[Ve++] = 63, b[Ve++] = 0;
					}
					return {
						jpegOffset: o,
						tables: c,
						sosMarker: b,
						sofPosition: ve
					};
				}, r.decode._decodeOldJPEG = function(a, i, o, v, y, _) {
					var g, p, m, u, D, h = r.decode._decodeOldJPEGInit(a, i, o, v);
					if (h.jpegOffset != null) for (p = o + v - h.jpegOffset, u = new Uint8Array(p), g = 0; g < p; g++) u[g] = i[h.jpegOffset + g];
					else {
						for (m = h.tables.length, u = new Uint8Array(m + h.sosMarker.length + v + 2), u.set(h.tables), D = m, u[h.sofPosition + 5] = a.height >>> 8 & 255, u[h.sofPosition + 6] = a.height & 255, u[h.sofPosition + 7] = a.width >>> 8 & 255, u[h.sofPosition + 8] = a.width & 255, (i[o] != 255 || i[o + 1] != SOS) && (u.set(h.sosMarker, D), D += sosMarker.length), g = 0; g < v; g++) u[D++] = i[o + g];
						u[D++] = 255, u[D++] = EOI;
					}
					var c = new r.JpegDecoder();
					c.parse(u);
					for (var b = c.getData(c.width, c.height), g = 0; g < b.length; g++) y[_ + g] = b[g];
					a.t262 && a.t262[0] == 6 && (a.t262[0] = 2);
				}, r.decode._decodePackBits = function(a, i, o, v, y) {
					for (var _ = new Int8Array(a.buffer), g = new Int8Array(v.buffer), p = i + o; i < p;) {
						var m = _[i];
						if (i++, m >= 0 && m < 128) for (var u = 0; u < m + 1; u++) g[y] = _[i], y++, i++;
						if (m >= -127 && m < 0) {
							for (var u = 0; u < -m + 1; u++) g[y] = _[i], y++;
							i++;
						}
					}
				}, r.decode._decodeThunder = function(a, i, o, v, y) {
					for (var _ = [
						0,
						1,
						0,
						-1
					], g = [
						0,
						1,
						2,
						3,
						0,
						-3,
						-2,
						-1
					], p = i + o, m = y * 2, u = 0; i < p;) {
						var D = a[i], h = D >>> 6, c = D & 63;
						if (i++, h == 3 && (u = c & 15, v[m >>> 1] |= u << 4 * (1 - m & 1), m++), h == 0) for (var b = 0; b < c; b++) v[m >>> 1] |= u << 4 * (1 - m & 1), m++;
						if (h == 2) for (var b = 0; b < 2; b++) {
							var L = c >>> 3 * (1 - b) & 7;
							L != 4 && (u += g[L], v[m >>> 1] |= u << 4 * (1 - m & 1), m++);
						}
						if (h == 1) for (var b = 0; b < 3; b++) {
							var L = c >>> 2 * (2 - b) & 3;
							L != 2 && (u += _[L], v[m >>> 1] |= u << 4 * (1 - m & 1), m++);
						}
					}
				}, r.decode._dmap = {
					1: 0,
					"011": 1,
					"000011": 2,
					"0000011": 3,
					"010": -1,
					"000010": -2,
					"0000010": -3
				}, r.decode._lens = (function() {
					var a = function(m, u, D, h) {
						for (var c = 0; c < u.length; c++) m[u[c]] = D + c * h;
					}, i = "00110101,000111,0111,1000,1011,1100,1110,1111,10011,10100,00111,01000,001000,000011,110100,110101,101010,101011,0100111,0001100,0001000,0010111,0000011,0000100,0101000,0101011,0010011,0100100,0011000,00000010,00000011,00011010,00011011,00010010,00010011,00010100,00010101,00010110,00010111,00101000,00101001,00101010,00101011,00101100,00101101,00000100,00000101,00001010,00001011,01010010,01010011,01010100,01010101,00100100,00100101,01011000,01011001,01011010,01011011,01001010,01001011,00110010,00110011,00110100", o = "0000110111,010,11,10,011,0011,0010,00011,000101,000100,0000100,0000101,0000111,00000100,00000111,000011000,0000010111,0000011000,0000001000,00001100111,00001101000,00001101100,00000110111,00000101000,00000010111,00000011000,000011001010,000011001011,000011001100,000011001101,000001101000,000001101001,000001101010,000001101011,000011010010,000011010011,000011010100,000011010101,000011010110,000011010111,000001101100,000001101101,000011011010,000011011011,000001010100,000001010101,000001010110,000001010111,000001100100,000001100101,000001010010,000001010011,000000100100,000000110111,000000111000,000000100111,000000101000,000001011000,000001011001,000000101011,000000101100,000001011010,000001100110,000001100111", v = "11011,10010,010111,0110111,00110110,00110111,01100100,01100101,01101000,01100111,011001100,011001101,011010010,011010011,011010100,011010101,011010110,011010111,011011000,011011001,011011010,011011011,010011000,010011001,010011010,011000,010011011", y = "0000001111,000011001000,000011001001,000001011011,000000110011,000000110100,000000110101,0000001101100,0000001101101,0000001001010,0000001001011,0000001001100,0000001001101,0000001110010,0000001110011,0000001110100,0000001110101,0000001110110,0000001110111,0000001010010,0000001010011,0000001010100,0000001010101,0000001011010,0000001011011,0000001100100,0000001100101", _ = "00000001000,00000001100,00000001101,000000010010,000000010011,000000010100,000000010101,000000010110,000000010111,000000011100,000000011101,000000011110,000000011111";
					i = i.split(","), o = o.split(","), v = v.split(","), y = y.split(","), _ = _.split(",");
					var g = {}, p = {};
					return a(g, i, 0, 1), a(g, v, 64, 64), a(g, _, 1792, 64), a(p, o, 0, 1), a(p, y, 64, 64), a(p, _, 1792, 64), [g, p];
				})(), r.decode._decodeG4 = function(a, i, o, v, y, _, g) {
					for (var p = r.decode, m = i << 3, u = 0, D = "", h = [], c = [], b = 0; b < _; b++) c.push(0);
					c = p._makeDiff(c);
					for (var L = 0, S = 0, R = 0, P = 0, M = 0, ee = 0, V = "", F = 0, K = Math.ceil(_ / 8) * 8; m >>> 3 < i + o;) {
						R = p._findDiff(c, L + (L == 0 ? 0 : 1), 1 - M), P = p._findDiff(c, R, M);
						var k = 0;
						if (g == 1 && (k = a[m >>> 3] >>> 7 - (m & 7) & 1), g == 2 && (k = a[m >>> 3] >>> (m & 7) & 1), m++, D += k, V == "H") {
							if (p._lens[M][D] != null) {
								var Q = p._lens[M][D];
								D = "", u += Q, Q < 64 && (p._addNtimes(h, u, M), L += u, M = 1 - M, u = 0, F--, F == 0 && (V = ""));
							}
						} else D == "0001" && (D = "", p._addNtimes(h, P - L, M), L = P), D == "001" && (D = "", V = "H", F = 2), p._dmap[D] != null && (S = R + p._dmap[D], p._addNtimes(h, S - L, M), L = S, D = "", M = 1 - M);
						h.length == _ && V == "" && (p._writeBits(h, v, y * 8 + ee * K), M = 0, ee++, L = 0, c = p._makeDiff(h), h = []);
					}
				}, r.decode._findDiff = function(a, i, o) {
					for (var v = 0; v < a.length; v += 2) if (a[v] >= i && a[v + 1] == o) return a[v];
				}, r.decode._makeDiff = function(a) {
					var i = [];
					a[0] == 1 && i.push(0, 1);
					for (var o = 1; o < a.length; o++) a[o - 1] != a[o] && i.push(o, a[o]);
					return i.push(a.length, 0, a.length, 1), i;
				}, r.decode._decodeG3 = function(a, i, o, v, y, _, g) {
					for (var p = r.decode, m = i << 3, u = 0, D = "", h = [], c = [], b = 0; b < _; b++) h.push(0);
					for (var L = 0, S = 0, R = 0, P = 0, M = 0, ee = -1, V = "", F = 0, K = !1, k = Math.ceil(_ / 8) * 8; m >>> 3 < i + o;) {
						R = p._findDiff(c, L + (L == 0 ? 0 : 1), 1 - M), P = p._findDiff(c, R, M);
						var Q = 0;
						if (g == 1 && (Q = a[m >>> 3] >>> 7 - (m & 7) & 1), g == 2 && (Q = a[m >>> 3] >>> (m & 7) & 1), m++, D += Q, K) {
							if (p._lens[M][D] != null) {
								var J = p._lens[M][D];
								D = "", u += J, J < 64 && (p._addNtimes(h, u, M), M = 1 - M, u = 0);
							}
						} else if (V == "H") {
							if (p._lens[M][D] != null) {
								var J = p._lens[M][D];
								D = "", u += J, J < 64 && (p._addNtimes(h, u, M), L += u, M = 1 - M, u = 0, F--, F == 0 && (V = ""));
							}
						} else D == "0001" && (D = "", p._addNtimes(h, P - L, M), L = P), D == "001" && (D = "", V = "H", F = 2), p._dmap[D] != null && (S = R + p._dmap[D], p._addNtimes(h, S - L, M), L = S, D = "", M = 1 - M);
						D.endsWith("000000000001") && (ee >= 0 && p._writeBits(h, v, y * 8 + ee * k), g == 1 && (K = (a[m >>> 3] >>> 7 - (m & 7) & 1) == 1), g == 2 && (K = (a[m >>> 3] >>> (m & 7) & 1) == 1), m++, p._decodeG3.allow2D ?? (p._decodeG3.allow2D = K), p._decodeG3.allow2D || (K = !0, m--), D = "", M = 0, ee++, L = 0, c = p._makeDiff(h), h = []);
					}
					h.length == _ && p._writeBits(h, v, y * 8 + ee * k);
				}, r.decode._addNtimes = function(a, i, o) {
					for (var v = 0; v < i; v++) a.push(o);
				}, r.decode._writeBits = function(a, i, o) {
					for (var v = 0; v < a.length; v++) i[o + v >>> 3] |= a[v] << 7 - (o + v & 7);
				}, r.decode._decodeLZW = function(a, i, o, v) {
					if (r.decode._lzwTab == null) {
						for (var y = new Uint32Array(65535), _ = new Uint16Array(65535), g = new Uint8Array(2e6), p = 0; p < 256; p++) g[p << 2] = p, y[p] = p << 2, _[p] = 1;
						r.decode._lzwTab = [
							y,
							_,
							g
						];
					}
					for (var m = r.decode._copyData, u = r.decode._lzwTab[0], D = r.decode._lzwTab[1], g = r.decode._lzwTab[2], h = 258, c = 1032, b = 9, L = i << 3, S = 256, R = 257, P = 0, M = 0, ee = 0; P = a[L >>> 3] << 16 | a[L + 8 >>> 3] << 8 | a[L + 16 >>> 3], M = P >> 24 - (L & 7) - b & (1 << b) - 1, L += b, M != R;) {
						if (M == S) {
							if (b = 9, h = 258, c = 1032, P = a[L >>> 3] << 16 | a[L + 8 >>> 3] << 8 | a[L + 16 >>> 3], M = P >> 24 - (L & 7) - b & (1 << b) - 1, L += b, M == R) break;
							o[v] = M, v++;
						} else if (M < h) {
							var V = u[M], F = D[M];
							if (m(g, V, o, v, F), v += F, ee >= h) u[h] = c, g[u[h]] = V[0], D[h] = 1, c = c + 1 + 3 & -4, h++;
							else {
								u[h] = c;
								var K = u[ee], k = D[ee];
								m(g, K, g, c, k), g[c + k] = g[V], k++, D[h] = k, h++, c = c + k + 3 & -4;
							}
							h + 1 == 1 << b && b++;
						} else {
							if (ee >= h) u[h] = c, D[h] = 0, h++;
							else {
								u[h] = c;
								var K = u[ee], k = D[ee];
								m(g, K, g, c, k), g[c + k] = g[c], k++, D[h] = k, h++, m(g, c, o, v, k), v += k, c = c + k + 3 & -4;
							}
							h + 1 == 1 << b && b++;
						}
						ee = M;
					}
				}, r.decode._copyData = function(a, i, o, v, y) {
					for (var _ = 0; _ < y; _ += 4) o[v + _] = a[i + _], o[v + _ + 1] = a[i + _ + 1], o[v + _ + 2] = a[i + _ + 2], o[v + _ + 3] = a[i + _ + 3];
				}, r.tags = {}, r.ttypes = {
					256: 3,
					257: 3,
					258: 3,
					259: 3,
					262: 3,
					273: 4,
					274: 3,
					277: 3,
					278: 4,
					279: 4,
					282: 5,
					283: 5,
					284: 3,
					286: 5,
					287: 5,
					296: 3,
					305: 2,
					306: 2,
					338: 3,
					513: 4,
					514: 4,
					34665: 4
				}, r._readIFD = function(a, i, o, v, y, _) {
					var g = a.readUshort(i, o);
					o += 2;
					var p = {};
					v.push(p), _ && f("   ".repeat(y), v.length - 1, ">>>----------------");
					for (var m = 0; m < g; m++) {
						var u = a.readUshort(i, o);
						o += 2;
						var D = a.readUshort(i, o);
						o += 2;
						var h = a.readUint(i, o);
						o += 4;
						var c = a.readUint(i, o);
						o += 4;
						var b = [];
						if ((D == 1 || D == 7) && (b = new Uint8Array(i.buffer, h < 5 ? o - 4 : c, h)), D == 2) {
							var L = h < 5 ? o - 4 : c;
							i[L] < 128 ? b.push(a.readASCII(i, L, h - 1)) : b = new Uint8Array(i.buffer, L, h - 1);
						}
						if (D == 3) for (var S = 0; S < h; S++) b.push(a.readUshort(i, (h < 3 ? o - 4 : c) + 2 * S));
						if (D == 4) for (var S = 0; S < h; S++) b.push(a.readUint(i, (h < 2 ? o - 4 : c) + 4 * S));
						if (D == 5) for (var S = 0; S < h; S++) b.push(a.readUint(i, c + S * 8) / a.readUint(i, c + S * 8 + 4));
						if (D == 8) for (var S = 0; S < h; S++) b.push(a.readShort(i, (h < 3 ? o - 4 : c) + 2 * S));
						if (D == 9) for (var S = 0; S < h; S++) b.push(a.readInt(i, (h < 2 ? o - 4 : c) + 4 * S));
						if (D == 10) for (var S = 0; S < h; S++) b.push(a.readInt(i, c + S * 8) / a.readInt(i, c + S * 8 + 4));
						if (D == 11) for (var S = 0; S < h; S++) b.push(a.readFloat(i, c + S * 4));
						if (D == 12) for (var S = 0; S < h; S++) b.push(a.readDouble(i, c + S * 8));
						if (p["t" + u] = b, h != 0 && b.length == 0 && f("unknown TIFF tag type: ", D, "num:", h), _ && f("   ".repeat(y), u, D, r.tags[u], b), !(u == 330 && p.t272 && p.t272[0] == "DSLR-A100") && (u == 330 || u == 34665 || u == 50740 && a.readUshort(i, a.readUint(b, 0)) < 300)) {
							for (var R = u == 50740 ? [a.readUint(b, 0)] : b, P = [], S = 0; S < R.length; S++) r._readIFD(a, i, R[S], P, y + 1, _);
							u == 330 && (p.subIFD = P), u == 34665 && (p.exifIFD = P[0]), u == 50740 && (p.dngPrvt = P[0]);
						}
						if (u == 37500) {
							var M = b;
							if (a.readASCII(M, 0, 5) == "Nikon") p.makerNote = r.decode(M.slice(10).buffer)[0];
							else if (a.readUshort(i, c) < 300) {
								var ee = [];
								r._readIFD(a, i, c, ee, y + 1, _), p.makerNote = ee[0];
							}
						}
					}
					return _ && f("   ".repeat(y), "<<<---------------"), o;
				}, r._writeIFD = function(a, i, o, v) {
					var y = Object.keys(v);
					a.writeUshort(i, o, y.length), o += 2;
					for (var _ = o + y.length * 12 + 4, g = 0; g < y.length; g++) {
						var p = y[g], m = parseInt(p.slice(1)), u = r.ttypes[m];
						if (u == null) throw new Error("unknown type of tag: " + m);
						var D = v[p];
						u == 2 && (D = D[0] + "\0");
						var h = D.length;
						a.writeUshort(i, o, m), o += 2, a.writeUshort(i, o, u), o += 2, a.writeUint(i, o, h), o += 4;
						var c = [
							-1,
							1,
							1,
							2,
							4,
							8,
							0,
							0,
							0,
							0,
							0,
							0,
							8
						][u] * h, b = o;
						if (c > 4 && (a.writeUint(i, o, _), b = _), u == 2 && a.writeASCII(i, b, D), u == 3) for (var L = 0; L < h; L++) a.writeUshort(i, b + 2 * L, D[L]);
						if (u == 4) for (var L = 0; L < h; L++) a.writeUint(i, b + 4 * L, D[L]);
						if (u == 5) for (var L = 0; L < h; L++) a.writeUint(i, b + 8 * L, Math.round(D[L] * 1e4)), a.writeUint(i, b + 8 * L + 4, 1e4);
						if (u == 12) for (var L = 0; L < h; L++) a.writeDouble(i, b + 8 * L, D[L]);
						c > 4 && (c += c & 1, _ += c), o += 4;
					}
					return [o, _];
				}, r.toRGBA8 = function(a) {
					var i = a.width, o = a.height, v = i * o, y = v * 4, _ = a.data, g = new Uint8Array(v * 4), p = a.t262 ? a.t262[0] : 2, m = a.t258 ? Math.min(32, a.t258[0]) : 1;
					if (p == 0) for (var u = Math.ceil(m * i / 8), D = 0; D < o; D++) {
						var h = D * u, c = D * i;
						if (m == 1) for (var b = 0; b < i; b++) {
							var L = c + b << 2, S = _[h + (b >> 3)] >> 7 - (b & 7) & 1;
							g[L] = g[L + 1] = g[L + 2] = (1 - S) * 255, g[L + 3] = 255;
						}
						if (m == 4) for (var b = 0; b < i; b++) {
							var L = c + b << 2, S = _[h + (b >> 1)] >> 4 - 4 * (b & 1) & 15;
							g[L] = g[L + 1] = g[L + 2] = (15 - S) * 17, g[L + 3] = 255;
						}
						if (m == 8) for (var b = 0; b < i; b++) {
							var L = c + b << 2, S = _[h + b];
							g[L] = g[L + 1] = g[L + 2] = 255 - S, g[L + 3] = 255;
						}
					}
					else if (p == 1) for (var u = Math.ceil(m * i / 8), D = 0; D < o; D++) {
						var h = D * u, c = D * i;
						if (m == 1) for (var b = 0; b < i; b++) {
							var L = c + b << 2, S = _[h + (b >> 3)] >> 7 - (b & 7) & 1;
							g[L] = g[L + 1] = g[L + 2] = S * 255, g[L + 3] = 255;
						}
						if (m == 2) for (var b = 0; b < i; b++) {
							var L = c + b << 2, S = _[h + (b >> 2)] >> 6 - 2 * (b & 3) & 3;
							g[L] = g[L + 1] = g[L + 2] = S * 85, g[L + 3] = 255;
						}
						if (m == 8) for (var b = 0; b < i; b++) {
							var L = c + b << 2, S = _[h + b];
							g[L] = g[L + 1] = g[L + 2] = S, g[L + 3] = 255;
						}
						if (m == 16) for (var b = 0; b < i; b++) {
							var L = c + b << 2, S = _[h + (2 * b + 1)];
							g[L] = g[L + 1] = g[L + 2] = Math.min(255, S), g[L + 3] = 255;
						}
					}
					else if (p == 2) {
						var R = a.t258 ? a.t258.length : 3;
						if (m == 8) {
							if (R == 4) for (var b = 0; b < y; b++) g[b] = _[b];
							if (R == 3) for (var b = 0; b < v; b++) {
								var L = b << 2, P = b * 3;
								g[L] = _[P], g[L + 1] = _[P + 1], g[L + 2] = _[P + 2], g[L + 3] = 255;
							}
						} else {
							if (R == 4) for (var b = 0; b < v; b++) {
								var L = b << 2, P = b * 8 + 1;
								g[L] = _[P], g[L + 1] = _[P + 2], g[L + 2] = _[P + 4], g[L + 3] = _[P + 6];
							}
							if (R == 3) for (var b = 0; b < v; b++) {
								var L = b << 2, P = b * 6 + 1;
								g[L] = _[P], g[L + 1] = _[P + 2], g[L + 2] = _[P + 4], g[L + 3] = 255;
							}
						}
					} else if (p == 3) for (var M = a.t320, b = 0; b < v; b++) {
						var L = b << 2, ee = _[b];
						g[L] = M[ee] >> 8, g[L + 1] = M[256 + ee] >> 8, g[L + 2] = M[512 + ee] >> 8, g[L + 3] = 255;
					}
					else if (p == 5) for (var R = a.t258 ? a.t258.length : 4, V = R > 4 ? 1 : 0, b = 0; b < v; b++) {
						var L = b << 2, F = b * R, K = 255 - _[F], k = 255 - _[F + 1], Q = 255 - _[F + 2], J = (255 - _[F + 3]) * (1 / 255);
						g[L] = ~~(K * J + .5), g[L + 1] = ~~(k * J + .5), g[L + 2] = ~~(Q * J + .5), g[L + 3] = 255 * (1 - V) + _[F + 4] * V;
					}
					else f("Unknown Photometric interpretation: " + p);
					return g;
				}, r.replaceIMG = function(a) {
					a ?? (a = document.getElementsByTagName("img"));
					for (var i = [
						"tif",
						"tiff",
						"dng",
						"cr2",
						"nef"
					], o = 0; o < a.length; o++) {
						var v = a[o], y = v.getAttribute("src");
						if (y != null) {
							var _ = y.split(".").pop().toLowerCase();
							if (i.indexOf(_) != -1) {
								var g = new XMLHttpRequest();
								r._xhrs.push(g), r._imgs.push(v), g.open("GET", y), g.responseType = "arraybuffer", g.onload = r._imgLoaded, g.send();
							}
						}
					}
				}, r._xhrs = [], r._imgs = [], r._imgLoaded = function(a) {
					var i = a.target.response, o = r.decode(i), v = o, y = 0, _ = v[0];
					o[0].subIFD && (v = v.concat(o[0].subIFD));
					for (var g = 0; g < v.length; g++) {
						var c = v[g];
						if (!(c.t258 == null || c.t258.length < 3)) {
							var p = c.t256 * c.t257;
							p > y && (y = p, _ = c);
						}
					}
					r.decodeImage(i, _, o);
					var m = r.toRGBA8(_), u = _.width, D = _.height, h = r._xhrs.indexOf(a.target), c = r._imgs[h];
					r._xhrs.splice(h, 1), r._imgs.splice(h, 1);
					var b = document.createElement("canvas");
					b.width = u, b.height = D;
					for (var L = b.getContext("2d"), S = L.createImageData(u, D), g = 0; g < m.length; g++) S.data[g] = m[g];
					L.putImageData(S, 0, 0), c.setAttribute("src", b.toDataURL());
				}, r._binBE = {
					nextZero: function(a, i) {
						for (; a[i] != 0;) i++;
						return i;
					},
					readUshort: function(a, i) {
						return a[i] << 8 | a[i + 1];
					},
					readShort: function(a, i) {
						var o = r._binBE.ui8;
						return o[0] = a[i + 1], o[1] = a[i + 0], r._binBE.i16[0];
					},
					readInt: function(a, i) {
						var o = r._binBE.ui8;
						return o[0] = a[i + 3], o[1] = a[i + 2], o[2] = a[i + 1], o[3] = a[i + 0], r._binBE.i32[0];
					},
					readUint: function(a, i) {
						var o = r._binBE.ui8;
						return o[0] = a[i + 3], o[1] = a[i + 2], o[2] = a[i + 1], o[3] = a[i + 0], r._binBE.ui32[0];
					},
					readASCII: function(a, i, o) {
						for (var v = "", y = 0; y < o; y++) v += String.fromCharCode(a[i + y]);
						return v;
					},
					readFloat: function(a, i) {
						for (var o = r._binBE.ui8, v = 0; v < 4; v++) o[v] = a[i + 3 - v];
						return r._binBE.fl32[0];
					},
					readDouble: function(a, i) {
						for (var o = r._binBE.ui8, v = 0; v < 8; v++) o[v] = a[i + 7 - v];
						return r._binBE.fl64[0];
					},
					writeUshort: function(a, i, o) {
						a[i] = o >> 8 & 255, a[i + 1] = o & 255;
					},
					writeUint: function(a, i, o) {
						a[i] = o >> 24 & 255, a[i + 1] = o >> 16 & 255, a[i + 2] = o >> 8 & 255, a[i + 3] = o >> 0 & 255;
					},
					writeASCII: function(a, i, o) {
						for (var v = 0; v < o.length; v++) a[i + v] = o.charCodeAt(v);
					},
					writeDouble: function(a, i, o) {
						r._binBE.fl64[0] = o;
						for (var v = 0; v < 8; v++) a[i + v] = r._binBE.ui8[7 - v];
					}
				}, r._binBE.ui8 = new Uint8Array(8), r._binBE.i16 = new Int16Array(r._binBE.ui8.buffer), r._binBE.i32 = new Int32Array(r._binBE.ui8.buffer), r._binBE.ui32 = new Uint32Array(r._binBE.ui8.buffer), r._binBE.fl32 = new Float32Array(r._binBE.ui8.buffer), r._binBE.fl64 = new Float64Array(r._binBE.ui8.buffer), r._binLE = {
					nextZero: r._binBE.nextZero,
					readUshort: function(a, i) {
						return a[i + 1] << 8 | a[i];
					},
					readShort: function(a, i) {
						var o = r._binBE.ui8;
						return o[0] = a[i + 0], o[1] = a[i + 1], r._binBE.i16[0];
					},
					readInt: function(a, i) {
						var o = r._binBE.ui8;
						return o[0] = a[i + 0], o[1] = a[i + 1], o[2] = a[i + 2], o[3] = a[i + 3], r._binBE.i32[0];
					},
					readUint: function(a, i) {
						var o = r._binBE.ui8;
						return o[0] = a[i + 0], o[1] = a[i + 1], o[2] = a[i + 2], o[3] = a[i + 3], r._binBE.ui32[0];
					},
					readASCII: r._binBE.readASCII,
					readFloat: function(a, i) {
						for (var o = r._binBE.ui8, v = 0; v < 4; v++) o[v] = a[i + v];
						return r._binBE.fl32[0];
					},
					readDouble: function(a, i) {
						for (var o = r._binBE.ui8, v = 0; v < 8; v++) o[v] = a[i + v];
						return r._binBE.fl64[0];
					}
				}, r._copyTile = function(a, i, o, v, y, _, g, p) {
					for (var m = Math.min(i, y - g), u = Math.min(o, _ - p), D = 0; D < u; D++) for (var h = (p + D) * y + g, c = D * i, b = 0; b < m; b++) v[h + b] = a[c + b];
				}, r.LosslessJpegDecode = (function() {
					function a(y) {
						this.w = y, this.N = 0, this._ = 0, this.G = 0;
					}
					a.prototype = {
						t: function(y) {
							this.N = Math.max(0, Math.min(this.w.length, y));
						},
						i: function() {
							return this.w[this.N++];
						},
						l: function() {
							var y = this.N;
							return this.N += 2, this.w[y] << 8 | this.w[y + 1];
						},
						J: function() {
							return this._ == 0 && (this.G = this.w[this.N], this.N += 1 + (this.G + 1 >>> 8), this._ = 8), this.G >>> --this._ & 1;
						},
						Z: function(y) {
							var _ = this._, g = this.G, p = Math.min(_, y);
							y -= p, _ -= p;
							for (var m = g >>> _ & (1 << p) - 1; y > 0;) g = this.w[this.N], this.N += 1 + (g + 1 >>> 8), p = Math.min(8, y), y -= p, _ = 8 - p, m <<= p, m |= g >>> _ & (1 << p) - 1;
							return this._ = _, this.G = g, m;
						}
					};
					var i = {};
					i.X = function() {
						return [
							0,
							0,
							-1
						];
					}, i.s = function(y, _, g) {
						y[i.Y(y, 0, g) + 2] = _;
					}, i.Y = function(y, _, g) {
						if (y[_ + 2] != -1) return 0;
						if (g == 0) return _;
						for (var p = 0; p < 2; p++) {
							y[_ + p] == 0 && (y[_ + p] = y.length, y.push(0), y.push(0), y.push(-1));
							var m = i.Y(y, y[_ + p], g - 1);
							if (m != 0) return m;
						}
						return 0;
					}, i.B = function(y, _) {
						for (var g = 0, p = 0, m = 0, u = _._, D = _.G, h = _.N;;) if (u == 0 && (D = _.w[h], h += 1 + (D + 1 >>> 8), u = 8), m = D >>> --u & 1, g = y[g + m], p = y[g + 2], p != -1) return _._ = u, _.G = D, _.N = h, p;
						return -1;
					};
					function o(y) {
						this.z = new a(y), this.D(this.z);
					}
					o.prototype = {
						$: function(y, _) {
							this.Q = y.i(), this.F = y.l(), this.o = y.l();
							var g = this.O = y.i();
							this.L = [];
							for (var p = 0; p < g; p++) {
								var m = y.i();
								y.i(), y.i(), this.L[m] = p;
							}
							y.t(y.N + _ - (6 + g * 3));
						},
						e: function() {
							var y = 0, _ = this.z.i();
							this.H ?? (this.H = {});
							for (var g = this.H[_] = i.X(), p = [], m = 0; m < 16; m++) p[m] = this.z.i(), y += p[m];
							for (var m = 0; m < 16; m++) for (var u = 0; u < p[m]; u++) i.s(g, this.z.i(), m + 1);
							return y + 17;
						},
						W: function(y) {
							for (; y > 0;) y -= this.e();
						},
						p: function(y, _) {
							var g = y.i();
							this.U || (this.U = []);
							for (var p = 0; p < g; p++) {
								var m = y.i(), u = y.i();
								this.U[this.L[m]] = this.H[u >>> 4];
							}
							this.g = y.i(), y.t(y.N + _ - (2 + g * 2));
						},
						D: function(y) {
							var _ = !1, g = y.l();
							if (g === o.q) do {
								var g = y.l(), p = y.l() - 2;
								switch (g) {
									case o.m:
										this.$(y, p);
										break;
									case o.K:
										this.W(p);
										break;
									case o.V:
										this.p(y, p), _ = !0;
										break;
									default:
										y.t(y.N + p);
										break;
								}
							} while (!_);
						},
						I: function(y, _) {
							var g = i.B(_, y);
							if (g == 16) return -32768;
							var p = y.Z(g);
							return !(p & 1 << g - 1) && (p -= (1 << g) - 1), p;
						},
						B: function(y, _) {
							for (var g = this.z, p = this.O, m = this.F, u = this.I, D = this.g, h = this.o * p, c = this.U, b = 0; b < p; b++) y[b] = u(g, c[b]) + (1 << this.Q - 1);
							for (var L = p; L < h; L += p) for (var b = 0; b < p; b++) y[L + b] = u(g, c[b]) + y[L + b - p];
							for (var S = _, R = 1; R < m; R++) {
								for (var b = 0; b < p; b++) y[S + b] = u(g, c[b]) + y[S + b - _];
								for (var L = p; L < h; L += p) for (var b = 0; b < p; b++) {
									var P = S + L + b, M = y[P - p];
									D == 6 && (M = y[P - _] + (M - y[P - p - _] >>> 1)), y[P] = M + u(g, c[b]);
								}
								S += _;
							}
						}
					}, o.m = 65475, o.K = 65476, o.q = 65496, o.V = 65498;
					function v(y) {
						var _ = new o(y), g = new (_.Q > 8 ? Uint16Array : Uint8Array)(_.o * _.F * _.O), p = _.o * _.O;
						return _.B(g, p), g;
					}
					return v;
				})();
			})(t, U);
		})();
	}), t2 = l1(Gf(), 1);
	function ac(e) {
		"@babel/helpers - typeof";
		return ac = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(d) {
			return typeof d;
		} : function(d) {
			return d && typeof Symbol == "function" && d.constructor === Symbol && d !== Symbol.prototype ? "symbol" : typeof d;
		}, ac(e);
	}
	var a2 = /^\s+/, i2 = /\s+$/;
	function dt(e, d) {
		if (e = e || "", d = d || {}, e instanceof dt) return e;
		if (!(this instanceof dt)) return new dt(e, d);
		var t = n2(e);
		this._originalInput = e, this._r = t.r, this._g = t.g, this._b = t.b, this._a = t.a, this._roundA = Math.round(100 * this._a) / 100, this._format = d.format || t.format, this._gradientType = d.gradientType, this._r < 1 && (this._r = Math.round(this._r)), this._g < 1 && (this._g = Math.round(this._g)), this._b < 1 && (this._b = Math.round(this._b)), this._ok = t.ok;
	}
	dt.prototype = {
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
			var e = this.toRgb(), d, t, U, f, r, l;
			return d = e.r / 255, t = e.g / 255, U = e.b / 255, d <= .03928 ? f = d / 12.92 : f = Math.pow((d + .055) / 1.055, 2.4), t <= .03928 ? r = t / 12.92 : r = Math.pow((t + .055) / 1.055, 2.4), U <= .03928 ? l = U / 12.92 : l = Math.pow((U + .055) / 1.055, 2.4), .2126 * f + .7152 * r + .0722 * l;
		},
		setAlpha: function(e) {
			return this._a = Vh(e), this._roundA = Math.round(100 * this._a) / 100, this;
		},
		toHsv: function() {
			var e = Jh(this._r, this._g, this._b);
			return {
				h: e.h * 360,
				s: e.s,
				v: e.v,
				a: this._a
			};
		},
		toHsvString: function() {
			var e = Jh(this._r, this._g, this._b), d = Math.round(e.h * 360), t = Math.round(e.s * 100), U = Math.round(e.v * 100);
			return this._a == 1 ? "hsv(" + d + ", " + t + "%, " + U + "%)" : "hsva(" + d + ", " + t + "%, " + U + "%, " + this._roundA + ")";
		},
		toHsl: function() {
			var e = Xh(this._r, this._g, this._b);
			return {
				h: e.h * 360,
				s: e.s,
				l: e.l,
				a: this._a
			};
		},
		toHslString: function() {
			var e = Xh(this._r, this._g, this._b), d = Math.round(e.h * 360), t = Math.round(e.s * 100), U = Math.round(e.l * 100);
			return this._a == 1 ? "hsl(" + d + ", " + t + "%, " + U + "%)" : "hsla(" + d + ", " + t + "%, " + U + "%, " + this._roundA + ")";
		},
		toHex: function(e) {
			return Yh(this._r, this._g, this._b, e);
		},
		toHexString: function(e) {
			return "#" + this.toHex(e);
		},
		toHex8: function(e) {
			return o2(this._r, this._g, this._b, this._a, e);
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
				r: Math.round(Oa(this._r, 255) * 100) + "%",
				g: Math.round(Oa(this._g, 255) * 100) + "%",
				b: Math.round(Oa(this._b, 255) * 100) + "%",
				a: this._a
			};
		},
		toPercentageRgbString: function() {
			return this._a == 1 ? "rgb(" + Math.round(Oa(this._r, 255) * 100) + "%, " + Math.round(Oa(this._g, 255) * 100) + "%, " + Math.round(Oa(this._b, 255) * 100) + "%)" : "rgba(" + Math.round(Oa(this._r, 255) * 100) + "%, " + Math.round(Oa(this._g, 255) * 100) + "%, " + Math.round(Oa(this._b, 255) * 100) + "%, " + this._roundA + ")";
		},
		toName: function() {
			return this._a === 0 ? "transparent" : this._a < 1 ? !1 : y2[Yh(this._r, this._g, this._b, !0)] || !1;
		},
		toFilter: function(e) {
			var d = "#" + $h(this._r, this._g, this._b, this._a), t = d, U = this._gradientType ? "GradientType = 1, " : "";
			if (e) {
				var f = dt(e);
				t = "#" + $h(f._r, f._g, f._b, f._a);
			}
			return "progid:DXImageTransform.Microsoft.gradient(" + U + "startColorstr=" + d + ",endColorstr=" + t + ")";
		},
		toString: function(e) {
			var d = !!e;
			e = e || this._format;
			var t = !1, U = this._a < 1 && this._a >= 0;
			return !d && U && (e === "hex" || e === "hex6" || e === "hex3" || e === "hex4" || e === "hex8" || e === "name") ? e === "name" && this._a === 0 ? this.toName() : this.toRgbString() : (e === "rgb" && (t = this.toRgbString()), e === "prgb" && (t = this.toPercentageRgbString()), (e === "hex" || e === "hex6") && (t = this.toHexString()), e === "hex3" && (t = this.toHexString(!0)), e === "hex4" && (t = this.toHex8String(!0)), e === "hex8" && (t = this.toHex8String()), e === "name" && (t = this.toName()), e === "hsl" && (t = this.toHslString()), e === "hsv" && (t = this.toHsvString()), t || this.toHexString());
		},
		clone: function() {
			return dt(this.toString());
		},
		_applyModification: function(e, d) {
			var t = e.apply(null, [this].concat([].slice.call(d)));
			return this._r = t._r, this._g = t._g, this._b = t._b, this.setAlpha(t._a), this;
		},
		lighten: function() {
			return this._applyModification(g2, arguments);
		},
		brighten: function() {
			return this._applyModification(f2, arguments);
		},
		darken: function() {
			return this._applyModification(p2, arguments);
		},
		desaturate: function() {
			return this._applyModification(c2, arguments);
		},
		saturate: function() {
			return this._applyModification(h2, arguments);
		},
		greyscale: function() {
			return this._applyModification(l2, arguments);
		},
		spin: function() {
			return this._applyModification(u2, arguments);
		},
		_applyCombination: function(e, d) {
			return e.apply(null, [this].concat([].slice.call(d)));
		},
		analogous: function() {
			return this._applyCombination(x2, arguments);
		},
		complement: function() {
			return this._applyCombination(b2, arguments);
		},
		monochromatic: function() {
			return this._applyCombination(v2, arguments);
		},
		splitcomplement: function() {
			return this._applyCombination(m2, arguments);
		},
		triad: function() {
			return this._applyCombination(qh, [3]);
		},
		tetrad: function() {
			return this._applyCombination(qh, [4]);
		}
	}, dt.fromRatio = function(e, d) {
		if (ac(e) == "object") {
			var t = {};
			for (var U in e) e.hasOwnProperty(U) && (U === "a" ? t[U] = e[U] : t[U] = io(e[U]));
			e = t;
		}
		return dt(e, d);
	};
	function n2(e) {
		var d = {
			r: 0,
			g: 0,
			b: 0
		}, t = 1, U = null, f = null, r = null, l = !1, a = !1;
		return typeof e == "string" && (e = w2(e)), ac(e) == "object" && (hr(e.r) && hr(e.g) && hr(e.b) ? (d = r2(e.r, e.g, e.b), l = !0, a = String(e.r).substr(-1) === "%" ? "prgb" : "rgb") : hr(e.h) && hr(e.s) && hr(e.v) ? (U = io(e.s), f = io(e.v), d = d2(e.h, U, f), l = !0, a = "hsv") : hr(e.h) && hr(e.s) && hr(e.l) && (U = io(e.s), r = io(e.l), d = s2(e.h, U, r), l = !0, a = "hsl"), e.hasOwnProperty("a") && (t = e.a)), t = Vh(t), {
			ok: l,
			format: e.format || a,
			r: Math.min(255, Math.max(d.r, 0)),
			g: Math.min(255, Math.max(d.g, 0)),
			b: Math.min(255, Math.max(d.b, 0)),
			a: t
		};
	}
	function r2(e, d, t) {
		return {
			r: Oa(e, 255) * 255,
			g: Oa(d, 255) * 255,
			b: Oa(t, 255) * 255
		};
	}
	function Xh(e, d, t) {
		e = Oa(e, 255), d = Oa(d, 255), t = Oa(t, 255);
		var U = Math.max(e, d, t), f = Math.min(e, d, t), r, l, a = (U + f) / 2;
		if (U == f) r = l = 0;
		else {
			var i = U - f;
			switch (l = a > .5 ? i / (2 - U - f) : i / (U + f), U) {
				case e:
					r = (d - t) / i + (d < t ? 6 : 0);
					break;
				case d:
					r = (t - e) / i + 2;
					break;
				case t:
					r = (e - d) / i + 4;
					break;
			}
			r /= 6;
		}
		return {
			h: r,
			s: l,
			l: a
		};
	}
	function s2(e, d, t) {
		var U, f, r;
		e = Oa(e, 360), d = Oa(d, 100), t = Oa(t, 100);
		function l(o, v, y) {
			return y < 0 && (y += 1), y > 1 && (y -= 1), y < 1 / 6 ? o + (v - o) * 6 * y : y < 1 / 2 ? v : y < 2 / 3 ? o + (v - o) * (2 / 3 - y) * 6 : o;
		}
		if (d === 0) U = f = r = t;
		else {
			var a = t < .5 ? t * (1 + d) : t + d - t * d, i = 2 * t - a;
			U = l(i, a, e + 1 / 3), f = l(i, a, e), r = l(i, a, e - 1 / 3);
		}
		return {
			r: U * 255,
			g: f * 255,
			b: r * 255
		};
	}
	function Jh(e, d, t) {
		e = Oa(e, 255), d = Oa(d, 255), t = Oa(t, 255);
		var U = Math.max(e, d, t), f = Math.min(e, d, t), r, l, a = U, i = U - f;
		if (l = U === 0 ? 0 : i / U, U == f) r = 0;
		else {
			switch (U) {
				case e:
					r = (d - t) / i + (d < t ? 6 : 0);
					break;
				case d:
					r = (t - e) / i + 2;
					break;
				case t:
					r = (e - d) / i + 4;
					break;
			}
			r /= 6;
		}
		return {
			h: r,
			s: l,
			v: a
		};
	}
	function d2(e, d, t) {
		e = Oa(e, 360) * 6, d = Oa(d, 100), t = Oa(t, 100);
		var U = Math.floor(e), f = e - U, r = t * (1 - d), l = t * (1 - f * d), a = t * (1 - (1 - f) * d), i = U % 6, o = [
			t,
			l,
			r,
			r,
			a,
			t
		][i], v = [
			a,
			t,
			t,
			l,
			r,
			r
		][i], y = [
			r,
			r,
			a,
			t,
			t,
			l
		][i];
		return {
			r: o * 255,
			g: v * 255,
			b: y * 255
		};
	}
	function Yh(e, d, t, U) {
		var f = [
			yn(Math.round(e).toString(16)),
			yn(Math.round(d).toString(16)),
			yn(Math.round(t).toString(16))
		];
		return U && f[0].charAt(0) == f[0].charAt(1) && f[1].charAt(0) == f[1].charAt(1) && f[2].charAt(0) == f[2].charAt(1) ? f[0].charAt(0) + f[1].charAt(0) + f[2].charAt(0) : f.join("");
	}
	function o2(e, d, t, U, f) {
		var r = [
			yn(Math.round(e).toString(16)),
			yn(Math.round(d).toString(16)),
			yn(Math.round(t).toString(16)),
			yn(Kh(U))
		];
		return f && r[0].charAt(0) == r[0].charAt(1) && r[1].charAt(0) == r[1].charAt(1) && r[2].charAt(0) == r[2].charAt(1) && r[3].charAt(0) == r[3].charAt(1) ? r[0].charAt(0) + r[1].charAt(0) + r[2].charAt(0) + r[3].charAt(0) : r.join("");
	}
	function $h(e, d, t, U) {
		return [
			yn(Kh(U)),
			yn(Math.round(e).toString(16)),
			yn(Math.round(d).toString(16)),
			yn(Math.round(t).toString(16))
		].join("");
	}
	dt.equals = function(e, d) {
		return !e || !d ? !1 : dt(e).toRgbString() == dt(d).toRgbString();
	}, dt.random = function() {
		return dt.fromRatio({
			r: Math.random(),
			g: Math.random(),
			b: Math.random()
		});
	};
	function c2(e, d) {
		d = d === 0 ? 0 : d || 10;
		var t = dt(e).toHsl();
		return t.s -= d / 100, t.s = ic(t.s), dt(t);
	}
	function h2(e, d) {
		d = d === 0 ? 0 : d || 10;
		var t = dt(e).toHsl();
		return t.s += d / 100, t.s = ic(t.s), dt(t);
	}
	function l2(e) {
		return dt(e).desaturate(100);
	}
	function g2(e, d) {
		d = d === 0 ? 0 : d || 10;
		var t = dt(e).toHsl();
		return t.l += d / 100, t.l = ic(t.l), dt(t);
	}
	function f2(e, d) {
		d = d === 0 ? 0 : d || 10;
		var t = dt(e).toRgb();
		return t.r = Math.max(0, Math.min(255, t.r - Math.round(255 * -(d / 100)))), t.g = Math.max(0, Math.min(255, t.g - Math.round(255 * -(d / 100)))), t.b = Math.max(0, Math.min(255, t.b - Math.round(255 * -(d / 100)))), dt(t);
	}
	function p2(e, d) {
		d = d === 0 ? 0 : d || 10;
		var t = dt(e).toHsl();
		return t.l -= d / 100, t.l = ic(t.l), dt(t);
	}
	function u2(e, d) {
		var t = dt(e).toHsl(), U = (t.h + d) % 360;
		return t.h = U < 0 ? 360 + U : U, dt(t);
	}
	function b2(e) {
		var d = dt(e).toHsl();
		return d.h = (d.h + 180) % 360, dt(d);
	}
	function qh(e, d) {
		if (isNaN(d) || d <= 0) throw new Error("Argument to polyad must be a positive number");
		for (var t = dt(e).toHsl(), U = [dt(e)], f = 360 / d, r = 1; r < d; r++) U.push(dt({
			h: (t.h + r * f) % 360,
			s: t.s,
			l: t.l
		}));
		return U;
	}
	function m2(e) {
		var d = dt(e).toHsl(), t = d.h;
		return [
			dt(e),
			dt({
				h: (t + 72) % 360,
				s: d.s,
				l: d.l
			}),
			dt({
				h: (t + 216) % 360,
				s: d.s,
				l: d.l
			})
		];
	}
	function x2(e, d, t) {
		d = d || 6, t = t || 30;
		var U = dt(e).toHsl(), f = 360 / t, r = [dt(e)];
		for (U.h = (U.h - (f * d >> 1) + 720) % 360; --d;) U.h = (U.h + f) % 360, r.push(dt(U));
		return r;
	}
	function v2(e, d) {
		d = d || 6;
		for (var t = dt(e).toHsv(), U = t.h, f = t.s, r = t.v, l = [], a = 1 / d; d--;) l.push(dt({
			h: U,
			s: f,
			v: r
		})), r = (r + a) % 1;
		return l;
	}
	dt.mix = function(e, d, t) {
		t = t === 0 ? 0 : t || 50;
		var U = dt(e).toRgb(), f = dt(d).toRgb(), r = t / 100;
		return dt({
			r: (f.r - U.r) * r + U.r,
			g: (f.g - U.g) * r + U.g,
			b: (f.b - U.b) * r + U.b,
			a: (f.a - U.a) * r + U.a
		});
	}, dt.readability = function(e, d) {
		var t = dt(e), U = dt(d);
		return (Math.max(t.getLuminance(), U.getLuminance()) + .05) / (Math.min(t.getLuminance(), U.getLuminance()) + .05);
	}, dt.isReadable = function(e, d, t) {
		var U = dt.readability(e, d), f, r;
		switch (r = !1, f = k2(t), f.level + f.size) {
			case "AAsmall":
			case "AAAlarge":
				r = U >= 4.5;
				break;
			case "AAlarge":
				r = U >= 3;
				break;
			case "AAAsmall":
				r = U >= 7;
				break;
		}
		return r;
	}, dt.mostReadable = function(e, d, t) {
		var U = null, f = 0, r, l, a, i;
		t = t || {}, l = t.includeFallbackColors, a = t.level, i = t.size;
		for (var o = 0; o < d.length; o++) r = dt.readability(e, d[o]), r > f && (f = r, U = dt(d[o]));
		return dt.isReadable(e, U, {
			level: a,
			size: i
		}) || !l ? U : (t.includeFallbackColors = !1, dt.mostReadable(e, ["#fff", "#000"], t));
	};
	var f1 = dt.names = {
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
	}, y2 = dt.hexNames = D2(f1);
	function D2(e) {
		var d = {};
		for (var t in e) e.hasOwnProperty(t) && (d[e[t]] = t);
		return d;
	}
	function Vh(e) {
		return e = parseFloat(e), (isNaN(e) || e < 0 || e > 1) && (e = 1), e;
	}
	function Oa(e, d) {
		U2(e) && (e = "100%");
		var t = _2(e);
		return e = Math.min(d, Math.max(0, parseFloat(e))), t && (e = parseInt(e * d, 10) / 100), Math.abs(e - d) < 1e-6 ? 1 : e % d / parseFloat(d);
	}
	function ic(e) {
		return Math.min(1, Math.max(0, e));
	}
	function an(e) {
		return parseInt(e, 16);
	}
	function U2(e) {
		return typeof e == "string" && e.indexOf(".") != -1 && parseFloat(e) === 1;
	}
	function _2(e) {
		return typeof e == "string" && e.indexOf("%") != -1;
	}
	function yn(e) {
		return e.length == 1 ? "0" + e : "" + e;
	}
	function io(e) {
		return e <= 1 && (e = e * 100 + "%"), e;
	}
	function Kh(e) {
		return Math.round(parseFloat(e) * 255).toString(16);
	}
	function Qh(e) {
		return an(e) / 255;
	}
	var Dn = (function() {
		var e = "(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)", d = "[\\s|\\(]+(" + e + ")[,|\\s]+(" + e + ")[,|\\s]+(" + e + ")\\s*\\)?", t = "[\\s|\\(]+(" + e + ")[,|\\s]+(" + e + ")[,|\\s]+(" + e + ")[,|\\s]+(" + e + ")\\s*\\)?";
		return {
			CSS_UNIT: new RegExp(e),
			rgb: new RegExp("rgb" + d),
			rgba: new RegExp("rgba" + t),
			hsl: new RegExp("hsl" + d),
			hsla: new RegExp("hsla" + t),
			hsv: new RegExp("hsv" + d),
			hsva: new RegExp("hsva" + t),
			hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
			hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
			hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
			hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
		};
	})();
	function hr(e) {
		return !!Dn.CSS_UNIT.exec(e);
	}
	function w2(e) {
		e = e.replace(a2, "").replace(i2, "").toLowerCase();
		var d = !1;
		if (f1[e]) e = f1[e], d = !0;
		else if (e == "transparent") return {
			r: 0,
			g: 0,
			b: 0,
			a: 0,
			format: "name"
		};
		var t;
		return (t = Dn.rgb.exec(e)) ? {
			r: t[1],
			g: t[2],
			b: t[3]
		} : (t = Dn.rgba.exec(e)) ? {
			r: t[1],
			g: t[2],
			b: t[3],
			a: t[4]
		} : (t = Dn.hsl.exec(e)) ? {
			h: t[1],
			s: t[2],
			l: t[3]
		} : (t = Dn.hsla.exec(e)) ? {
			h: t[1],
			s: t[2],
			l: t[3],
			a: t[4]
		} : (t = Dn.hsv.exec(e)) ? {
			h: t[1],
			s: t[2],
			v: t[3]
		} : (t = Dn.hsva.exec(e)) ? {
			h: t[1],
			s: t[2],
			v: t[3],
			a: t[4]
		} : (t = Dn.hex8.exec(e)) ? {
			r: an(t[1]),
			g: an(t[2]),
			b: an(t[3]),
			a: Qh(t[4]),
			format: d ? "name" : "hex8"
		} : (t = Dn.hex6.exec(e)) ? {
			r: an(t[1]),
			g: an(t[2]),
			b: an(t[3]),
			format: d ? "name" : "hex"
		} : (t = Dn.hex4.exec(e)) ? {
			r: an(t[1] + "" + t[1]),
			g: an(t[2] + "" + t[2]),
			b: an(t[3] + "" + t[3]),
			a: Qh(t[4] + "" + t[4]),
			format: d ? "name" : "hex8"
		} : (t = Dn.hex3.exec(e)) ? {
			r: an(t[1] + "" + t[1]),
			g: an(t[2] + "" + t[2]),
			b: an(t[3] + "" + t[3]),
			format: d ? "name" : "hex"
		} : !1;
	}
	function k2(e) {
		var d, t;
		return e = e || {
			level: "AA",
			size: "small"
		}, d = (e.level || "AA").toUpperCase(), t = (e.size || "small").toLowerCase(), d !== "AA" && d !== "AAA" && (d = "AA"), t !== "small" && t !== "large" && (t = "small"), {
			level: d,
			size: t
		};
	}
	function T2(e, d) {
		"txml";
		d = d || {};
		var t = d.pos || 0, U = !!d.keepComments, f = !!d.keepWhitespace, r = "<", l = 60, a = ">", i = 62, o = 45, v = 47, y = 33, _ = 39, g = 34, p = 91, m = 93;
		function u(M) {
			for (var ee = []; e[t];) if (e.charCodeAt(t) == l) {
				if (e.charCodeAt(t + 1) === v) {
					var V = t + 2;
					if (t = e.indexOf(a, t), e.substring(V, t).indexOf(M) == -1) {
						var F = e.substring(0, t).split(`
`);
						throw new Error(`Unexpected close tag
Line: ` + (F.length - 1) + `
Column: ` + (F[F.length - 1].length + 1) + `
Char: ` + e[t]);
					}
					return t + 1 && (t += 1), ee;
				} else if (e.charCodeAt(t + 1) === y) {
					if (e.charCodeAt(t + 2) == o) {
						let s = t;
						for (; t !== -1 && !(e.charCodeAt(t) === i && e.charCodeAt(t - 1) == o && e.charCodeAt(t - 2) == o && t != -1);) t = e.indexOf(a, t + 1);
						t === -1 && (t = e.length), U && ee.push(e.substring(s, t + 1));
					} else if (e.charCodeAt(t + 2) === p && e.charCodeAt(t + 8) === p && e.substr(t + 3, 5).toLowerCase() === "cdata") {
						var K = e.indexOf("]]>", t);
						K == -1 ? (ee.push(e.substr(t + 9)), t = e.length) : (ee.push(e.substring(t + 9, K)), t = K + 3);
						continue;
					} else {
						let s = t + 1;
						t += 2;
						for (var k = !1; (e.charCodeAt(t) !== i || k === !0) && e[t];) e.charCodeAt(t) === p ? k = !0 : k === !0 && e.charCodeAt(t) === m && (k = !1), t++;
						ee.push(e.substring(s, t));
					}
					t++;
					continue;
				}
				var Q = L();
				ee.push(Q), Q.tagName[0] === "?" && (ee.push(...Q.children), Q.children = []);
			} else {
				var J = D();
				if (f) J.length > 0 && ee.push(J);
				else {
					var n = J.trim();
					n.length > 0 && ee.push(n);
				}
				t++;
			}
			return ee;
		}
		function D() {
			var M = t;
			return t = e.indexOf(r, t) - 1, t === -2 && (t = e.length), e.slice(M, t + 1);
		}
		var h = `\r
	>/= `;
		function c() {
			for (var M = t; h.indexOf(e[t]) === -1 && e[t];) t++;
			return e.slice(M, t);
		}
		var b = d.noChildNodes || [
			"img",
			"br",
			"input",
			"meta",
			"link",
			"hr"
		];
		function L() {
			t++;
			let M = c(), ee = {}, V = [];
			for (; e.charCodeAt(t) !== i && e[t];) {
				var F = e.charCodeAt(t);
				if (F > 64 && F < 91 || F > 96 && F < 123) {
					for (var K = c(), k = e.charCodeAt(t); k && k !== _ && k !== g && !(k > 64 && k < 91 || k > 96 && k < 123) && k !== i;) t++, k = e.charCodeAt(t);
					if (k === _ || k === g) {
						var Q = S();
						if (t === -1) return {
							tagName: M,
							attributes: ee,
							children: V
						};
					} else Q = null, t--;
					ee[K] = Q;
				}
				t++;
			}
			if (e.charCodeAt(t - 1) !== v) if (M == "script") {
				var J = t + 1;
				t = e.indexOf("<\/script>", t), V = [e.slice(J, t)], t += 9;
			} else if (M == "style") {
				var J = t + 1;
				t = e.indexOf("</style>", t), V = [e.slice(J, t)], t += 8;
			} else b.indexOf(M) === -1 ? (t++, V = u(M)) : t++;
			else t++;
			return {
				tagName: M,
				attributes: ee,
				children: V
			};
		}
		function S() {
			var M = e[t], ee = t + 1;
			return t = e.indexOf(M, ee), e.slice(ee, t);
		}
		function R() {
			var M = new RegExp("\\s" + d.attrName + `\\s*=['"]` + d.attrValue + `['"]`).exec(e);
			return M ? M.index : -1;
		}
		var P = null;
		if (d.attrValue !== void 0) {
			d.attrName = d.attrName || "id";
			for (var P = []; (t = R()) !== -1;) t = e.lastIndexOf("<", t), t !== -1 && P.push(L()), e = e.substr(t), t = 0;
		} else d.parseNode ? P = L() : P = u("");
		return d.filter && (P = filter(P, d.filter)), d.simplify ? el(Array.isArray(P) ? P : [P]) : (d.setPos && (P.pos = t), P);
	}
	var L2 = 1;
	function el(e) {
		let d = {};
		if (!e || !e.length) return {};
		if (e.length === 1 && typeof e[0] == "string") return e[0];
		e.forEach(function(U) {
			if (typeof U != "object") return;
			d[U.tagName] || (d[U.tagName] = []);
			let f = el(U.children);
			d[U.tagName].push(f), typeof f != "string" && (Object.keys(U.attributes).length && (f.attrs = U.attributes), f.attrs || (f.attrs = {}), f.attrs.order = L2++);
		});
		for (var t in d) d[t].length == 1 && (d[t] = d[t][0]);
		return d;
	}
	var F2 = l1(Hf(), 1), tl = l1(e2(), 1), p1 = tl.default.default || tl.default, al = {
		MsgQueue: [],
		isDone: !1
	}, il = !1, nl = null, Rr = 0, no, rl = [
		"he-IL",
		"ar-AE",
		"ar-SA",
		"dv-MV",
		"fa-IR",
		"ur-PK"
	], sl = 96, W2 = 914400, C2 = 72, A = sl / W2, S2 = (e, d = 150) => e >= 9525 ? e * A : d, nc = sl / C2, gn = (e) => e == null ? [] : Array.isArray(e) ? e : [e], Ia = (e, d = 0) => {
		let t = typeof e == "number" ? e : parseFloat(e);
		return Number.isFinite(t) ? t : d;
	}, A2 = 16, u1 = {
		cx: 9144e3,
		cy: 6858e3
	}, M2 = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/", B2 = "http://schemas.microsoft.com/office/2007/relationships/";
	function rc(e) {
		let d = [];
		return String(e || "").split("/").forEach(function(t) {
			if (!(t === "" || t === ".")) {
				if (t === "..") {
					d.pop();
					return;
				}
				d.push(t);
			}
		}), d.join("/");
	}
	function b1(e) {
		let d = rc(e), t = d.lastIndexOf("/");
		return t === -1 ? "" : d.slice(0, t);
	}
	function Ts(e, d) {
		return d ? /^[a-z][a-z0-9+.-]*:/i.test(d) || d.charAt(0) === "#" ? d : d.charAt(0) === "/" ? rc(d.slice(1)) : rc((b1(e) ? b1(e) + "/" : "") + d) : "";
	}
	function Ls(e) {
		let d = b1(e), t = rc(e).split("/").pop();
		return (d ? d + "/_rels/" : "_rels/") + t + ".rels";
	}
	function Fs(e) {
		return gn(x(e, ["Relationships", "Relationship"]));
	}
	function ro(e) {
		return String(e || "").replace(M2, "").replace(B2, "");
	}
	function so(e, d, t) {
		let U = d && d.attrs ? d.attrs : {};
		U.Id && (e[U.Id] = {
			type: ro(U.Type),
			target: Ts(t, U.Target)
		});
	}
	function dl() {
		return {
			idTable: {},
			idxTable: {},
			typeTable: {}
		};
	}
	function ol(e) {
		if (!e) return dl();
		try {
			return R2(e);
		} catch (d) {
			return console.warn("Unable to index PPTX layout/master nodes", d), dl();
		}
	}
	async function E2(e, d) {
		try {
			let t = await ni(e, "ppt/presentation.xml"), U = await ni(e, Ls("ppt/presentation.xml")), f = {};
			Fs(U).forEach(function(a) {
				let i = a && a.attrs ? a.attrs : {};
				i.Id && ro(i.Type) === "slide" && (f[i.Id] = Ts("ppt/presentation.xml", i.Target));
			});
			let r = gn(x(t, [
				"p:presentation",
				"p:sldIdLst",
				"p:sldId"
			])).map(function(a) {
				return f[x(a, ["attrs", "r:id"])];
			}).filter(function(a) {
				return a && d.indexOf(a) !== -1;
			});
			if (!r.length) return d;
			let l = new Set(r);
			return r.concat(d.filter(function(a) {
				return !l.has(a);
			}));
		} catch (t) {
			return console.warn("Unable to resolve PPTX slide order", t), d;
		}
	}
	var cl = 0, hl = 0, m1 = !0, Va = {}, ll = {}, sc = {};
	console.log(sc);
	var dc = {
		set processFullTheme(e) {
			m1 = e;
		},
		set settings(e) {
			sc = e;
		},
		set tableStyles(e) {
			ll = e;
		},
		set IE11(e) {
			il = e;
		}
	};
	async function ni(e, d, t = !1) {
		try {
			let U = await e.file(d).async("text");
			t && no <= 12 && (U = U.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1"));
			let f = T2(U, { simplify: !0 });
			return f["?xml"] && delete f["?xml"], f;
		} catch {
			return null;
		}
	}
	async function I2(e) {
		let d = gn(x(await ni(e, "[Content_Types].xml"), ["Types", "Override"])), t = [], U = [];
		for (let f of d) {
			let r = f.attrs || {}, l = String(r.PartName || "").replace(/^\/+/, "");
			switch (r.ContentType) {
				case "application/vnd.openxmlformats-officedocument.presentationml.slide+xml":
					t.push(l);
					break;
				case "application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml":
					U.push(l);
					break;
				default:
			}
		}
		return {
			slides: await E2(e, t),
			slideLayouts: U
		};
	}
	async function P2(e) {
		let d = await ni(e, "docProps/app.xml");
		no = parseInt(x(d, ["Properties", "AppVersion"])), Number.isFinite(no) || (no = A2), console.log("create by Office PowerPoint app verssion: ", no);
		let t = await ni(e, "ppt/presentation.xml"), U = x(t, [
			"p:presentation",
			"p:sldSz",
			"attrs"
		]) || u1, f = Ia(U.cx, u1.cx), r = Ia(U.cy, u1.cy), l = U.type;
		console.log("Presentation size type: ", l), nl = x(t, ["p:presentation", "p:defaultTextStyle"]) || {};
		let a = sc.incSlide || {};
		return cl = f * A + Ia(a.width, 0) | 0, hl = r * A + Ia(a.height, 0) | 0, {
			width: cl,
			height: hl
		};
	}
	async function z2(e, d, t, U) {
		self.postMessage({
			type: "INFO",
			data: "Processing slide" + (t + 1)
		});
		let f = await ni(e, Ls(d)), r = "", l = "", a = {};
		for (let C of Fs(f)) {
			let Y = C.attrs || {}, ve = ro(Y.Type);
			ve === "slideLayout" ? r = Ts(d, Y.Target) : ve === "diagramDrawing" && (l = Ts(d, Y.Target)), so(a, C, d);
		}
		let i = r ? await ni(e, r) : null, o = ol(i), v = x(i, [
			"p:sldLayout",
			"p:clrMapOvr",
			"a:overrideClrMapping"
		]);
		v !== void 0 && v.attrs;
		let y = r ? Ls(r) : "", _ = y ? await ni(e, y) : null, g = "", p = {};
		for (let C of Fs(_)) {
			let Y = C.attrs || {};
			ro(Y.Type) === "slideMaster" ? g = Ts(r, Y.Target) : so(p, C, r);
		}
		let m = g ? await ni(e, g) : null, u = x(m, ["p:sldMaster", "p:txStyles"]), D = ol(m), h = g ? Ls(g) : "", c = h ? await ni(e, h) : null, b = "", L = {};
		for (let C of Fs(c)) {
			let Y = C.attrs || {};
			ro(Y.Type) === "theme" ? b = Ts(g, Y.Target) : so(L, C, g);
		}
		var S = {}, R = null;
		if (b) {
			var P = Ls(b);
			R = await ni(e, b);
			var M = await ni(e, P);
			for (let C of Fs(M)) so(S, C, b);
		}
		var ee = {}, V = {};
		if (l) {
			var F = Ls(l);
			if (V = await ni(e, l), V != null && V != "") {
				var K = JSON.stringify(V);
				K = K.replace(/dsp:/g, "p:"), V = JSON.parse(K);
			}
			var k = await ni(e, F);
			if (k !== null) for (let C of Fs(k)) so(ee, C, l);
		}
		var Q = await ni(e, d, !0), J = x(Q, [
			"p:sld",
			"p:cSld",
			"p:spTree"
		]) || {}, n = {
			zip: e,
			slideLayoutContent: i,
			slideLayoutTables: o,
			slideMasterContent: m,
			slideMasterTables: D,
			slideContent: Q,
			slideResObj: a,
			slideMasterTextStyles: u,
			layoutResObj: p,
			masterResObj: L,
			themeContent: R,
			themeResObj: S,
			digramFileContent: V,
			diagramResObj: ee,
			defaultTextStyle: nl,
			slideIndex: t,
			slideNumber: t + 1
		}, s = "";
		m1 === !0 && (s = await Wp(n, U, t));
		var ie = "";
		m1 == "colorsAndImageOnly" && (ie = await _l(n, t) || "");
		var ce = "<div class='slide' style='width:" + U.width + "px; height:" + U.height + "px;" + ie + "'>";
		ce += s;
		for (let C in J) if (J[C].constructor === Array) for (var I = 0; I < J[C].length; I++) ce += await Or(C, J[C][I], J, n, "slide");
		else ce += await Or(C, J[C], J, n, "slide");
		return ce + "</div>";
	}
	function R2(e) {
		let d = e[Object.keys(e)[0]]["p:cSld"]["p:spTree"], t = {}, U = {}, f = {}, r, l, a, i;
		for (let o in d) {
			if (o === "p:nvGrpSpPr" || o === "p:grpSpPr") continue;
			let v = d[o];
			if (v.constructor === Array) for (let y = 0; y < v.length; y++) i = v[y]["p:nvSpPr"], a = x(i, [
				"p:cNvPr",
				"attrs",
				"id"
			]), l = x(i, [
				"p:nvPr",
				"p:ph",
				"attrs",
				"idx"
			]), r = x(i, [
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]), a !== void 0 && (t[a] = v[y]), l !== void 0 && (U[l] = v[y]), r !== void 0 && (f[r] = v[y]);
			else i = v["p:nvSpPr"], a = x(i, [
				"p:cNvPr",
				"attrs",
				"id"
			]), l = x(i, [
				"p:nvPr",
				"p:ph",
				"attrs",
				"idx"
			]), r = x(i, [
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]), a !== void 0 && (t[a] = v), l !== void 0 && (U[l] = v), r !== void 0 && (f[r] = v);
		}
		return {
			idTable: t,
			idxTable: U,
			typeTable: f
		};
	}
	async function Or(e, d, t, U, f, r, l) {
		var a = "";
		switch (e) {
			case "p:sp":
				a = await ml(d, t, U, f, r, l);
				break;
			case "p:cxnSp":
				a = await tp(d, t, U, f, r, l);
				break;
			case "p:pic":
				a = await rp(d, U, f, r, l);
				break;
			case "p:graphicFrame":
				a = await sp(d, U, f, r, l);
				break;
			case "p:grpSp":
				a = await v1(d, U, f, l);
				break;
			case "mc:AlternateContent":
				a = await v1(x(d, ["mc:Fallback"]), U, f, l);
				break;
			default:
		}
		return a;
	}
	function gl(e, d = 0) {
		var t = parseInt(e);
		return Number.isFinite(t) ? t * A : d;
	}
	function lr(e, d = 0) {
		var t = parseFloat(e);
		return Number.isFinite(t) ? t : d;
	}
	function Ws(e, d, t) {
		var U = lr(e, NaN);
		if (!Number.isFinite(U)) return NaN;
		if (t === void 0) return gl(U);
		var f = d === "y" ? t.childOffsetY : t.childOffsetX, r = d === "y" ? t.scaleY : t.scaleX;
		return (U - f) * r;
	}
	function gr(e, d, t) {
		var U = lr(e, NaN);
		return Number.isFinite(U) ? t === void 0 ? S2(U) : U * (d === "y" ? t.scaleY : t.scaleX) : NaN;
	}
	function fl(e, d, t, U) {
		var f = lr(e, NaN);
		return Number.isFinite(f) ? t === void 0 ? gl(f) : f * (d === "y" ? t.scaleY : t.scaleX) : U;
	}
	function pl(e) {
		return e === !0 || e === "1" || e === "true";
	}
	function O2(e, d) {
		var t = x(e, ["a:off", "attrs"]) || {}, U = x(e, ["a:ext", "attrs"]) || {}, f = x(e, ["a:chOff", "attrs"]) || {}, r = x(e, ["a:chExt", "attrs"]) || {}, l = gr(U.cx, "x", d), a = gr(U.cy, "y", d), i = lr(r.cx, NaN), o = lr(r.cy, NaN);
		return (!Number.isFinite(i) || i === 0) && (i = lr(U.cx, l || 1)), (!Number.isFinite(o) || o === 0) && (o = lr(U.cy, a || 1)), {
			x: Ws(t.x, "x", d),
			y: Ws(t.y, "y", d),
			width: l,
			height: a,
			childOffsetX: lr(f.x, 0),
			childOffsetY: lr(f.y, 0),
			childWidth: i,
			childHeight: o,
			scaleX: i ? l / i : 1,
			scaleY: o ? a / o : 1,
			rotate: Ms(x(e, ["attrs", "rot"])),
			flipH: pl(x(e, ["attrs", "flipH"])),
			flipV: pl(x(e, ["attrs", "flipV"]))
		};
	}
	function j2(e) {
		if (e === void 0) return "";
		var d = [];
		return e.rotate && d.push("rotate(" + e.rotate + "deg)"), (e.flipH || e.flipV) && d.push("scale(" + (e.flipH ? -1 : 1) + "," + (e.flipV ? -1 : 1) + ")"), d.length ? "transform:" + d.join(" ") + ";transform-origin:center;" : "";
	}
	function bi(e) {
		return Math.round(e * 1e3) / 1e3;
	}
	function x1(e) {
		return [
			e & 255,
			e >> 8 & 255,
			e >> 16 & 255
		].map(function(d) {
			return ("0" + d.toString(16)).slice(-2);
		}).join("");
	}
	function G2(e) {
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
	function N2(e) {
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
	function fr(e, d, t) {
		var U = e.windowExtX ? e.viewportExtX / e.windowExtX : 1, f = e.windowExtY ? e.viewportExtY / e.windowExtY : 1;
		return {
			x: e.viewportOrgX + (d - e.windowOrgX) * U,
			y: e.viewportOrgY + (t - e.windowOrgY) * f
		};
	}
	function ul(e, d, t) {
		var U = fr(e, d, t);
		e.currentX = d, e.currentY = t;
		var f = "M" + bi(U.x) + " " + bi(U.y);
		return e.inPath && (e.pathD += (e.pathD ? " " : "") + f), f;
	}
	function H2(e, d, t) {
		var U = e.currentX, f = e.currentY, r = fr(e, d, t);
		e.currentX = d, e.currentY = t;
		var l = "L" + bi(r.x) + " " + bi(r.y);
		return e.inPath && (e.pathD || ul(e, U, f), e.pathD += " " + l), l;
	}
	function Z2(e, d, t, U) {
		var f = e.currentX, r = e.currentY, l = fr(e, d.x, d.y), a = fr(e, t.x, t.y), i = fr(e, U.x, U.y);
		e.currentX = U.x, e.currentY = U.y;
		var o = "C" + bi(l.x) + " " + bi(l.y) + " " + bi(a.x) + " " + bi(a.y) + " " + bi(i.x) + " " + bi(i.y);
		if (e.inPath) {
			if (!e.pathD) {
				var v = fr(e, f, r);
				e.pathD = "M" + bi(v.x) + " " + bi(v.y);
			}
			e.pathD += " " + o;
		}
		return o;
	}
	function X2(e, d) {
		var t = d && d.width ? d.width : 1, U = e.windowExtX ? Math.abs(e.viewportExtX / e.windowExtX) : 1, f = e.windowExtY ? Math.abs(e.viewportExtY / e.windowExtY) : 1;
		return Math.max(.5, t * ((U + f) / 2));
	}
	function J2(e, d) {
		var t = e.currentBrush || {
			style: 1,
			color: "none"
		}, U = e.currentPen || {
			style: 0,
			width: 1,
			color: "000000"
		}, f = U.style & 15, r = "none", l = "none", a = [];
		return d != "stroke" && t.style !== 1 && (r = "#" + t.color), d != "fillOnly" && f !== 5 && (l = "#" + U.color), a.push("fill=\"" + r + "\""), a.push("stroke=\"" + l + "\""), l != "none" && a.push("stroke-width=\"" + bi(X2(e, U)) + "\""), a.push("fill-rule=\"" + (e.polyFillMode == 1 ? "evenodd" : "nonzero") + "\""), e.clipId && a.push("clip-path=\"url(#" + e.clipId + ")\""), a.join(" ");
	}
	function Y2(e) {
		return typeof TextEncoder < "u" ? bc(new TextEncoder().encode(e).buffer) : btoa(unescape(encodeURIComponent(e)));
	}
	function $2(e) {
		try {
			let I = function(ve) {
				return {
					x: d.getInt16(ve, !0),
					y: d.getInt16(ve + 2, !0)
				};
			}, C = function(ve, _e) {
				ve && o.push("<path d=\"" + ve + "\" " + J2(l, _e) + "/>");
			}, Y = function(ve, _e, Ye) {
				for (var Je = d.getUint32(ve + 24, !0), Ve = d.getUint32(ve + 28, !0), at = ve + 32, W = at + Je * 4, Dt = "", Lt = 0; Lt < Je; Lt++) {
					var kt = d.getUint32(at + Lt * 4, !0);
					if (kt !== 0) {
						for (var T = 0; T < kt && W + 4 <= ve + p; T++) {
							var ke = I(W);
							W += 4;
							var be = fr(l, ke.x, ke.y);
							Dt += (Dt ? " " : "") + (T === 0 ? "M" : "L") + bi(be.x) + " " + bi(be.y), l.currentX = ke.x, l.currentY = ke.y;
						}
						_e && (Dt += " Z");
					}
				}
				Ve > 0 && C(Dt, Ye ? "stroke" : "fillStroke");
			};
			var d = new DataView(e);
			if (d.byteLength < 16 || d.getUint32(0, !0) !== 1) return;
			for (var t = d.getInt32(8, !0), U = d.getInt32(12, !0), f = d.getInt32(16, !0), r = d.getInt32(20, !0), l = {
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
			}, a = {}, i = [], o = [], v = [], y = 0, _ = 0; _ + 8 <= d.byteLength;) {
				var g = d.getUint32(_, !0), p = d.getUint32(_ + 4, !0);
				if (p < 8 || _ + p > d.byteLength) break;
				switch (g) {
					case 1: break;
					case 9:
						l.windowExtX = d.getInt32(_ + 8, !0) || 1, l.windowExtY = d.getInt32(_ + 12, !0) || 1;
						break;
					case 10:
						l.windowOrgX = d.getInt32(_ + 8, !0), l.windowOrgY = d.getInt32(_ + 12, !0);
						break;
					case 11:
						l.viewportExtX = d.getInt32(_ + 8, !0) || 1, l.viewportExtY = d.getInt32(_ + 12, !0) || 1;
						break;
					case 12:
						l.viewportOrgX = d.getInt32(_ + 8, !0), l.viewportOrgY = d.getInt32(_ + 12, !0);
						break;
					case 19:
						l.polyFillMode = d.getUint32(_ + 8, !0);
						break;
					case 33:
						i.push(N2(l));
						break;
					case 34:
						if (i.length) {
							var m = i.pop();
							Object.assign(l, m);
						}
						break;
					case 37:
						var u = d.getUint32(_ + 8, !0), D = a[u] || G2(u);
						D !== void 0 && (D.kind == "brush" ? l.currentBrush = D : D.kind == "pen" && (l.currentPen = D));
						break;
					case 38:
						var h = d.getUint32(_ + 8, !0);
						a[h] = {
							kind: "pen",
							style: d.getUint32(_ + 12, !0),
							width: d.getInt32(_ + 16, !0),
							color: x1(d.getUint32(_ + 20, !0))
						};
						break;
					case 39:
						var c = d.getUint32(_ + 8, !0);
						a[c] = {
							kind: "brush",
							style: d.getUint32(_ + 12, !0),
							color: x1(d.getUint32(_ + 16, !0))
						};
						break;
					case 40:
						delete a[d.getUint32(_ + 8, !0)];
						break;
					case 59:
						l.inPath = !0, l.pathD = "";
						break;
					case 60:
						l.inPath = !1, l.lastPathD = l.pathD;
						break;
					case 61:
						l.inPath && (l.pathD += " Z");
						break;
					case 62:
						C(l.lastPathD || l.pathD, "fillOnly");
						break;
					case 63:
						C(l.lastPathD || l.pathD, "fillStroke");
						break;
					case 64:
						C(l.lastPathD || l.pathD, "stroke");
						break;
					case 67:
						if (l.lastPathD || l.pathD) {
							var b = "emfClip" + ++y;
							v.push("<clipPath id=\"" + b + "\"><path d=\"" + (l.lastPathD || l.pathD) + "\"/></clipPath>"), l.clipId = b;
						}
						break;
					case 27:
						ul(l, d.getInt32(_ + 8, !0), d.getInt32(_ + 12, !0));
						break;
					case 6:
						var L = d.getUint32(_ + 24, !0), S = "";
						if (!l.inPath) {
							var R = fr(l, l.currentX, l.currentY);
							S = "M" + bi(R.x) + " " + bi(R.y);
						}
						for (var P = 0; P < L; P++) {
							var M = _ + 28 + P * 8, ee = H2(l, d.getInt32(M, !0), d.getInt32(M + 4, !0));
							l.inPath || (S += " " + ee);
						}
						l.inPath || C(S, "stroke");
						break;
					case 88:
						var V = d.getUint32(_ + 24, !0), F = "";
						if (!l.inPath) {
							var K = fr(l, l.currentX, l.currentY);
							F = "M" + bi(K.x) + " " + bi(K.y);
						}
						for (var k = [], Q = 0; Q < V; Q++) k.push(I(_ + 28 + Q * 4));
						for (var J = 0; J + 2 < k.length; J += 3) {
							var n = Z2(l, k[J], k[J + 1], k[J + 2]);
							l.inPath || (F += " " + n);
						}
						l.inPath || C(F, "stroke");
						break;
					case 90:
						Y(_, !1, !0);
						break;
					case 91:
						Y(_, !0, !1);
						break;
					case 95:
						var s = d.getUint32(_ + 8, !0);
						a[s] = {
							kind: "pen",
							style: d.getUint32(_ + 28, !0),
							width: d.getInt32(_ + 32, !0),
							color: x1(d.getUint32(_ + 40, !0))
						};
						break;
					case 14:
						_ = d.byteLength;
						continue;
					default: break;
				}
				_ += p;
			}
			if (!o.length) return;
			var ie = Math.max(1, f - t), ce = Math.max(1, r - U);
			return "data:image/svg+xml;base64," + Y2("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"" + t + " " + U + " " + ie + " " + ce + "\" width=\"" + ie + "\" height=\"" + ce + "\" preserveAspectRatio=\"none\">" + (v.length ? "<defs>" + v.join("") + "</defs>" : "") + o.join("") + "</svg>");
		} catch (I) {
			console.warn("Unable to convert EMF image", I);
			return;
		}
	}
	function q2(e) {
		return e instanceof Uint8ClampedArray ? e : e instanceof Uint8Array ? new Uint8ClampedArray(e.buffer, e.byteOffset, e.byteLength) : new Uint8ClampedArray(e);
	}
	async function V2(e) {
		if (typeof e.convertToBlob == "function") return "data:image/png;base64," + bc(await (await e.convertToBlob({ type: "image/png" })).arrayBuffer());
		if (typeof e.toDataURL == "function") return e.toDataURL("image/png");
	}
	async function K2(e) {
		try {
			var d = p1.decode(e);
			if (!d || !d.length) return;
			p1.decodeImage(e, d[0]);
			var t = d[0].width, U = d[0].height;
			if (!t || !U) return;
			var f = q2(p1.toRGBA8(d[0])), r = new ImageData(f, t, U), l;
			if (typeof OffscreenCanvas < "u") l = new OffscreenCanvas(t, U);
			else if (typeof document < "u" && document.createElement) l = document.createElement("canvas"), l.width = t, l.height = U;
			else return;
			var a = l.getContext("2d");
			return a ? (a.putImageData(r, 0, 0), await V2(l)) : void 0;
		} catch (i) {
			console.warn("Unable to convert TIFF image", i);
			return;
		}
	}
	async function bl(e, d) {
		var t = (e || "").toLowerCase();
		if (t == "tif" || t == "tiff") return await K2(d);
		if (t == "emf") {
			var U = $2(d);
			if (U !== void 0) return U;
		}
		var f = uc(t);
		if (f) return "data:" + f + ";base64," + bc(d);
	}
	function Q2(e) {
		var d = x(e, ["a:srcRect", "attrs"]);
		if (d === void 0) return {
			container: "overflow:hidden;",
			image: "display:block;width:100%;height:100%;object-fit:fill;max-width:none;max-height:none;"
		};
		var t = parseInt(d.l || 0) / 1e3, U = parseInt(d.t || 0) / 1e3, f = parseInt(d.r || 0) / 1e3, r = parseInt(d.b || 0) / 1e3, l = 100 - t - f, a = 100 - U - r;
		return l <= 0 || a <= 0 ? {
			container: "overflow:hidden;",
			image: "display:block;width:100%;height:100%;object-fit:fill;max-width:none;max-height:none;"
		} : {
			container: "overflow:hidden;",
			image: "position:absolute;max-width:none;max-height:none;width:" + 1e4 / l + "%;height:" + 1e4 / a + "%;left:" + -t / l * 100 + "%;top:" + -U / a * 100 + "%;"
		};
	}
	function ep(e) {
		return x(e, ["a:blip", "a:duotone"]) !== void 0 ? "filter:grayscale(1);" : "";
	}
	async function v1(e, d, t, U) {
		var f = x(e, ["p:grpSpPr", "a:xfrm"]), r = f !== void 0 ? O2(f, U) : void 0, l = x(e, ["attrs", "order"]), a = l !== void 0 ? "z-index: " + l + ";" : "";
		f !== void 0 && (a += pr(f, e, void 0, void 0, "group", U), a += ur(f, void 0, void 0, U), a += j2(r));
		var i = "<div class='block group' style='" + a + "'>";
		r !== void 0 && (i += "<div class='group-content' style='position:absolute;top:0;left:0;width:100%;height:100%;'>");
		for (var o in e) if (e[o].constructor === Array) for (var v = 0; v < e[o].length; v++) i += await Or(o, e[o][v], e, d, t, "group", r);
		else i += await Or(o, e[o], e, d, t, "group", r);
		return r !== void 0 && (i += "</div>"), i += "</div>", i;
	}
	async function ml(e, d, t, U, f, r) {
		var l = x(e, [
			"p:nvSpPr",
			"p:cNvPr",
			"attrs",
			"id"
		]), a = x(e, [
			"p:nvSpPr",
			"p:cNvPr",
			"attrs",
			"name"
		]), i = x(e, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"idx"
		]) === void 0 ? void 0 : x(e, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"idx"
		]), o = x(e, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"type"
		]) === void 0 ? void 0 : x(e, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"type"
		]), v = x(e, ["attrs", "order"]), y;
		(U == "slideLayoutBg" || U == "slideMasterBg") && (x(e, [
			"p:nvSpPr",
			"p:nvPr",
			"attrs",
			"userDrawn"
		]) == "1" ? y = !0 : y = !1);
		var _ = void 0, g = void 0;
		return i !== void 0 ? (_ = t.slideLayoutTables.idxTable[i], o !== void 0 ? g = t.slideMasterTables.typeTable[o] : g = t.slideMasterTables.idxTable[i]) : o !== void 0 && (_ = t.slideLayoutTables.typeTable[o], g = t.slideMasterTables.typeTable[o]), o === void 0 && x(e, [
			"p:nvSpPr",
			"p:cNvSpPr",
			"attrs",
			"txBox"
		]) == "1" && (o = "textBox"), o === void 0 && (o = x(_, [
			"p:nvSpPr",
			"p:nvPr",
			"p:ph",
			"attrs",
			"type"
		]), o === void 0 && (U == "diagramBg" ? o = "diagram" : o = "obj")), xl(e, d, _, g, l, a, i, o, v, t, y, f, U, r);
	}
	async function tp(e, d, t, U, f, r) {
		var l = e["p:nvCxnSpPr"]["p:cNvPr"].attrs.id, a = e["p:nvCxnSpPr"]["p:cNvPr"].attrs.name, i = e["p:nvCxnSpPr"]["p:nvPr"]["p:ph"] === void 0 ? void 0 : e["p:nvSpPr"]["p:nvPr"]["p:ph"].attrs.idx, o = e["p:nvCxnSpPr"]["p:nvPr"]["p:ph"] === void 0 ? void 0 : e["p:nvSpPr"]["p:nvPr"]["p:ph"].attrs.type, v = e.attrs.order;
		return xl(e, d, void 0, void 0, l, a, i, o, v, t, void 0, f, U, r);
	}
	async function xl(e, d, t, U, f, r, l, a, i, o, v, y, _, g) {
		var p = ["p:spPr", "a:xfrm"], m = x(e, p), u = x(t, p), D = x(U, p), h = "", c = x(e, ["attrs", "order"]), b = x(e, [
			"p:spPr",
			"a:prstGeom",
			"attrs",
			"prst"
		]), L = x(e, ["p:spPr", "a:custGeom"]), S = !1, R = !1, P = "";
		x(m, ["attrs", "flipV"]) === "1" && (S = !0), x(m, ["attrs", "flipH"]) === "1" && (R = !0), R && !S ? P = " scale(-1,1)" : !R && S ? P = " scale(1,-1)" : R && S && (P = " scale(-1,-1)");
		var M = Ms(x(m, ["attrs", "rot"])), ee, V = x(e, ["p:txXfrm"]);
		if (V !== void 0) {
			var F = x(V, ["attrs", "rot"]);
			F !== void 0 && (ee = Ms(F) + 90);
		} else ee = M;
		if (b !== void 0 || L !== void 0) {
			var K = x(m, ["a:off", "attrs"]) || {
				x: 0,
				y: 0
			}, k = Ws(K.x, "x", g), Q = Ws(K.y, "y", g), J = x(m, ["a:ext", "attrs"]) || {
				cx: 0,
				cy: 0
			}, n = gr(J.cx, "x", g), s = gr(J.cy, "y", g);
			Number.isFinite(k) || (k = 0), Number.isFinite(Q) || (Q = 0), Number.isFinite(n) || (n = 0), Number.isFinite(s) || (s = 0);
			var ie = "_svg_css_" + (Object.keys(Va).length + 1) + "_" + Math.floor(Math.random() * 1001), ce = ie + "_effects";
			h += "<svg class='drawing " + ie + " " + ce + " ' _id='" + f + "' _idx='" + l + "' _type='" + a + "' _name='" + r + "'' style='" + pr(m, d, void 0, void 0, y, g) + ur(m, void 0, void 0, g) + " z-index: " + i + ";transform: rotate(" + (M !== void 0 ? M : 0) + "deg)" + P + ";'>", h += "<defs>";
			var I = await fc(e, d, !0, o, _), C = !1, Y = !1, ve = nn(x(e, ["p:spPr"]));
			if (ve == "GROUP_FILL" && (ve = nn(x(d, ["p:grpSpPr"]))), ve == "GRADIENT_FILL") {
				C = !0;
				var _e = I.color, Ye = I.rot + 90, Je = Zp(n, s, Ye, _e, c);
				h += Je;
			} else if (ve == "PIC_FILL") {
				Y = !0;
				var Ve = await Yp(e, I, c, o);
				h += Ve;
			} else if (ve == "PATTERN_FILL") {
				var at = I;
				at in Va && (at += "do-nothing: " + ie + ";"), Va[at] = {
					name: ie,
					text: at
				}, I = "none";
			} else ve != "SOLID_FILL" && ve != "PATTERN_FILL" && (b == "arc" || b == "bracketPair" || b == "bracePair" || b == "leftBracket" || b == "leftBrace" || b == "rightBrace" || b == "rightBracket") && (I = "none");
			var W = Un(e, d, !0, "shape", o), Dt = x(e, [
				"p:spPr",
				"a:ln",
				"a:headEnd",
				"attrs"
			]), Lt = x(e, [
				"p:spPr",
				"a:ln",
				"a:tailEnd",
				"attrs"
			]), kt = x(e, [
				"p:spPr",
				"a:effectLst",
				"a:outerShdw"
			]), T = "";
			if (kt !== void 0) {
				var ke = Rt(kt, void 0, void 0, o), be = kt.attrs, G = be.dir ? parseInt(be.dir) / 6e4 : 0, z = parseInt(be.dist) * A, se = be.blurRad ? parseInt(be.blurRad) * A : "", We = z * Math.sin(G * Math.PI / 180), Ce = "filter:drop-shadow(" + z * Math.cos(G * Math.PI / 180) + "px " + We + "px " + se + "px #" + ke + ");";
				Ce in Va && (Ce += "do-nothing: " + ie + ";"), Va[Ce] = {
					name: ce,
					text: Ce
				};
			}
			if (Dt !== void 0 && (Dt.type === "triangle" || Dt.type === "arrow") || Lt !== void 0 && (Lt.type === "triangle" || Lt.type === "arrow")) {
				var pe = "<marker id='markerTriangle_" + c + "' viewBox='0 0 10 10' refX='1' refY='5' markerWidth='5' markerHeight='5' stroke='" + W.color + "' fill='" + W.color + "' orient='auto-start-reverse' markerUnits='strokeWidth'><path d='M 0 0 L 10 5 L 0 10 z' /></marker>";
				h += pe;
			}
			h += "</defs>";
		}
		if (b !== void 0 && L === void 0) {
			switch (b) {
				case "rect":
				case "flowChartProcess":
				case "flowChartPredefinedProcess":
				case "flowChartInternalStorage":
				case "actionButtonBlank":
					h += "<rect x='0' y='0' width='" + n + "' height='" + s + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' " + T + "  />", b == "flowChartPredefinedProcess" ? h += "<rect x='" + n * (1 / 8) + "' y='0' width='" + n * (6 / 8) + "' height='" + s + "' fill='none' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />" : b == "flowChartInternalStorage" && (h += " <polyline points='" + n * (1 / 8) + " 0," + n * (1 / 8) + " " + s + "' fill='none' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />", h += " <polyline points='0 " + s * (1 / 8) + "," + n + " " + s * (1 / 8) + "' fill='none' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />");
					break;
				case "flowChartCollate":
					var Xe = "M 0,0 L" + n + ",0 L0," + s + " L" + n + "," + s + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "flowChartDocument":
					var q, ae, le, j = n * 10800 / 21600;
					q = s * 17322 / 21600, ae = s * 20172 / 21600, le = s * 23922 / 21600;
					var Xe = "M0,0 L" + n + ",0 L" + n + "," + q + " C" + j + "," + q + " " + j + "," + le + " 0," + ae + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "flowChartMultidocument":
					var q = s * 18022 / 21600, ae = s * 3675 / 21600, le = s * 23542 / 21600, Ue = s * 1815 / 21600, ct = s * 16252 / 21600, At = s * 16352 / 21600, ta = s * 14392 / 21600, Ha = s * 20782 / 21600, Vi = s * 14467 / 21600, j = n * 1532 / 21600, ne = n * 2e4 / 21600, me = n * 9298 / 21600, Te = n * 19298 / 21600, st = n * 18595 / 21600, vt = n * 2972 / 21600, jt = n * 20800 / 21600, Xe = "M0," + ae + " L" + st + "," + ae + " L" + st + "," + q + " C" + me + "," + q + " " + me + "," + le + " 0," + Ha + " zM" + j + "," + ae + " L" + j + "," + Ue + " L" + ne + "," + Ue + " L" + ne + "," + ct + " C" + Te + "," + ct + " " + st + "," + At + " " + st + "," + At + "M" + vt + "," + Ue + " L" + vt + ",0 L" + n + ",0 L" + n + "," + ta + " C" + jt + "," + ta + " " + ne + "," + Vi + " " + ne + "," + Vi;
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonBackPrevious":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, la = X + we, _t = N - we, na = N + we, Xe = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " zM" + _t + "," + X + " L" + na + "," + Ft + " L" + na + "," + la + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonBeginning":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, la = X + we, _t = N - we, na = N + we, ot = Be * 3 / 4, Da = ot / 8, Wa = ot / 4, Pa = _t + Da, Ta = _t + Wa, Xe = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " zM" + Ta + "," + X + " L" + na + "," + Ft + " L" + na + "," + la + " zM" + Pa + "," + Ft + " L" + _t + "," + Ft + " L" + _t + "," + la + " L" + Pa + "," + la + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonDocument":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, la = X + we, et = Be * 9 / 32, _t = N - et, na = N + et, ot = Be * 3 / 16, Da = na - ot, Wa = Ft + ot, Xe = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " zM" + _t + "," + Ft + " L" + Da + "," + Ft + " L" + na + "," + Wa + " L" + na + "," + la + " L" + _t + "," + la + " zM" + Da + "," + Ft + " L" + Da + "," + Wa + " L" + na + "," + Wa + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonEnd":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, la = X + we, _t = N - we, na = N + we, ot = Be * 3 / 4, Da = ot * 3 / 4, Wa = ot * 7 / 8, Pa = _t + Da, Ta = _t + Wa, Xe = "M0," + s + " L" + n + "," + s + " L" + n + ",0 L0,0 z M" + Ta + "," + Ft + " L" + na + "," + Ft + " L" + na + "," + la + " L" + Ta + "," + la + " z M" + Pa + "," + X + " L" + _t + "," + Ft + " L" + _t + "," + la + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonForwardNext":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, la = X + we, _t = N - we, na = N + we, Xe = "M0," + s + " L" + n + "," + s + " L" + n + ",0 L0,0 z M" + na + "," + X + " L" + _t + "," + Ft + " L" + _t + "," + la + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonHelp":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, _t = N - we, ot = Be * 3 / 4, Da = ot / 7, Wa = ot * 3 / 14, Pa = ot * 2 / 7, fe = ot * 3 / 7, ge = ot * 4 / 7, gt = ot * 17 / 28, qe = ot * 21 / 28, va = ot * 11 / 14, Se = Ft + Pa, tt = Ft + gt, $e = Ft + qe, bt = Ft + va, Bt = _t + Wa, ja = _t + fe, H = _t + ge, Fe = ot / 14, E = ot * 3 / 28, Sn = Bt + Pa, Zr = ja + Da, Gc = bt + E, vo = (H + ja + Pa) / 2, Xe = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " zM" + Bt + "," + Se + ye(Sn, Se, Pa, Pa, 180, 360, !1).replace("M", "L") + ye(vo, Se, Da, Wa, 0, 90, !1).replace("M", "L") + ye(vo, tt, Fe, E, 270, 180, !1).replace("M", "L") + " L" + H + "," + $e + " L" + ja + "," + $e + " L" + ja + "," + tt + ye(Zr, tt, Da, Wa, 180, 270, !1).replace("M", "L") + ye(H, Se, Fe, E, 90, 0, !1).replace("M", "L") + ye(Sn, Se, Da, Da, 0, -180, !1).replace("M", "L") + " zM" + N + "," + bt + ye(N, Gc, E, E, 270, 630, !1).replace("M", "L") + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonHome":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, la = X + we, _t = N - we, na = N + we, ot = Be * 3 / 4, Da = ot / 16, Wa = ot / 8, Pa = ot * 3 / 16, Ta = ot * 5 / 16, Ii = ot * 7 / 16, fe = ot * 9 / 16, ge = ot * 11 / 16, gt = ot * 3 / 4, zt = ot * 13 / 16, qe = ot * 7 / 8, va = Ft + Da, Ga = Ft + Pa, ea = Ft + Ta, Se = Ft + gt, He = _t + Wa, tt = _t + Ii, $e = _t + fe, bt = _t + ge, Pt = _t + zt, Bt = _t + qe, Xe = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " z M" + N + "," + Ft + " L" + _t + "," + X + " L" + He + "," + X + " L" + He + "," + la + " L" + Bt + "," + la + " L" + Bt + "," + X + " L" + na + "," + X + " L" + Pt + "," + ea + " L" + Pt + "," + va + " L" + bt + "," + va + " L" + bt + "," + Ga + " z M" + tt + "," + Se + " L" + $e + "," + Se + " L" + $e + "," + la + " L" + tt + "," + la + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonInformation":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, _t = N - we, ot = Be * 3 / 4, Da = ot / 32, Ta = ot * 5 / 16, Ii = ot * 3 / 8, fe = ot * 13 / 32, ge = ot * 19 / 32, zt = ot * 11 / 16, qe = ot * 13 / 16, va = ot * 7 / 8, Ga = Ft + Da, He = Ft + Ta, tt = Ft + Ii, $e = Ft + qe, bt = Ft + va, Pt = _t + Ta, Ja = _t + fe, oi = _t + ge, H = _t + zt, ze = ot * 3 / 32, kr = Ft + we, Hr = Ga + ze, Xe = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " zM" + N + "," + Ft + ye(N, kr, we, we, 270, 630, !1).replace("M", "L") + " zM" + N + "," + Ga + ye(N, Hr, ze, ze, 270, 630, !1).replace("M", "L") + "M" + Pt + "," + He + " L" + oi + "," + He + " L" + oi + "," + $e + " L" + H + "," + $e + " L" + H + "," + bt + " L" + Pt + "," + bt + " L" + Pt + "," + $e + " L" + Ja + "," + $e + " L" + Ja + "," + tt + " L" + Pt + "," + tt + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonMovie":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, la = X + we, _t = N - we, na = N + we, ot = Be * 3 / 4, Da = ot * 1455 / 21600, Wa = ot * 1905 / 21600, Pa = ot * 2325 / 21600, Ta = ot * 16155 / 21600, Ii = ot * 17010 / 21600, fe = ot * 19335 / 21600, ge = ot * 19725 / 21600, gt = ot * 20595 / 21600, zt = ot * 5280 / 21600, qe = ot * 5730 / 21600, va = ot * 6630 / 21600, Ga = ot * 7492 / 21600, ea = ot * 9067 / 21600, Se = ot * 9555 / 21600, He = ot * 13342 / 21600, tt = ot * 14580 / 21600, $e = ot * 15592 / 21600, bt = _t + Da, Pt = _t + Wa, Bt = _t + Pa, Ja = _t + Ta, oi = _t + Ii, ja = _t + fe, H = _t + ge, ze = _t + gt, Qe = Ft + zt, oe = Ft + qe, Fe = Ft + va, E = Ft + Ga, Oe = Ft + ea, w = Ft + Se, re = Ft + He, Ne = Ft + tt, B = Ft + $e;
					Ft + bt;
					var Xe = "M0," + s + " L" + n + "," + s + " L" + n + ",0 L0,0 zM" + _t + "," + Qe + " L" + _t + "," + w + " L" + bt + "," + w + " L" + Pt + "," + Oe + " L" + Bt + "," + Oe + " L" + Bt + "," + B + " L" + oi + "," + B + " L" + oi + "," + re + " L" + ja + "," + re + " L" + ze + "," + Ne + " L" + na + "," + Ne + " L" + na + "," + Fe + " L" + ze + "," + Fe + " L" + H + "," + E + " L" + oi + "," + E + " L" + oi + "," + Fe + " L" + Ja + "," + oe + " L" + Pt + "," + oe + " L" + bt + "," + Qe + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonReturn":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, la = X + we, _t = N - we, na = N + we, ot = Be * 3 / 4, Da = ot * 7 / 8, Wa = ot * 3 / 4, Pa = ot * 5 / 8, Ta = ot * 3 / 8, Ii = ot / 4, fe = Ft + Wa, ge = Ft + Pa, gt = Ft + Ii, zt = _t + Da, qe = _t + Wa, va = _t + Pa, Ga = _t + Ta, ea = _t + Ii, Se = ot / 8, Sn = va - Se, Hr = fe - Se, jc = _t + Ta, Nc = la - Ta, Xe = "M0," + s + " L" + n + "," + s + " L" + n + ",0 L0,0 z M" + na + "," + gt + " L" + qe + "," + Ft + " L" + N + "," + gt + " L" + va + "," + gt + " L" + va + "," + ge + ye(Sn, ge, Se, Se, 0, 90, !1).replace("M", "L") + " L" + Ga + "," + fe + ye(Ga, Hr, Se, Se, 90, 180, !1).replace("M", "L") + " L" + ea + "," + gt + " L" + _t + "," + gt + " L" + _t + "," + ge + ye(jc, ge, Ta, Ta, 180, 90, !1).replace("M", "L") + " L" + N + "," + la + ye(N, Nc, Ta, Ta, 90, 0, !1).replace("M", "L") + " L" + zt + "," + gt + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "actionButtonSound":
					var N = n / 2, X = s / 2, Be = Math.min(n, s), we = Be * 3 / 8, Ft = X - we, la = X + we, _t = N - we, na = N + we, ot = Be * 3 / 4, Da = ot / 8, Wa = ot * 5 / 16, Pa = ot * 5 / 8, Ta = ot * 11 / 16, Ii = ot * 3 / 4, fe = ot * 7 / 8, ge = Ft + Da, gt = Ft + Wa, zt = Ft + Ta, qe = Ft + fe, va = _t + Wa, Ga = _t + Pa, ea = _t + Ii, Xe = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " z M" + _t + "," + gt + " L" + va + "," + gt + " L" + Ga + "," + Ft + " L" + Ga + "," + la + " L" + va + "," + zt + " L" + _t + "," + zt + " z M" + ea + "," + gt + " L" + na + "," + ge + " M" + ea + "," + X + " L" + na + "," + X + " M" + ea + "," + zt + " L" + na + "," + qe;
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "irregularSeal1":
				case "irregularSeal2":
					if (b == "irregularSeal1") var Xe = "M" + n * 10800 / 21600 + "," + s * 5800 / 21600 + " L" + n * 14522 / 21600 + ",0 L" + n * 14155 / 21600 + "," + s * 5325 / 21600 + " L" + n * 18380 / 21600 + "," + s * 4457 / 21600 + " L" + n * 16702 / 21600 + "," + s * 7315 / 21600 + " L" + n * 21097 / 21600 + "," + s * 8137 / 21600 + " L" + n * 17607 / 21600 + "," + s * 10475 / 21600 + " L" + n + "," + s * 13290 / 21600 + " L" + n * 16837 / 21600 + "," + s * 12942 / 21600 + " L" + n * 18145 / 21600 + "," + s * 18095 / 21600 + " L" + n * 14020 / 21600 + "," + s * 14457 / 21600 + " L" + n * 13247 / 21600 + "," + s * 19737 / 21600 + " L" + n * 10532 / 21600 + "," + s * 14935 / 21600 + " L" + n * 8485 / 21600 + "," + s + " L" + n * 7715 / 21600 + "," + s * 15627 / 21600 + " L" + n * 4762 / 21600 + "," + s * 17617 / 21600 + " L" + n * 5667 / 21600 + "," + s * 13937 / 21600 + " L" + n * 135 / 21600 + "," + s * 14587 / 21600 + " L" + n * 3722 / 21600 + "," + s * 11775 / 21600 + " L0," + s * 8615 / 21600 + " L" + n * 4627 / 21600 + "," + s * 7617 / 21600 + " L" + n * 370 / 21600 + "," + s * 2295 / 21600 + " L" + n * 7312 / 21600 + "," + s * 6320 / 21600 + " L" + n * 8352 / 21600 + "," + s * 2295 / 21600 + " z";
					else if (b == "irregularSeal2") var Xe = "M" + n * 11462 / 21600 + "," + s * 4342 / 21600 + " L" + n * 14790 / 21600 + ",0 L" + n * 14525 / 21600 + "," + s * 5777 / 21600 + " L" + n * 18007 / 21600 + "," + s * 3172 / 21600 + " L" + n * 16380 / 21600 + "," + s * 6532 / 21600 + " L" + n + "," + s * 6645 / 21600 + " L" + n * 16985 / 21600 + "," + s * 9402 / 21600 + " L" + n * 18270 / 21600 + "," + s * 11290 / 21600 + " L" + n * 16380 / 21600 + "," + s * 12310 / 21600 + " L" + n * 18877 / 21600 + "," + s * 15632 / 21600 + " L" + n * 14640 / 21600 + "," + s * 14350 / 21600 + " L" + n * 14942 / 21600 + "," + s * 17370 / 21600 + " L" + n * 12180 / 21600 + "," + s * 15935 / 21600 + " L" + n * 11612 / 21600 + "," + s * 18842 / 21600 + " L" + n * 9872 / 21600 + "," + s * 17370 / 21600 + " L" + n * 8700 / 21600 + "," + s * 19712 / 21600 + " L" + n * 7527 / 21600 + "," + s * 18125 / 21600 + " L" + n * 4917 / 21600 + "," + s + " L" + n * 4805 / 21600 + "," + s * 18240 / 21600 + " L" + n * 1285 / 21600 + "," + s * 17825 / 21600 + " L" + n * 3330 / 21600 + "," + s * 15370 / 21600 + " L0," + s * 12877 / 21600 + " L" + n * 3935 / 21600 + "," + s * 11592 / 21600 + " L" + n * 1172 / 21600 + "," + s * 8270 / 21600 + " L" + n * 5372 / 21600 + "," + s * 7817 / 21600 + " L" + n * 4502 / 21600 + "," + s * 3625 / 21600 + " L" + n * 8550 / 21600 + "," + s * 6382 / 21600 + " L" + n * 9722 / 21600 + "," + s * 1887 / 21600 + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "flowChartTerminator":
					var j, ne, q, It = 180, Zt = 90, Ht = 270;
					j = n * 3475 / 21600, ne = n * 18125 / 21600, q = s * 10800 / 21600;
					var Xe = "M" + j + ",0 L" + ne + ",0" + ye(ne, s / 2, j, q, Ht, Ht + It, !1).replace("M", "L") + " L" + j + "," + s + ye(j, s / 2, j, q, Zt, Zt + It, !1).replace("M", "L") + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "flowChartPunchedTape":
					var j, j, q, ae, It = 180;
					j = n * 5 / 20, q = s * 2 / 20, ae = s * 18 / 20;
					var Xe = "M0," + q + ye(j, q, j, q, It, 0, !1).replace("M", "L") + ye(n * (3 / 4), q, j, q, It, 360, !1).replace("M", "L") + " L" + n + "," + ae + ye(n * (3 / 4), ae, j, q, 0, -It, !1).replace("M", "L") + ye(j, ae, j, q, 0, It, !1).replace("M", "L") + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "flowChartOnlineStorage":
					var j, q, Ht = 270, Zt = 90;
					j = n * 1 / 6, q = s * 3 / 6;
					var Xe = "M" + j + ",0 L" + n + ",0" + ye(n, s / 2, j, q, Ht, 90, !1).replace("M", "L") + " L" + j + "," + s + ye(j, s / 2, j, q, Zt, 270, !1).replace("M", "L") + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "flowChartDisplay":
					var j, ne, q, Ht = 270, It = 180;
					j = n * 1 / 6, ne = n * 5 / 6, q = s * 3 / 6;
					var Xe = "M0," + q + " L" + j + ",0 L" + ne + ",0" + ye(n, s / 2, j, q, Ht, Ht + It, !1).replace("M", "L") + " L" + j + "," + s + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "flowChartDelay":
					var nt = n / 2, Ke = s / 2, It = 180, Ht = 270, Zt = 90, Xe = "M0,0 L" + nt + ",0" + ye(nt, Ke, nt, Ke, Ht, Ht + It, !1).replace("M", "L") + " L0," + s + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "flowChartMagneticTape":
					var nt = n / 2, Ke = s / 2, It = 180, Ht = 270, Zt = 90, za = Ke * Math.sin(Math.PI / 4), Cn = Ke + za, oa = Math.atan(s / n) * 180 / Math.PI, Xe = "M" + nt + "," + s + ye(nt, Ke, nt, Ke, Zt, It, !1).replace("M", "L") + ye(nt, Ke, nt, Ke, It, Ht, !1).replace("M", "L") + ye(nt, Ke, nt, Ke, Ht, 360, !1).replace("M", "L") + ye(nt, Ke, nt, Ke, 0, oa, !1).replace("M", "L") + " L" + n + "," + Cn + " L" + n + "," + s + " z";
					h += "<path d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "ellipse":
				case "flowChartConnector":
				case "flowChartSummingJunction":
				case "flowChartOr":
					if (h += "<ellipse cx='" + n / 2 + "' cy='" + s / 2 + "' rx='" + n / 2 + "' ry='" + s / 2 + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />", b == "flowChartOr") h += " <polyline points='" + n / 2 + " 0," + n / 2 + " " + s + "' fill='none' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />", h += " <polyline points='0 " + s / 2 + "," + n + " " + s / 2 + "' fill='none' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					else if (b == "flowChartSummingJunction") {
						var $a, za, xr, yr, vr, Cn, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Ka = Math.PI / 4;
						$a = nt * Math.cos(Ka), za = Ke * Math.sin(Ka), xr = N - $a, yr = N + $a, vr = X - za, Cn = X + za, h += " <polyline points='" + xr + " " + vr + "," + yr + " " + Cn + "' fill='none' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />", h += " <polyline points='" + yr + " " + vr + "," + xr + " " + Cn + "' fill='none' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
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
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft, Ie, pt, Qa, Ya;
					if (O !== void 0 && O.constructor === Array) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), ft = parseInt(Me.substr(4)) / 5e4) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), pt = parseInt(Ie.substr(4)) / 5e4);
					}
					else if (O !== void 0 && O.constructor !== Array) {
						var ei = x(O, ["attrs", "fmla"]);
						ft = parseInt(ei.substr(4)) / 5e4, pt = 0;
					}
					var In = "";
					switch (b) {
						case "roundRect":
						case "flowChartAlternateProcess":
							Qa = "round", Ya = "cornrAll", ft === void 0 && (ft = .33334), pt = 0;
							break;
						case "round1Rect":
							Qa = "round", Ya = "cornr1", ft === void 0 && (ft = .33334), pt = 0;
							break;
						case "round2DiagRect":
							Qa = "round", Ya = "diag", ft === void 0 && (ft = .33334), pt === void 0 && (pt = 0);
							break;
						case "round2SameRect":
							Qa = "round", Ya = "cornr2", ft === void 0 && (ft = .33334), pt === void 0 && (pt = 0);
							break;
						case "snip1Rect":
						case "flowChartPunchedCard":
							Qa = "snip", Ya = "cornr1", ft === void 0 && (ft = .33334), pt = 0, b == "flowChartPunchedCard" && (In = "transform='translate(" + n + ",0) scale(-1,1)'");
							break;
						case "snip2DiagRect":
							Qa = "snip", Ya = "diag", ft === void 0 && (ft = 0), pt === void 0 && (pt = .33334);
							break;
						case "snip2SameRect":
							Qa = "snip", Ya = "cornr2", ft === void 0 && (ft = .33334), pt === void 0 && (pt = 0);
							break;
					}
					var Ge = np(n, s, ft, pt, Qa, Ya);
					h += "<path " + In + "  d='" + Ge + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "snipRoundRect":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = .33334, Ie, pt = .33334;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), ft = parseInt(Me.substr(4)) / 5e4) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), pt = parseInt(Ie.substr(4)) / 5e4);
					}
					var Ge = "M0," + s + " L" + n + "," + s + " L" + n + "," + s / 2 * pt + " L" + (n / 2 + n / 2 * (1 - pt)) + ",0 L" + n / 2 * ft + ",0 Q0,0 0," + s / 2 * ft + " z";
					h += "<path   d='" + Ge + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "bentConnector2":
					var Xe = "";
					Xe = "M " + n + " 0 L " + n + " " + s + " L 0 " + s, h += "<path d='" + Xe + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' fill='none' ", Dt !== void 0 && (Dt.type === "triangle" || Dt.type === "arrow") && (h += "marker-start='url(#markerTriangle_" + c + ")' "), Lt !== void 0 && (Lt.type === "triangle" || Lt.type === "arrow") && (h += "marker-end='url(#markerTriangle_" + c + ")' "), h += "/>";
					break;
				case "rtTriangle":
					h += " <polygon points='0 0,0 " + s + "," + n + " " + s + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "triangle":
				case "flowChartExtract":
				case "flowChartMerge":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Rs = .5;
					Ee !== void 0 && (Rs = parseInt(Ee.substr(4)) * A);
					var In = "";
					b == "flowChartMerge" && (In = "transform='rotate(180 " + n / 2 + "," + s / 2 + ")'"), h += " <polygon " + In + " points='" + n * Rs + " 0,0 " + s + "," + n + " " + s + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "diamond":
				case "flowChartDecision":
				case "flowChartSort":
					h += " <polygon points='" + n / 2 + " 0,0 " + s / 2 + "," + n / 2 + " " + s + "," + n + " " + s / 2 + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />", b == "flowChartSort" && (h += " <polyline points='0 " + s / 2 + "," + n + " " + s / 2 + "' fill='none' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />");
					break;
				case "trapezoid":
				case "flowChartManualOperation":
				case "flowChartManualInput":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Di = .2, Bi = .7407;
					if (Ee !== void 0) {
						var Mi = parseInt(Ee.substr(4)) * A;
						Di = Mi * .5 / Bi;
					}
					var ri = 0, In = "";
					b == "flowChartManualOperation" && (In = "transform='rotate(180 " + n / 2 + "," + s / 2 + ")'"), b == "flowChartManualInput" && (Di = 0, ri = s / 5), h += " <polygon " + In + " points='" + n * Di + " " + ri + ",0 " + s + "," + n + " " + s + "," + (1 - Di) * n + " 0' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "parallelogram":
				case "flowChartInputOutput":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Di = .25, Bi;
					if (n > s ? Bi = n / s : Bi = s / n, Ee !== void 0) {
						var Mi = parseInt(Ee.substr(4)) / 1e5;
						Di = Mi / Bi;
					}
					h += " <polygon points='" + Di * n + " 0,0 " + s + "," + (1 - Di) * n + " " + s + "," + n + " 0' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "pentagon":
					h += " <polygon points='" + .5 * n + " 0,0 " + .375 * s + "," + .15 * n + " " + s + "," + .85 * n + " " + s + "," + n + " " + .375 * s + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "hexagon":
				case "flowChartPreparation":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 25e3 * A, mr = 115470 * A, he = 5e4 * A, xe = 1e5 * A, vs = 60 * Math.PI / 180;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var wt, Ze, Ei, j, ne, je, q, ae, X = s / 2, Ke = s / 2, Be = Math.min(n, s);
					wt = he * n / Be, Ze = Re < 0 ? 0 : Re > wt ? wt : Re, Ei = Ke * mr / xe, j = Be * Ze / xe, ne = n - j, je = Ei * Math.sin(vs), q = X - je, ae = X + je;
					var Xe = "M0," + X + " L" + j + "," + q + " L" + ne + "," + q + " L" + n + "," + X + " L" + ne + "," + ae + " L" + j + "," + ae + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "heptagon":
					h += " <polygon points='" + .5 * n + " 0," + n / 8 + " " + s / 4 + ",0 " + 5 / 8 * s + "," + n / 4 + " " + s + "," + 3 / 4 * n + " " + s + "," + n + " " + 5 / 8 * s + "," + 7 / 8 * n + " " + s / 4 + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "octagon":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), te = .25;
					Ee !== void 0 && (te = parseInt(Ee.substr(4)) / 1e5);
					var de = 1 - te;
					h += " <polygon points='" + te * n + " 0,0 " + te * s + ",0 " + de * s + "," + te * n + " " + s + "," + de * n + " " + s + "," + n + " " + de * s + "," + n + " " + te * s + "," + de * n + " 0' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "decagon":
					h += " <polygon points='" + 3 / 8 * n + " 0," + n / 8 + " " + s / 8 + ",0 " + s / 2 + "," + n / 8 + " " + 7 / 8 * s + "," + 3 / 8 * n + " " + s + "," + 5 / 8 * n + " " + s + "," + 7 / 8 * n + " " + 7 / 8 * s + "," + n + " " + s / 2 + "," + 7 / 8 * n + " " + s / 8 + "," + 5 / 8 * n + " 0' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "dodecagon":
					h += " <polygon points='" + 3 / 8 * n + " 0," + n / 8 + " " + s / 8 + ",0 " + 3 / 8 * s + ",0 " + 5 / 8 * s + "," + n / 8 + " " + 7 / 8 * s + "," + 3 / 8 * n + " " + s + "," + 5 / 8 * n + " " + s + "," + 7 / 8 * n + " " + 7 / 8 * s + "," + n + " " + 5 / 8 * s + "," + n + " " + 3 / 8 * s + "," + 7 / 8 * n + " " + s / 8 + "," + 5 / 8 * n + " 0' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star4":
					var Ze, lt, rt, Zs, Xs, Vt, $t, Jt, Yt, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Re = 19098 * A, he = 5e4 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (Ee !== void 0) {
						var r = Ee.attrs.name;
						r == "adj" && (Re = parseInt(Ee.attrs.fmla.substr(4)) * A);
					}
					Ze = Re < 0 ? 0 : Re > he ? he : Re, lt = nt * Ze / he, rt = Ke * Ze / he, Zs = lt * Math.cos(.7853981634), Xs = rt * Math.sin(.7853981634), Vt = N - Zs, $t = N + Zs, Jt = X - Xs, Yt = X + Xs, X - rt;
					var Xe = "M0," + X + " L" + Vt + "," + Jt + " L" + N + ",0 L" + $t + "," + Jt + " L" + n + "," + X + " L" + $t + "," + Yt + " L" + N + "," + s + " L" + Vt + "," + Yt + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star5":
					var Ze, mi, Ei, Wi, et, we, je, it, j, ne, me, Te, q, ae, lt, rt, ma, da, ca, _a, Vt, $t, ha, ga, Jt, Yt, ya, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Re = 19098 * A, _n = 105146 * A, mr = 110557 * A, wt = 5e4 * A, he = 1e5 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					Ee !== void 0 && Object.keys(Ee).forEach(function(ui) {
						var xa = Ee[ui].attrs.name;
						xa == "adj" ? Re = parseInt(Ee[ui].attrs.fmla.substr(4)) * A : xa == "hf" ? _n = parseInt(Ee[ui].attrs.fmla.substr(4)) * A : xa == "vf" && (mr = parseInt(Ee[ui].attrs.fmla.substr(4)) * A);
					}), Ze = Re < 0 ? 0 : Re > wt ? wt : Re, mi = nt * _n / he, Ei = Ke * mr / he, Wi = X * mr / he, et = mi * Math.cos(.31415926536), we = mi * Math.cos(5.3407075111), je = Ei * Math.sin(.31415926536), it = Ei * Math.sin(5.3407075111), j = N - et, ne = N - we, me = N + we, Te = N + et, q = Wi - je, ae = Wi - it, lt = mi * Ze / wt, rt = Ei * Ze / wt, ma = lt * Math.cos(5.9690260418), da = lt * Math.cos(.94247779608), ca = rt * Math.sin(.94247779608), _a = rt * Math.sin(5.9690260418), Vt = N - ma, $t = N - da, ha = N + da, ga = N + ma, Jt = Wi - ca, Yt = Wi - _a, ya = Wi + rt, Wi - rt;
					var Xe = "M" + j + "," + q + " L" + $t + "," + Jt + " L" + N + ",0 L" + ha + "," + Jt + " L" + Te + "," + q + " L" + ga + "," + Yt + " L" + me + "," + ae + " L" + N + "," + ya + " L" + ne + "," + ae + " L" + Vt + "," + Yt + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star6":
					var Ze, mi, et, j, ne, ae, lt, rt, da, Vt, $t, ha, ga, ca, Jt, Yt, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Dr = s / 4, Re = 28868 * A, _n = 115470 * A, wt = 5e4 * A, he = 1e5 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					Ee !== void 0 && Object.keys(Ee).forEach(function(ui) {
						var xa = Ee[ui].attrs.name;
						xa == "adj" ? Re = parseInt(Ee[ui].attrs.fmla.substr(4)) * A : xa == "hf" && (_n = parseInt(Ee[ui].attrs.fmla.substr(4)) * A);
					}), Ze = Re < 0 ? 0 : Re > wt ? wt : Re, mi = nt * _n / he, et = mi * Math.cos(.5235987756), j = N - et, ne = N + et, ae = X + Dr, lt = mi * Ze / wt, rt = Ke * Ze / wt, da = lt / 2, Vt = N - lt, $t = N - da, ha = N + da, ga = N + lt, ca = rt * Math.sin(1.0471975512), Jt = X - ca, Yt = X + ca, X - rt;
					var Xe = "M" + j + "," + Dr + " L" + $t + "," + Jt + " L" + N + ",0 L" + ha + "," + Jt + " L" + ne + "," + Dr + " L" + ga + "," + X + " L" + ne + "," + ae + " L" + ha + "," + Yt + " L" + N + "," + s + " L" + $t + "," + Yt + " L" + j + "," + ae + " L" + Vt + "," + X + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star7":
					var Ze, mi, Ei, Wi, et, we, Ot, je, it, sa, j, ne, me, Te, st, vt, q, ae, le, lt, rt, ma, da, xi, Vt, $t, ha, ga, ti, si, ca, _a, Ui, Jt, Yt, ya, Ma, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Re = 34601 * A, _n = 102572 * A, mr = 105210 * A, wt = 5e4 * A, he = 1e5 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					Ee !== void 0 && Object.keys(Ee).forEach(function(ui) {
						var xa = Ee[ui].attrs.name;
						xa == "adj" ? Re = parseInt(Ee[ui].attrs.fmla.substr(4)) * A : xa == "hf" ? _n = parseInt(Ee[ui].attrs.fmla.substr(4)) * A : xa == "vf" && (mr = parseInt(Ee[ui].attrs.fmla.substr(4)) * A);
					}), Ze = Re < 0 ? 0 : Re > wt ? wt : Re, mi = nt * _n / he, Ei = Ke * mr / he, Wi = X * mr / he, et = mi * 97493 / 1e5, we = mi * 78183 / 1e5, Ot = mi * 43388 / 1e5, je = Ei * 62349 / 1e5, it = Ei * 22252 / 1e5, sa = Ei * 90097 / 1e5, j = N - et, ne = N - we, me = N - Ot, Te = N + Ot, st = N + we, vt = N + et, q = Wi - je, ae = Wi + it, le = Wi + sa, lt = mi * Ze / wt, rt = Ei * Ze / wt, ma = lt * 97493 / 1e5, da = lt * 78183 / 1e5, xi = lt * 43388 / 1e5, Vt = N - ma, $t = N - da, ha = N - xi, ga = N + xi, ti = N + da, si = N + ma, ca = rt * 90097 / 1e5, _a = rt * 22252 / 1e5, Ui = rt * 62349 / 1e5, Jt = Wi - ca, Yt = Wi - _a, ya = Wi + Ui, Ma = Wi + rt, Wi - rt;
					var Xe = "M" + j + "," + ae + " L" + Vt + "," + Yt + " L" + ne + "," + q + " L" + ha + "," + Jt + " L" + N + ",0 L" + ga + "," + Jt + " L" + st + "," + q + " L" + si + "," + Yt + " L" + vt + "," + ae + " L" + ti + "," + ya + " L" + Te + "," + le + " L" + N + "," + Ma + " L" + me + "," + le + " L" + $t + "," + ya + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star8":
					var Ze, et, j, ne, je, q, ae, lt, rt, ma, da, ca, _a, Vt, $t, ha, ga, Jt, Yt, ya, Ma, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Re = 37500 * A, wt = 5e4 * A, he = 1e5 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (Ee !== void 0) {
						var r = Ee.attrs.name;
						r == "adj" && (Re = parseInt(Ee.attrs.fmla.substr(4)) * A);
					}
					Ze = Re < 0 ? 0 : Re > wt ? wt : Re, et = nt * Math.cos(.7853981634), j = N - et, ne = N + et, je = Ke * Math.sin(.7853981634), q = X - je, ae = X + je, lt = nt * Ze / wt, rt = Ke * Ze / wt, ma = lt * 92388 / 1e5, da = lt * 38268 / 1e5, ca = rt * 92388 / 1e5, _a = rt * 38268 / 1e5, Vt = N - ma, $t = N - da, ha = N + da, ga = N + ma, Jt = X - ca, Yt = X - _a, ya = X + _a, Ma = X + ca, X - rt;
					var Xe = "M0," + X + " L" + Vt + "," + Yt + " L" + j + "," + q + " L" + $t + "," + Jt + " L" + N + ",0 L" + ha + "," + Jt + " L" + ne + "," + q + " L" + ga + "," + Yt + " L" + n + "," + X + " L" + ga + "," + ya + " L" + ne + "," + ae + " L" + ha + "," + Ma + " L" + N + "," + s + " L" + $t + "," + Ma + " L" + j + "," + ae + " L" + Vt + "," + ya + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star10":
					var Ze, mi, et, we, j, ne, me, Te, je, it, q, ae, le, Ue, lt, rt, ma, da, ca, _a, Vt, $t, ha, ga, ti, si, Jt, Yt, ya, Ma, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Re = 42533 * A, _n = 105146 * A, wt = 5e4 * A, he = 1e5 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					Ee !== void 0 && Object.keys(Ee).forEach(function(ui) {
						var xa = Ee[ui].attrs.name;
						xa == "adj" ? Re = parseInt(Ee[ui].attrs.fmla.substr(4)) * A : xa == "hf" && (_n = parseInt(Ee[ui].attrs.fmla.substr(4)) * A);
					}), Ze = Re < 0 ? 0 : Re > wt ? wt : Re, mi = nt * _n / he, et = mi * 95106 / 1e5, we = mi * 58779 / 1e5, j = N - et, ne = N - we, me = N + we, Te = N + et, je = Ke * 80902 / 1e5, it = Ke * 30902 / 1e5, q = X - je, ae = X - it, le = X + it, Ue = X + je, lt = mi * Ze / wt, rt = Ke * Ze / wt, ma = lt * 80902 / 1e5, da = lt * 30902 / 1e5, ca = rt * 95106 / 1e5, _a = rt * 58779 / 1e5, Vt = N - lt, $t = N - ma, ha = N - da, ga = N + da, ti = N + ma, si = N + lt, Jt = X - ca, Yt = X - _a, ya = X + _a, Ma = X + ca, X - rt;
					var Xe = "M" + j + "," + ae + " L" + $t + "," + Yt + " L" + ne + "," + q + " L" + ha + "," + Jt + " L" + N + ",0 L" + ga + "," + Jt + " L" + me + "," + q + " L" + ti + "," + Yt + " L" + Te + "," + ae + " L" + si + "," + X + " L" + Te + "," + le + " L" + ti + "," + ya + " L" + me + "," + Ue + " L" + ga + "," + Ma + " L" + N + "," + s + " L" + ha + "," + Ma + " L" + ne + "," + Ue + " L" + $t + "," + ya + " L" + j + "," + le + " L" + Vt + "," + X + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star12":
					var Ze, et, je, j, me, Te, q, le, Ue, lt, rt, ma, da, xi, ca, _a, Ui, Vt, $t, ha, ga, ti, si, Jt, Yt, ya, Ma, Ni, Hi, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Dr = s / 4, go = n / 4, Re = 37500 * A, wt = 5e4 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (Ee !== void 0) {
						var r = Ee.attrs.name;
						r == "adj" && (Re = parseInt(Ee.attrs.fmla.substr(4)) * A);
					}
					Ze = Re < 0 ? 0 : Re > wt ? wt : Re, et = nt * Math.cos(.5235987756), je = Ke * Math.sin(1.0471975512), j = N - et, me = n * 3 / 4, Te = N + et, q = X - je, le = s * 3 / 4, Ue = X + je, lt = nt * Ze / wt, rt = Ke * Ze / wt, ma = lt * Math.cos(.2617993878), da = lt * Math.cos(.7853981634), xi = lt * Math.cos(1.308996939), ca = rt * Math.sin(1.308996939), _a = rt * Math.sin(.7853981634), Ui = rt * Math.sin(.2617993878), Vt = N - ma, $t = N - da, ha = N - xi, ga = N + xi, ti = N + da, si = N + ma, Jt = X - ca, Yt = X - _a, ya = X - Ui, Ma = X + Ui, Ni = X + _a, Hi = X + ca, X - rt;
					var Xe = "M0," + X + " L" + Vt + "," + ya + " L" + j + "," + Dr + " L" + $t + "," + Yt + " L" + go + "," + q + " L" + ha + "," + Jt + " L" + N + ",0 L" + ga + "," + Jt + " L" + me + "," + q + " L" + ti + "," + Yt + " L" + Te + "," + Dr + " L" + si + "," + ya + " L" + n + "," + X + " L" + si + "," + Ma + " L" + Te + "," + le + " L" + ti + "," + Ni + " L" + me + "," + Ue + " L" + ga + "," + Hi + " L" + N + "," + s + " L" + ha + "," + Hi + " L" + go + "," + Ue + " L" + $t + "," + Ni + " L" + j + "," + le + " L" + Vt + "," + Ma + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star16":
					var Ze, et, we, Ot, je, it, sa, j, ne, me, Te, st, vt, q, ae, le, Ue, ct, At, lt, rt, ma, da, xi, wn, ca, _a, Ui, kn, Vt, $t, ha, ga, ti, si, Tn, Ln, Jt, Yt, ya, Ma, Ni, Hi, Fn, Wn, $a, za, xr, vr, yr, Cn, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Re = 37500 * A, wt = 5e4 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (Ee !== void 0) {
						var r = Ee.attrs.name;
						r == "adj" && (Re = parseInt(Ee.attrs.fmla.substr(4)) * A);
					}
					Ze = Re < 0 ? 0 : Re > wt ? wt : Re, et = nt * 92388 / 1e5, we = nt * 70711 / 1e5, Ot = nt * 38268 / 1e5, je = Ke * 92388 / 1e5, it = Ke * 70711 / 1e5, sa = Ke * 38268 / 1e5, j = N - et, ne = N - we, me = N - Ot, Te = N + Ot, st = N + we, vt = N + et, q = X - je, ae = X - it, le = X - sa, Ue = X + sa, ct = X + it, At = X + je, lt = nt * Ze / wt, rt = Ke * Ze / wt, ma = lt * 98079 / 1e5, da = lt * 83147 / 1e5, xi = lt * 55557 / 1e5, wn = lt * 19509 / 1e5, ca = rt * 98079 / 1e5, _a = rt * 83147 / 1e5, Ui = rt * 55557 / 1e5, kn = rt * 19509 / 1e5, Vt = N - ma, $t = N - da, ha = N - xi, ga = N - wn, ti = N + wn, si = N + xi, Tn = N + da, Ln = N + ma, Jt = X - ca, Yt = X - _a, ya = X - Ui, Ma = X - kn, Ni = X + kn, Hi = X + Ui, Fn = X + _a, Wn = X + ca, $a = lt * Math.cos(.7853981634), za = rt * Math.sin(.7853981634), xr = N - $a, vr = X - za, yr = N + $a, Cn = X + za, X - rt;
					var Xe = "M0," + X + " L" + Vt + "," + Ma + " L" + j + "," + le + " L" + $t + "," + ya + " L" + ne + "," + ae + " L" + ha + "," + Yt + " L" + me + "," + q + " L" + ga + "," + Jt + " L" + N + ",0 L" + ti + "," + Jt + " L" + Te + "," + q + " L" + si + "," + Yt + " L" + st + "," + ae + " L" + Tn + "," + ya + " L" + vt + "," + le + " L" + Ln + "," + Ma + " L" + n + "," + X + " L" + Ln + "," + Ni + " L" + vt + "," + Ue + " L" + Tn + "," + Hi + " L" + st + "," + ct + " L" + si + "," + Fn + " L" + Te + "," + At + " L" + ti + "," + Wn + " L" + N + "," + s + " L" + ga + "," + Wn + " L" + me + "," + At + " L" + ha + "," + Fn + " L" + ne + "," + ct + " L" + $t + "," + Hi + " L" + j + "," + Ue + " L" + Vt + "," + Ni + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star24":
					var Ze, et, we, Ot, Qi, sn, je, it, sa, bn, Mr, j, ne, me, Te, st, vt, jt, Xt, fa, ai, q, ae, le, Ue, ct, At, ta, Ha, Vi, pn, lt, rt, ma, da, xi, wn, ns, rs, ca, _a, Ui, kn, ss, ds, Vt, $t, ha, ga, ti, si, Tn, Ln, os, cs, hs, ls, Jt, Yt, ya, Ma, Ni, Hi, Fn, Wn, gs, fs, ps, us, $a, za, xr, vr, yr, Cn, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Dr = s / 4, go = n / 4, Re = 37500 * A, wt = 5e4 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (Ee !== void 0) {
						var r = Ee.attrs.name;
						r == "adj" && (Re = parseInt(Ee.attrs.fmla.substr(4)) * A);
					}
					Ze = Re < 0 ? 0 : Re > wt ? wt : Re, et = nt * Math.cos(.2617993878), we = nt * Math.cos(.5235987756), Ot = nt * Math.cos(.7853981634), Qi = go, sn = nt * Math.cos(1.308996939), je = Ke * Math.sin(1.308996939), it = Ke * Math.sin(1.0471975512), sa = Ke * Math.sin(.7853981634), bn = Dr, Mr = Ke * Math.sin(.2617993878), j = N - et, ne = N - we, me = N - Ot, Te = N - Qi, st = N - sn, vt = N + sn, jt = N + Qi, Xt = N + Ot, fa = N + we, ai = N + et, q = X - je, ae = X - it, le = X - sa, Ue = X - bn, ct = X - Mr, At = X + Mr, ta = X + bn, Ha = X + sa, Vi = X + it, pn = X + je, lt = nt * Ze / wt, rt = Ke * Ze / wt, ma = lt * 99144 / 1e5, da = lt * 92388 / 1e5, xi = lt * 79335 / 1e5, wn = lt * 60876 / 1e5, ns = lt * 38268 / 1e5, rs = lt * 13053 / 1e5, ca = rt * 99144 / 1e5, _a = rt * 92388 / 1e5, Ui = rt * 79335 / 1e5, kn = rt * 60876 / 1e5, ss = rt * 38268 / 1e5, ds = rt * 13053 / 1e5, Vt = N - ma, $t = N - da, ha = N - xi, ga = N - wn, ti = N - ns, si = N - rs, Tn = N + rs, Ln = N + ns, os = N + wn, cs = N + xi, hs = N + da, ls = N + ma, Jt = X - ca, Yt = X - _a, ya = X - Ui, Ma = X - kn, Ni = X - ss, Hi = X - ds, Fn = X + ds, Wn = X + ss, gs = X + kn, fs = X + Ui, ps = X + _a, us = X + ca, $a = lt * Math.cos(.7853981634), za = rt * Math.sin(.7853981634), xr = N - $a, vr = X - za, yr = N + $a, Cn = X + za, X - rt;
					var Xe = "M0," + X + " L" + Vt + "," + Hi + " L" + j + "," + ct + " L" + $t + "," + Ni + " L" + ne + "," + Ue + " L" + ha + "," + Ma + " L" + me + "," + le + " L" + ga + "," + ya + " L" + Te + "," + ae + " L" + ti + "," + Yt + " L" + st + "," + q + " L" + si + "," + Jt + " L" + N + ",0 L" + Tn + "," + Jt + " L" + vt + "," + q + " L" + Ln + "," + Yt + " L" + jt + "," + ae + " L" + os + "," + ya + " L" + Xt + "," + le + " L" + cs + "," + Ma + " L" + fa + "," + Ue + " L" + hs + "," + Ni + " L" + ai + "," + ct + " L" + ls + "," + Hi + " L" + n + "," + X + " L" + ls + "," + Fn + " L" + ai + "," + At + " L" + hs + "," + Wn + " L" + fa + "," + ta + " L" + cs + "," + gs + " L" + Xt + "," + Ha + " L" + os + "," + fs + " L" + jt + "," + Vi + " L" + Ln + "," + ps + " L" + vt + "," + pn + " L" + Tn + "," + us + " L" + N + "," + s + " L" + si + "," + us + " L" + st + "," + pn + " L" + ti + "," + ps + " L" + Te + "," + Vi + " L" + ga + "," + fs + " L" + me + "," + Ha + " L" + ha + "," + gs + " L" + ne + "," + ta + " L" + $t + "," + Wn + " L" + j + "," + At + " L" + Vt + "," + Fn + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "star32":
					var Ze, et, we, Ot, Qi, sn, a0, is, je, it, sa, bn, Mr, L1, F1, j, ne, me, Te, st, vt, jt, Xt, fa, ai, Nr, _r, wr, Gr, q, ae, le, Ue, ct, At, ta, Ha, Vi, pn, Hs, js, Gs, Ns, lt, rt, ma, da, xi, wn, ns, rs, W1, C1, ca, _a, Ui, kn, ss, ds, S1, A1, Vt, $t, ha, ga, ti, si, Tn, Ln, os, cs, hs, ls, M1, B1, E1, I1, Jt, Yt, ya, Ma, Ni, Hi, Fn, Wn, gs, fs, ps, us, P1, z1, R1, O1, $a, za, xr, vr, yr, Cn, N = n / 2, X = s / 2, nt = n / 2, Ke = s / 2, Dr = s / 4, go = n / 4, Re = 37500 * A, wt = 5e4 * A, Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]);
					if (Ee !== void 0) {
						var r = Ee.attrs.name;
						r == "adj" && (Re = parseInt(Ee.attrs.fmla.substr(4)) * A);
					}
					Ze = Re < 0 ? 0 : Re > wt ? wt : Re, et = nt * 98079 / 1e5, we = nt * 92388 / 1e5, Ot = nt * 83147 / 1e5, Qi = nt * Math.cos(.7853981634), sn = nt * 55557 / 1e5, a0 = nt * 38268 / 1e5, is = nt * 19509 / 1e5, je = Ke * 98079 / 1e5, it = Ke * 92388 / 1e5, sa = Ke * 83147 / 1e5, bn = Ke * Math.sin(.7853981634), Mr = Ke * 55557 / 1e5, L1 = Ke * 38268 / 1e5, F1 = Ke * 19509 / 1e5, j = N - et, ne = N - we, me = N - Ot, Te = N - Qi, st = N - sn, vt = N - a0, jt = N - is, Xt = N + is, fa = N + a0, ai = N + sn, Nr = N + Qi, _r = N + Ot, wr = N + we, Gr = N + et, q = X - je, ae = X - it, le = X - sa, Ue = X - bn, ct = X - Mr, At = X - L1, ta = X - F1, Ha = X + F1, Vi = X + L1, pn = X + Mr, Hs = X + bn, js = X + sa, Gs = X + it, Ns = X + je, lt = nt * Ze / wt, rt = Ke * Ze / wt, ma = lt * 99518 / 1e5, da = lt * 95694 / 1e5, xi = lt * 88192 / 1e5, wn = lt * 77301 / 1e5, ns = lt * 63439 / 1e5, rs = lt * 47140 / 1e5, W1 = lt * 29028 / 1e5, C1 = lt * 9802 / 1e5, ca = rt * 99518 / 1e5, _a = rt * 95694 / 1e5, Ui = rt * 88192 / 1e5, kn = rt * 77301 / 1e5, ss = rt * 63439 / 1e5, ds = rt * 47140 / 1e5, S1 = rt * 29028 / 1e5, A1 = rt * 9802 / 1e5, Vt = N - ma, $t = N - da, ha = N - xi, ga = N - wn, ti = N - ns, si = N - rs, Tn = N - W1, Ln = N - C1, os = N + C1, cs = N + W1, hs = N + rs, ls = N + ns, M1 = N + wn, B1 = N + xi, E1 = N + da, I1 = N + ma, Jt = X - ca, Yt = X - _a, ya = X - Ui, Ma = X - kn, Ni = X - ss, Hi = X - ds, Fn = X - S1, Wn = X - A1, gs = X + A1, fs = X + S1, ps = X + ds, us = X + ss, P1 = X + kn, z1 = X + Ui, R1 = X + _a, O1 = X + ca, $a = lt * Math.cos(.7853981634), za = rt * Math.sin(.7853981634), xr = N - $a, vr = X - za, yr = N + $a, Cn = X + za, X - rt;
					var Xe = "M0," + X + " L" + Vt + "," + Wn + " L" + j + "," + ta + " L" + $t + "," + Fn + " L" + ne + "," + At + " L" + ha + "," + Hi + " L" + me + "," + ct + " L" + ga + "," + Ni + " L" + Te + "," + Ue + " L" + ti + "," + Ma + " L" + st + "," + le + " L" + si + "," + ya + " L" + vt + "," + ae + " L" + Tn + "," + Yt + " L" + jt + "," + q + " L" + Ln + "," + Jt + " L" + N + ",0 L" + os + "," + Jt + " L" + Xt + "," + q + " L" + cs + "," + Yt + " L" + fa + "," + ae + " L" + hs + "," + ya + " L" + ai + "," + le + " L" + ls + "," + Ma + " L" + Nr + "," + Ue + " L" + M1 + "," + Ni + " L" + _r + "," + ct + " L" + B1 + "," + Hi + " L" + wr + "," + At + " L" + E1 + "," + Fn + " L" + Gr + "," + ta + " L" + I1 + "," + Wn + " L" + n + "," + X + " L" + I1 + "," + gs + " L" + Gr + "," + Ha + " L" + E1 + "," + fs + " L" + wr + "," + Vi + " L" + B1 + "," + ps + " L" + _r + "," + pn + " L" + M1 + "," + us + " L" + Nr + "," + Hs + " L" + ls + "," + P1 + " L" + ai + "," + js + " L" + hs + "," + z1 + " L" + fa + "," + Gs + " L" + cs + "," + R1 + " L" + Xt + "," + Ns + " L" + os + "," + O1 + " L" + N + "," + s + " L" + Ln + "," + O1 + " L" + jt + "," + Ns + " L" + Tn + "," + R1 + " L" + vt + "," + Gs + " L" + si + "," + z1 + " L" + st + "," + js + " L" + ti + "," + P1 + " L" + Te + "," + Hs + " L" + ga + "," + us + " L" + me + "," + pn + " L" + ha + "," + ps + " L" + ne + "," + Vi + " L" + $t + "," + fs + " L" + j + "," + Ha + " L" + Vt + "," + gs + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "pie":
				case "pieWedge":
				case "arc":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), te, de, xc, Bs, vc, fo;
					b == "pie" ? (te = 0, de = 270, xc = s, fo = !0) : b == "pieWedge" ? (te = 180, de = 270, xc = 2 * s, fo = !0) : b == "arc" && (te = 270, de = 0, xc = s, fo = !1), Ee !== void 0 && (Bs = x(Ee, ["attrs", "fmla"]), vc = Bs, Bs === void 0 && (Bs = Ee[0].attrs.fmla, vc = Ee[1].attrs.fmla), Bs !== void 0 && (te = parseInt(Bs.substr(4)) / 6e4), vc !== void 0 && (de = parseInt(vc.substr(4)) / 6e4));
					var Tl = ap(xc, n, te, de, fo);
					h += "<path   d='" + Tl[0] + "' transform='" + Tl[1] + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "chord":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = 45, Ie, pt = 270;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), ft = parseInt(Me.substr(4)) / 6e4) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), pt = parseInt(Ie.substr(4)) / 6e4);
					}
					var ut = s / 2, aa = n / 2, Ge = ye(aa, ut, aa, ut, ft, pt, !0);
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "frame":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), te = 12500 * A, he = 5e4 * A, xe = 1e5 * A;
					Ee !== void 0 && (te = parseInt(Ee.substr(4)) * A);
					var De, j, Te, Ue;
					te < 0 ? De = 0 : te > he ? De = he : De = te, j = Math.min(n, s) * De / xe, Te = n - j, Ue = s - j;
					var Xe = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " zM" + j + "," + j + " L" + j + "," + Ue + " L" + Te + "," + Ue + " L" + Te + "," + j + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "donut":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 25e3 * A, he = 5e4 * A, xe = 1e5 * A;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var Ze, fn, lt, rt;
					Re < 0 ? Ze = 0 : Re > he ? Ze = he : Ze = Re, fn = Math.min(n, s) * Ze / xe, lt = n / 2 - fn, rt = s / 2 - fn;
					var Xe = "M0," + s / 2 + ye(n / 2, s / 2, n / 2, s / 2, 180, 270, !1).replace("M", "L") + ye(n / 2, s / 2, n / 2, s / 2, 270, 360, !1).replace("M", "L") + ye(n / 2, s / 2, n / 2, s / 2, 0, 90, !1).replace("M", "L") + ye(n / 2, s / 2, n / 2, s / 2, 90, 180, !1).replace("M", "L") + " zM" + fn + "," + s / 2 + ye(n / 2, s / 2, lt, rt, 180, 90, !1).replace("M", "L") + ye(n / 2, s / 2, lt, rt, 90, 0, !1).replace("M", "L") + ye(n / 2, s / 2, lt, rt, 0, -90, !1).replace("M", "L") + ye(n / 2, s / 2, lt, rt, 270, 180, !1).replace("M", "L") + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "noSmoking":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 18750 * A, he = 5e4 * A, xe = 1e5 * A;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var Ze, fn, lt, rt, yc, j1, G1, Ll, Fl, Wl, N1, li, ua, Js, Xr, Ar;
					Re < 0 ? Ze = 0 : Re > he ? Ze = he : Ze = Re, fn = Math.min(n, s) * Ze / xe, lt = n / 2 - fn, rt = s / 2 - fn, yc = Math.atan(s / n), j1 = rt * Math.cos(yc), G1 = lt * Math.sin(yc), Ll = Math.sqrt(j1 * j1 + G1 * G1), Fl = lt * rt / Ll, Wl = fn / 2, N1 = Math.atan(Wl / Fl), li = N1 * 2, ua = -Math.PI + li, Xr = yc - N1, Ar = Xr - Math.PI;
					var Cl = rt * Math.cos(Xr), Sl = lt * Math.sin(Xr), Qp = Math.sqrt(Cl * Cl + Sl * Sl), Al = lt * rt / Qp, et = Al * Math.cos(Xr), je = Al * Math.sin(Xr), j = n / 2 + et, q, q = s / 2 + je, ae;
					ne = n / 2 - et, ae = s / 2 - je;
					var Ml = Xr * 180 / Math.PI, Bl = Ar * 180 / Math.PI, El = ua * 180 / Math.PI, Xe = "M0," + s / 2 + ye(n / 2, s / 2, n / 2, s / 2, 180, 270, !1).replace("M", "L") + ye(n / 2, s / 2, n / 2, s / 2, 270, 360, !1).replace("M", "L") + ye(n / 2, s / 2, n / 2, s / 2, 0, 90, !1).replace("M", "L") + ye(n / 2, s / 2, n / 2, s / 2, 90, 180, !1).replace("M", "L") + " zM" + j + "," + q + ye(n / 2, s / 2, lt, rt, Ml, Ml + El, !1).replace("M", "L") + " zM" + ne + "," + ae + ye(n / 2, s / 2, lt, rt, Bl, Bl + El, !1).replace("M", "L") + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "halfFrame":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = 3.5, Ie, pt = 3.5, qi = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), ft = parseInt(Me.substr(4)) * A) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), pt = parseInt(Ie.substr(4)) * A);
					}
					var yt = Math.min(n, s), Et = qi * n / yt, De, Pe;
					pt < 0 ? Pe = 0 : pt > Et ? Pe = Et : Pe = pt;
					var j = yt * Pe / qi, kc = s * j / n, ms = s - kc, Ut = qi * ms / yt;
					ft < 0 ? De = 0 : ft > Ut ? De = Ut : De = ft;
					var q = yt * De / qi, we = q * n / s, ne = n - we, it = j * s / n, ae = s - it, Xe = "M0,0 L" + n + ",0 L" + ne + "," + q + " L" + j + "," + q + " L" + j + "," + ae + " L0," + s + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "blockArc":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 180, Ie, de = 0, xt, Ae = 25e3 * A, he = 5e4 * A, xe = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) / 6e4) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) / 6e4) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var ia, hn, ht, Dc, Il, ua, ks, po = 360;
					te < 0 ? ia = 0 : te > po ? ia = po : ia = te, de < 0 ? hn = 0 : de > po ? hn = po : hn = de, Ae < 0 ? ht = 0 : Ae > he ? ht = he : ht = Ae, Dc = hn - ia, Il = Dc + po, ua = Dc > 0 ? Dc : Il, ks = -ua;
					var jn = ia + ua, eu = hn + ks, Es, Is, et, je, j, q, Uc = ia * Math.PI / 180, _c = hn * Math.PI / 180, nt = n / 2, Ke = s / 2, N = n / 2, X = s / 2;
					ia > 90 && ia < 270 ? (Es = nt * Math.sin(Math.PI / 2 - Uc), Is = Ke * Math.cos(Math.PI / 2 - Uc), et = nt * Math.cos(Math.atan(Is / Es)), je = Ke * Math.sin(Math.atan(Is / Es)), j = N - et, q = X - je) : (Es = nt * Math.sin(Uc), Is = Ke * Math.cos(Uc), et = nt * Math.cos(Math.atan(Es / Is)), je = Ke * Math.sin(Math.atan(Es / Is)), j = N + et, q = X + je);
					var fn = Math.min(n, s) * ht / xe, lt = nt - fn, rt = Ke - fn, Ps, zs, we, it, ne, ae;
					jn <= 450 && jn > 270 || jn >= 630 && jn < 720 ? (Ps = lt * Math.sin(_c), zs = rt * Math.cos(_c), we = lt * Math.cos(Math.atan(Ps / zs)), it = rt * Math.sin(Math.atan(Ps / zs)), ne = N + we, ae = X + it) : (Ps = lt * Math.sin(Math.PI / 2 - _c), zs = rt * Math.cos(Math.PI / 2 - _c), we = lt * Math.cos(Math.atan(zs / Ps)), it = rt * Math.sin(Math.atan(zs / Ps)), ne = N - we, ae = X - it);
					var Xe = "M" + j + "," + q + ye(nt, Ke, nt, Ke, ia, jn, !1).replace("M", "L") + " L" + ne + "," + ae + ye(nt, Ke, lt, rt, hn, eu, !1).replace("M", "L") + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "bracePair":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 8333 * A, he = 25e3 * A, xe = 5e4 * A, Mt = 1e5 * A;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var X = s / 2, uo = 360, It = 180, Zt = 90, Ht = 270, Ze, j, ne, me, Te, ae, le, Ue;
					Re < 0 ? Ze = 0 : Re > he ? Ze = he : Ze = Re;
					var yt = Math.min(n, s);
					j = yt * Ze / Mt, ne = yt * Ze / xe, me = n - ne, Te = n - j, ae = X - j, le = X + j, Ue = s - j;
					var Xe = "M" + ne + "," + s + ye(ne, Ue, j, j, Zt, It, !1).replace("M", "L") + " L" + j + "," + le + ye(0, le, j, j, 0, -Zt, !1).replace("M", "L") + ye(0, ae, j, j, Zt, 0, !1).replace("M", "L") + " L" + j + "," + j + ye(ne, j, j, j, It, Ht, !1).replace("M", "L") + " M" + me + ",0" + ye(me, j, j, j, Ht, uo, !1).replace("M", "L") + " L" + Te + "," + ae + ye(n, ae, j, j, It, Zt, !1).replace("M", "L") + ye(n, le, j, j, Ht, It, !1).replace("M", "L") + " L" + Te + "," + Ue + ye(me, Ue, j, j, 0, Zt, !1).replace("M", "L");
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftBrace":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 8333 * A, Ie, de = 5e4 * A, xe = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A);
					}
					var X = s / 2, It = 180, Zt = 90, Ht = 270, De, Pe, Kt, qt, Ra, q, ae, le, Ue;
					de < 0 ? Pe = 0 : de > xe ? Pe = xe : Pe = de;
					var yt = Math.min(n, s);
					Kt = xe - Pe, Kt < Pe ? qt = Kt : qt = Pe, Ra = qt / 2;
					var Ut = Ra * s / yt;
					te < 0 ? De = 0 : te > Ut ? De = Ut : De = te, q = yt * De / xe, le = s * Pe / xe, ae = le - q, Ue = le + q;
					var Xe = "M" + n + "," + s + ye(n, s - q, n / 2, q, Zt, It, !1).replace("M", "L") + " L" + n / 2 + "," + Ue + ye(0, Ue, n / 2, q, 0, -Zt, !1).replace("M", "L") + ye(0, ae, n / 2, q, Zt, 0, !1).replace("M", "L") + " L" + n / 2 + "," + q + ye(n, q, n / 2, q, It, Ht, !1).replace("M", "L");
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "rightBrace":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 8333 * A, Ie, de = 5e4 * A, xe = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A);
					}
					var X = s / 2, uo = 360, It = 180, Zt = 90, Ht = 270, De, Pe, Kt, qt, Ra, q, ae, le, Ue;
					de < 0 ? Pe = 0 : de > xe ? Pe = xe : Pe = de;
					var yt = Math.min(n, s);
					Kt = xe - Pe, Kt < Pe ? qt = Kt : qt = Pe, Ra = qt / 2;
					var Ut = Ra * s / yt;
					te < 0 ? De = 0 : te > Ut ? De = Ut : De = te, q = yt * De / xe, le = s * Pe / xe, ae = le - q, Ue = s - q;
					var Xe = "M0,0" + ye(0, q, n / 2, q, Ht, uo, !1).replace("M", "L") + " L" + n / 2 + "," + ae + ye(n, ae, n / 2, q, It, Zt, !1).replace("M", "L") + ye(n, le + q, n / 2, q, Ht, It, !1).replace("M", "L") + " L" + n / 2 + "," + Ue + ye(0, Ue, n / 2, q, 0, Zt, !1).replace("M", "L");
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "bracketPair":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 16667 * A, he = 5e4 * A, xe = 1e5 * A;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var Tt = n, mt = s, It = 180, Zt = 90, Ht = 270, Ze, j, ne, ae;
					Re < 0 ? Ze = 0 : Re > he ? Ze = he : Ze = Re, j = Math.min(n, s) * Ze / xe, ne = Tt - j, ae = mt - j;
					var Xe = ye(j, j, j, j, Ht, It, !1) + ye(j, ae, j, j, It, Zt, !1).replace("M", "L") + ye(ne, j, j, j, Ht, Ht + Zt, !1) + ye(ne, ae, j, j, 0, Zt, !1).replace("M", "L");
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftBracket":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 8333 * A, he = 5e4 * A, xe = 1e5 * A, wt = he * s / Math.min(n, s);
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var Tt = n, mt = s, It = 180, Zt = 90, Ht = 270, Ze, q, ae;
					Re < 0 ? Ze = 0 : Re > wt ? Ze = wt : Ze = Re, q = Math.min(n, s) * Ze / xe, q > n && (q = n), ae = mt - q;
					var Xe = "M" + Tt + "," + mt + ye(q, ae, q, q, Zt, It, !1).replace("M", "L") + " L0," + q + ye(q, q, q, q, It, Ht, !1).replace("M", "L") + " L" + Tt + ",0";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "rightBracket":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 8333 * A, he = 5e4 * A, xe = 1e5 * A, wt = he * s / Math.min(n, s);
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var uo = 360, It = 180, Zt = 90, Ht = 270, Ze, q, ae, le;
					Re < 0 ? Ze = 0 : Re > wt ? Ze = wt : Ze = Re, q = Math.min(n, s) * Ze / xe, ae = s - q, le = n - q;
					var Xe = "M0," + s + ye(le, ae, q, q, Zt, 0, !1).replace("M", "L") + " L" + n + "," + s / 2 + ye(le, q, q, q, uo, Ht, !1).replace("M", "L") + " L0,0";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "moon":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = .5;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) / 1e5);
					var Ke = s / 2, It = 180, Zt = 90, de = (1 - Re) * n, Xe = "M" + n + "," + s + ye(n, Ke, n, Ke, Zt, Zt + It, !1).replace("M", "L") + ye(n, Ke, de, Ke, Zt + It, Zt, !1).replace("M", "L") + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "corner":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = 5e4 * A, Ie, pt = 5e4 * A, qi = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), ft = parseInt(Me.substr(4)) * A) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), pt = parseInt(Ie.substr(4)) * A);
					}
					var yt = Math.min(n, s), Ut = qi * s / yt, Et = qi * n / yt, De, Pe, j, je, q;
					ft < 0 ? De = 0 : ft > Ut ? De = Ut : De = ft, pt < 0 ? Pe = 0 : pt > Et ? Pe = Et : Pe = pt, j = yt * Pe / qi, je = yt * De / qi, q = s - je;
					var Xe = "M0,0 L" + j + ",0 L" + j + "," + q + " L" + n + "," + q + " L" + n + "," + s + " L0," + s + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "diagStripe":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), ft = 5e4 * A, qi = 1e5 * A;
					Ee !== void 0 && (ft = parseInt(Ee.substr(4)) * A);
					var De, ne, ae;
					ft < 0 ? De = 0 : ft > qi ? De = qi : De = ft, ne = n * De / qi, ae = s * De / qi;
					var Xe = "M0," + ae + " L" + ne + ",0 L" + n + ",0 L0," + s + " z";
					h += "<path   d='" + Xe + "'  fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "gear6":
				case "gear9":
					ee = 0;
					var tu = b.substr(4), Xe = ip(n, s / 3.5, parseInt(tu));
					h += "<path   d='" + Xe + "' transform='rotate(20," + 3 / 7 * s + "," + 3 / 7 * s + ")' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "bentConnector3":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Rs = .5;
					Ee !== void 0 && (Rs = parseInt(Ee.substr(4)) / 1e5, h += " <polyline points='0 0," + Rs * n + " 0," + Rs * n + " " + s + "," + n + " " + s + "' fill='transparent'' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' ", Dt !== void 0 && (Dt.type === "triangle" || Dt.type === "arrow") && (h += "marker-start='url(#markerTriangle_" + c + ")' "), Lt !== void 0 && (Lt.type === "triangle" || Lt.type === "arrow") && (h += "marker-end='url(#markerTriangle_" + c + ")' "), h += "/>");
					break;
				case "plus":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), te = .25;
					Ee !== void 0 && (te = parseInt(Ee.substr(4)) / 1e5);
					var de = 1 - te;
					h += " <polygon points='" + te * n + " 0," + te * n + " " + te * s + ",0 " + te * s + ",0 " + de * s + "," + te * n + " " + de * s + "," + te * n + " " + s + "," + de * n + " " + s + "," + de * n + " " + de * s + "," + n + " " + de * s + "," + +n + " " + te * s + "," + de * n + " " + te * s + "," + de * n + " 0' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "teardrop":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), te = 1e5 * A, bo = te, wc = 2e5 * A;
					Ee !== void 0 && (te = parseInt(Ee.substr(4)) * A);
					var De, H1, Pl, Ct, zl, Rl, et, je, j, q, ne, ae, Z1;
					te < 0 ? De = 0 : te > wc ? De = wc : De = te, H1 = Math.sqrt(2), Pl = H1 * (n / 2), Ct = H1 * (s / 2), zl = Pl * De / bo, Rl = Ct * De / bo, Z1 = 45 * Math.PI / 180, et = zl * Math.cos(Z1), je = Rl * Math.cos(Z1), j = n / 2 + et, q = s / 2 - je, ne = (n / 2 + j) / 2, ae = (s / 2 + q) / 2;
					var Ge = ye(n / 2, s / 2, n / 2, s / 2, 180, 270, !1) + "Q " + ne + ",0 " + j + "," + q + "Q " + n + "," + ae + " " + n + "," + s / 2 + ye(n / 2, s / 2, n / 2, s / 2, 0, 90, !1).replace("M", "L") + ye(n / 2, s / 2, n / 2, s / 2, 90, 180, !1).replace("M", "L") + " z";
					h += "<path   d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "plaque":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), te = 16667 * A, bo = 5e4 * A, wc = 1e5 * A;
					Ee !== void 0 && (te = parseInt(Ee.substr(4)) * A);
					var De, j, ne, ae;
					te < 0 ? De = 0 : te > bo ? De = bo : De = te, j = De * Math.min(n, s) / wc, ne = n - j, ae = s - j;
					var Ge = "M0," + j + ye(0, 0, j, j, 90, 0, !1).replace("M", "L") + " L" + ne + ",0" + ye(n, 0, j, j, 180, 90, !1).replace("M", "L") + " L" + n + "," + ae + ye(n, s, j, j, 270, 180, !1).replace("M", "L") + " L" + j + "," + s + ye(0, s, j, j, 0, -90, !1).replace("M", "L") + " z";
					h += "<path   d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "sun":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Le = A, te = 25e3 * Le, he = 12500 * Le, xe = 46875 * Le;
					Ee !== void 0 && (te = parseInt(Ee.substr(4)) * Le);
					var De;
					te < he ? De = he : te > xe ? De = xe : De = te;
					var bs = 5e4 * Le, Fa = 1e5 * Le, mo = bs - De, kc = mo * (30274 * Le) / (32768 * Le), ms = mo * (12540 * Le) / (32768 * Le), X1 = kc + bs, Tc = ms + bs, xo = bs - kc, xs = bs - ms, jr = mo * (23170 * Le) / (32768 * Le), Ur = bs + jr, Ft = bs - jr, la = xo * 3 / 4, _t = xs * 3 / 4, na = la + 3662 * Le, ot = _t + 36620 * Le, Da = _t + 12500 * Le, Wa = Fa - la, Pa = Fa - na, Ta = Fa - ot, Ii = Fa - Da, Ol = n * (18436 * Le) / (21600 * Le), jl = s * (3163 * Le) / (21600 * Le), Gl = n * (3163 * Le) / (21600 * Le), Nl = s * (18436 * Le) / (21600 * Le), Xt = n * Ur / Fa, fa = n * Ft / Fa, ai = n * la / Fa, _r = n * na / Fa, wr = n * ot / Fa, Gr = n * Da / Fa, Os = n * Wa / Fa, Hl = n * Pa / Fa, Zl = n * Ta / Fa, Xl = n * Ii / Fa, au = n * De / Fa, aa = n * mo / Fa, ut = s * mo / Fa, Ha = s * Ur / Fa, Vi = s * Ft / Fa, pn = s * la / Fa, js = s * na / Fa, Gs = s * ot / Fa, Ns = s * Da / Fa, Jl = s * Wa / Fa, Yl = s * Pa / Fa, $l = s * Ta / Fa, ql = s * Ii / Fa, Ge = "M" + n + "," + s / 2 + " L" + Os + "," + ql + " L" + Os + "," + Ns + "z M" + Ol + "," + jl + " L" + Hl + "," + $l + " L" + wr + "," + js + "z M" + n / 2 + ",0 L" + Xl + "," + pn + " L" + Gr + "," + pn + "z M" + Gl + "," + jl + " L" + Zl + "," + js + " L" + _r + "," + $l + "z M0," + s / 2 + " L" + ai + "," + Ns + " L" + ai + "," + ql + "z M" + Gl + "," + Nl + " L" + _r + "," + Gs + " L" + Zl + "," + Yl + "z M" + n / 2 + "," + s + " L" + Gr + "," + Jl + " L" + Xl + "," + Jl + "z M" + Ol + "," + Nl + " L" + wr + "," + Yl + " L" + Hl + "," + Gs + " z M" + au + "," + s / 2 + ye(n / 2, s / 2, aa, ut, 180, 540, !1).replace("M", "L") + " z";
					h += "<path   d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "heart":
					var et = n * 49 / 48, we = n * 10 / 48, j = n / 2 - et, ne = n / 2 - we, me = n / 2 + we, Te = n / 2 + et, q = -s / 3, Ge = "M" + n / 2 + "," + s / 4 + "C" + me + "," + q + " " + Te + "," + s / 4 + " " + n / 2 + "," + s + "C" + j + "," + s / 4 + " " + ne + "," + q + " " + n / 2 + "," + s / 4 + " z";
					h += "<path   d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "lightningBolt":
					var j = n * 5022 / 21600, ne = n * 11050 / 21600, me = n * 8472 / 21600, Te = n * 8757 / 21600, st = n * 10012 / 21600, vt = n * 14767 / 21600, jt = n * 12222 / 21600, Xt = n * 12860 / 21600, fa = n * 13917 / 21600, ai = n * 7602 / 21600, Nr = n * 16577 / 21600, q = s * 3890 / 21600, ae = s * 6080 / 21600, le = s * 6797 / 21600, Ue = s * 7437 / 21600, ct = s * 12877 / 21600, At = s * 9705 / 21600, ta = s * 12007 / 21600, Ha = s * 13987 / 21600, Vi = s * 8382 / 21600, pn = s * 14277 / 21600, Hs = s * 14915 / 21600, Ge = "M" + me + ",0 L" + Xt + "," + ae + " L" + ne + "," + le + " L" + Nr + "," + ta + " L" + vt + "," + ct + " L" + n + "," + s + " L" + st + "," + Hs + " L" + jt + "," + Ha + " L" + j + "," + At + " L" + ai + "," + Vi + " L0," + q + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "cube":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Le = A, Re = 25e3 * Le;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * Le);
					var Ge, xe = 1e5 * Le, Be = Math.min(n, s), Ze = Re < 0 ? 0 : Re > xe ? xe : Re, q = Be * Ze / xe, Ue = s - q, Te = n - q;
					Ge = "M0," + q + " L" + q + ",0 L" + n + ",0 L" + n + "," + Ue + " L" + Te + "," + s + " L0," + s + " zM0," + q + " L" + Te + "," + q + " M" + Te + "," + q + " L" + n + ",0M" + Te + "," + q + " L" + Te + "," + s, h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "bevel":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Le = A, Re = 12500 * Le;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * Le);
					var Ge, he = 5e4 * Le, xe = 1e5 * Le, Be = Math.min(n, s), Ze = Re < 0 ? 0 : Re > he ? he : Re, j = Be * Ze / xe, ne = n - j, ae = s - j;
					Ge = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " z M" + j + "," + j + " L" + ne + "," + j + " L" + ne + "," + ae + " L" + j + "," + ae + " z M0,0 L" + j + "," + j + " M0," + s + " L" + j + "," + ae + " M" + n + ",0 L" + ne + "," + j + " M" + n + "," + s + " L" + ne + "," + ae, h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "foldedCorner":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Le = A, Re = 16667 * Le;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * Le);
					var Ge, he = 5e4 * Le, xe = 1e5 * Le, Be = Math.min(n, s), Ze = Re < 0 ? 0 : Re > he ? he : Re, it = Be * Ze / xe, je = it / 5, j = n - it, ne = j + je, ae = s - it, q = ae + je;
					Ge = "M" + j + "," + s + " L" + ne + "," + q + " L" + n + "," + ae + " L" + j + "," + s + " L0," + s + " L0,0 L" + n + ",0 L" + n + "," + ae, h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "cloud":
				case "cloudCallout":
					var Vl = n * 3900 / 43200, j = n * 4693 / 43200, ne = n * 6928 / 43200, me = n * 16478 / 43200, Te = n * 28827 / 43200, st = n * 34129 / 43200, vt = n * 41798 / 43200, jt = n * 38324 / 43200, Xt = n * 29078 / 43200, fa = n * 22141 / 43200, ai = n * 14e3 / 43200, Nr = n * 4127 / 43200, Kl = s * 14370 / 43200, q = s * 26177 / 43200, ae = s * 34899 / 43200, le = s * 39090 / 43200, Ue = s * 34751 / 43200, ct = s * 22954 / 43200, At = s * 15354 / 43200, ta = s * 5426 / 43200, Ha = s * 3952 / 43200, Vi = s * 4720 / 43200, pn = s * 5192 / 43200, Hs = s * 15789 / 43200, J1, Y1, $1, q1, Lc, lh, Xo, hh, Ho, Ql = n * 6753 / 43200, eg = s * 9190 / 43200, Fc = n * 5333 / 43200, tg = s * 7267 / 43200, ag = n * 4365 / 43200, Wc = s * 5945 / 43200, ig = n * 4857 / 43200, ng = s * 6595 / 43200, rg = s * 7273 / 43200, sg = n * 6775 / 43200, dg = s * 9220 / 43200, og = n * 5785 / 43200, cg = s * 7867 / 43200, hg = n * 6752 / 43200, lg = s * 9215 / 43200, gg = n * 7720 / 43200, fg = s * 10543 / 43200, pg = n * 4360 / 43200, ug = s * 5918 / 43200, bg = n * 4345 / 43200, Cc = -11429249 / 6e4, iu = 7426832 / 6e4, Sc = -8646143 / 6e4, nu = 5396714 / 6e4, Ac = -8748475 / 6e4, ru = 5983381 / 6e4, Mc = -7859164 / 6e4, su = 7034504 / 6e4, Bc = -4722533 / 6e4, du = 6541615 / 6e4, Ec = -2776035 / 6e4, ou = 7816140 / 6e4, Ic = 37501 / 6e4, cu = 6842e3 / 6e4, Pc = 1347096 / 6e4, hu = 6910353 / 6e4, zc = 3974558 / 6e4, lu = 4542661 / 6e4, Rc = -16496525 / 6e4, gu = 8804134 / 6e4, Oc = -14809710 / 6e4, fu = 9151131 / 6e4, pu = Vl - Ql * Math.cos(Cc * Math.PI / 180), Sn, Zr, jc, vo, mg, xg, vg, yg, Dg, Ug, uu = Kl - eg * Math.sin(Cc * Math.PI / 180), kr, Hr, Gc, Nc, _g, wg, kg, Tg, Lg, Fg, V1 = ye(pu, uu, Ql, eg, Cc, Cc + iu, !1).replace("M", "L"), Hc, Zc, Xc, Jc, Yc, $c, qc, Vc, Kc, Wg, Cg = V1.substr(V1.lastIndexOf("L") + 1).split(" "), K1, Q1, eh, th, ah, ih, nh, rh, sh;
					Sn = parseInt(Cg[0]) - Fc * Math.cos(Sc * Math.PI / 180), kr = parseInt(Cg[1]) - tg * Math.sin(Sc * Math.PI / 180), Hc = ye(Sn, kr, Fc, tg, Sc, Sc + nu, !1).replace("M", "L"), K1 = Hc.substr(Hc.lastIndexOf("L") + 1).split(" "), Zr = parseInt(K1[0]) - ag * Math.cos(Ac * Math.PI / 180), Hr = parseInt(K1[1]) - Wc * Math.sin(Ac * Math.PI / 180), Zc = ye(Zr, Hr, ag, Wc, Ac, Ac + ru, !1).replace("M", "L"), Q1 = Zc.substr(Zc.lastIndexOf("L") + 1).split(" "), jc = parseInt(Q1[0]) - ig * Math.cos(Mc * Math.PI / 180), Gc = parseInt(Q1[1]) - ng * Math.sin(Mc * Math.PI / 180), Xc = ye(jc, Gc, ig, ng, Mc, Mc + su, !1).replace("M", "L"), eh = Xc.substr(Xc.lastIndexOf("L") + 1).split(" "), vo = parseInt(eh[0]) - Fc * Math.cos(Bc * Math.PI / 180), Nc = parseInt(eh[1]) - rg * Math.sin(Bc * Math.PI / 180), Jc = ye(vo, Nc, Fc, rg, Bc, Bc + du, !1).replace("M", "L"), th = Jc.substr(Jc.lastIndexOf("L") + 1).split(" "), mg = parseInt(th[0]) - sg * Math.cos(Ec * Math.PI / 180), _g = parseInt(th[1]) - dg * Math.sin(Ec * Math.PI / 180), Yc = ye(mg, _g, sg, dg, Ec, Ec + ou, !1).replace("M", "L"), ah = Yc.substr(Yc.lastIndexOf("L") + 1).split(" "), xg = parseInt(ah[0]) - og * Math.cos(Ic * Math.PI / 180), wg = parseInt(ah[1]) - cg * Math.sin(Ic * Math.PI / 180), $c = ye(xg, wg, og, cg, Ic, Ic + cu, !1).replace("M", "L"), ih = $c.substr($c.lastIndexOf("L") + 1).split(" "), vg = parseInt(ih[0]) - hg * Math.cos(Pc * Math.PI / 180), kg = parseInt(ih[1]) - lg * Math.sin(Pc * Math.PI / 180), qc = ye(vg, kg, hg, lg, Pc, Pc + hu, !1).replace("M", "L"), nh = qc.substr(qc.lastIndexOf("L") + 1).split(" "), yg = parseInt(nh[0]) - gg * Math.cos(zc * Math.PI / 180), Tg = parseInt(nh[1]) - fg * Math.sin(zc * Math.PI / 180), Vc = ye(yg, Tg, gg, fg, zc, zc + lu, !1).replace("M", "L"), rh = Vc.substr(Vc.lastIndexOf("L") + 1).split(" "), Dg = parseInt(rh[0]) - pg * Math.cos(Rc * Math.PI / 180), Lg = parseInt(rh[1]) - ug * Math.sin(Rc * Math.PI / 180), Kc = ye(Dg, Lg, pg, ug, Rc, Rc + gu, !1).replace("M", "L"), sh = Kc.substr(Kc.lastIndexOf("L") + 1).split(" "), Ug = parseInt(sh[0]) - bg * Math.cos(Oc * Math.PI / 180), Fg = parseInt(sh[1]) - Wc * Math.sin(Oc * Math.PI / 180), Wg = ye(Ug, Fg, bg, Wc, Oc, Oc + fu, !1).replace("M", "L");
					var Sg = "M" + Vl + "," + Kl + V1 + Hc + Zc + Xc + Jc + Yc + $c + qc + Vc + Kc + Wg + " z";
					if (b == "cloudCallout") {
						var O = x(e, [
							"p:spPr",
							"a:prstGeom",
							"a:avLst",
							"a:gd"
						]), Le = A, Me, te = -20833 * Le, Ie, de = 62500 * Le;
						if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
							var ue = x(O[Z], ["attrs", "name"]);
							ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * Le) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * Le);
						}
						var Ge, xe = 1e5 * Le, Be = Math.min(n, s), nt = n / 2, Ke = s / 2, ka = n * te / xe, La = s * de / xe, ci = nt + ka, hi = Ke + La, Ag = Ke * Math.cos(Math.atan(La / ka)), Mg = nt * Math.sin(Math.atan(La / ka)), ms = nt * Math.cos(Math.atan(Mg / Ag)), X1 = Ke * Math.sin(Math.atan(Mg / Ag)), Tc, xo, xs, jr, Ur, Ft, la, _t, na, ot, Da, Wa, Pa, Ta, Ii, fe, ge, gt, zt, qe, va, Ga, ea, Bg, dh, oh;
						te >= 0 ? (Tc = nt + ms, xo = Ke + X1) : (Tc = nt - ms, xo = Ke - X1), xs = Tc - ci, jr = xo - hi, Ur = Math.sqrt(xs * xs + jr * jr), Ft = Be * 6600 / 21600, la = Ur - Ft, _t = la / 3, na = Be * 1800 / 21600, ot = _t + na, Da = ot * xs / Ur, Wa = ot * jr / Ur, Pa = Da + ci, Ta = Wa + hi, Ii = Be * 4800 / 21600, fe = _t * 2, ge = Ii + fe, gt = ge * xs / Ur, zt = ge * jr / Ur, qe = gt + ci, va = zt + hi, Ga = Be * 1200 / 21600, ea = Be * 600 / 21600, Bg = ci + ea, dh = Pa + Ga, oh = qe + na, Ge = ye(Bg - ea, hi, ea, ea, 0, 360, !1) + " z M" + dh + "," + Ta + ye(dh - Ga, Ta, Ga, Ga, 0, 360, !1).replace("M", "L") + " z M" + oh + "," + va + ye(oh - na, va, na, na, 0, 360, !1).replace("M", "L") + " z", Sg += Ge;
					}
					h += "<path d='" + Sg + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "smileyFace":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Le = A, Re = 4653 * Le;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * Le);
					var Ge, he = 5e4 * Le, xe = 1e5 * Le, Mt = 4653 * Le, Be = Math.min(n, s), Ze, j, ne, me, Te, q, le, it, ae, Ue, sa, ct, aa, ut, nt = n / 2, Ke = s / 2;
					Ze = Re < -Mt ? -Mt : Re > Mt ? Mt : Re, j = n * 4969 / 21699, ne = n * 6215 / 21600, me = n * 13135 / 21600, Te = n * 16640 / 21600, q = s * 7570 / 21600, le = s * 16515 / 21600, it = s * Ze / xe, ae = le - it, Ue = le + it, sa = s * Ze / he, ct = Ue + sa, aa = n * 1125 / 21600, ut = s * 1125 / 21600;
					var Sn = ne - aa * Math.cos(Math.PI), kr = q - ut * Math.sin(Math.PI), Zr = me - aa * Math.cos(Math.PI);
					Ge = ye(Sn, kr, aa, ut, 180, 540, !1) + ye(Zr, kr, aa, ut, 180, 540, !1) + " M" + j + "," + ae + " Q" + nt + "," + ct + " " + Te + "," + ae + " Q" + nt + "," + ct + " " + j + "," + ae + " M0," + Ke + ye(nt, Ke, nt, Ke, 180, 540, !1).replace("M", "L") + " z", h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "verticalScroll":
				case "horizontalScroll":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Le = A, Re = 12500 * Le;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * Le);
					var Ge, he = 25e3 * Le, xe = 1e5 * Le, Be = Math.min(n, s), Qt = 0, Nt = 0, mt = s, Tt = n, Ze, wa, Gt, Tr;
					if (Ze = Re < 0 ? 0 : Re > he ? he : Re, wa = Be * Ze / xe, Gt = wa / 2, Tr = wa / 4, b == "verticalScroll") {
						var me = wa + Gt, Te = wa + wa, vt = Tt - wa, jt = Tt - Gt, st = vt - Gt, le = mt - wa, Ue = mt - Gt;
						Ge = "M" + wa + "," + le + " L" + wa + "," + Gt + ye(me, Gt, Gt, Gt, 180, 270, !1).replace("M", "L") + " L" + jt + "," + Qt + ye(jt, Gt, Gt, Gt, 270, 450, !1).replace("M", "L") + " L" + vt + "," + wa + " L" + vt + "," + Ue + ye(st, Ue, Gt, Gt, 0, 90, !1).replace("M", "L") + " L" + Gt + "," + mt + ye(Gt, Ue, Gt, Gt, 90, 270, !1).replace("M", "L") + " z M" + me + "," + Qt + ye(me, Gt, Gt, Gt, 270, 450, !1).replace("M", "L") + ye(me, me / 2, Tr, Tr, 90, 270, !1).replace("M", "L") + " L" + Te + "," + Gt + " M" + vt + "," + wa + " L" + me + "," + wa + " M" + wa + "," + Ue + ye(Gt, Ue, Gt, Gt, 0, 270, !1).replace("M", "L") + ye(Gt, (Ue + le) / 2, Tr, Tr, 270, 450, !1).replace("M", "L") + " z M" + wa + "," + Ue + " L" + wa + "," + le;
					} else if (b == "horizontalScroll") {
						var le = wa + Gt, Ue = wa + wa, At = mt - wa, ta = mt - Gt, ct = At - Gt, me = Tt - wa, Te = Tt - Gt;
						Ge = "M" + Nt + "," + le + ye(Gt, le, Gt, Gt, 180, 270, !1).replace("M", "L") + " L" + me + "," + wa + " L" + me + "," + Gt + ye(Te, Gt, Gt, Gt, 180, 360, !1).replace("M", "L") + " L" + Tt + "," + ct + ye(Te, ct, Gt, Gt, 0, 90, !1).replace("M", "L") + " L" + wa + "," + At + " L" + wa + "," + ta + ye(Gt, ta, Gt, Gt, 0, 180, !1).replace("M", "L") + " zM" + Te + "," + wa + ye(Te, Gt, Gt, Gt, 90, -180, !1).replace("M", "L") + ye((me + Te) / 2, Gt, Tr, Tr, 180, 0, !1).replace("M", "L") + " z M" + Te + "," + wa + " L" + me + "," + wa + " M" + Gt + "," + Ue + " L" + Gt + "," + le + ye(le / 2, le, Tr, Tr, 180, 360, !1).replace("M", "L") + ye(Gt, le, Gt, Gt, 0, 180, !1).replace("M", "L") + " M" + wa + "," + le + " L" + wa + "," + At;
					}
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "wedgeEllipseCallout":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Le = A, Me, te = -20833 * Le, Ie, de = 62500 * Le;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * Le) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * Le);
					}
					var Ge, he = 1e5 * A, vs = 11 * Math.PI / 180, Be = Math.min(n, s), ka, La, ci, hi, Zs, Xs, ch, ia, en, et, je, j, q, we, it, ne, ae, Xr, dn, ua, X = s / 2, N = n / 2;
					ka = n * te / he, La = s * de / he, ci = N + ka, hi = X + La, Zs = ka * s, Xs = La * n, ch = Math.atan(Xs / Zs), ia = ch + vs, en = ch - vs, console.log("dxPos: ", ka, "dyPos: ", La), et = N * Math.cos(ia), je = X * Math.sin(ia), we = N * Math.cos(en), it = X * Math.sin(en), ka >= 0 ? (j = N + et, q = X + je, ne = N + we, ae = X + it) : (j = N - et, q = X - je, ne = N - we, ae = X - it), Ge = "M" + j + "," + q + " L" + ci + "," + hi + " L" + ne + "," + ae + ye(N, X, N, X, 0, 360, !0), h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "wedgeRectCallout":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Le = A, Me, te = -20833 * Le, Ie, de = 62500 * Le;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * Le) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * Le);
					}
					var Ge, he = 1e5 * A, ka, La, ci, hi, Cr, Wr, yo, Do, Uo, vi, _o, wo, j, ne, ko, To, q, ae, Lo, Fo, Wo, Co, Js, So, Ao, Mo, Bo, Eo, Io, Po, zo, Ro, Oo, jo, X = s / 2, N = n / 2;
					ka = n * te / he, La = s * de / he, ci = N + ka, hi = X + La, Cr = ci - N, Wr = hi - X, yo = ka * s / n, Do = Math.abs(La), Uo = Math.abs(yo), vi = Do - Uo, _o = ka > 0 ? 7 : 2, wo = ka > 0 ? 10 : 5, j = n * _o / 12, ne = n * wo / 12, ko = La > 0 ? 7 : 2, To = La > 0 ? 10 : 5, q = s * ko / 12, ae = s * To / 12, Lo = ka > 0 ? 0 : ci, Fo = vi > 0 ? 0 : Lo, Wo = La > 0 ? j : ci, Co = vi > 0 ? Wo : j, Js = ka > 0 ? ci : n, So = vi > 0 ? n : Js, Ao = La > 0 ? ci : j, Mo = vi > 0 ? Ao : j, Bo = ka > 0 ? q : hi, Eo = vi > 0 ? q : Bo, Io = La > 0 ? 0 : hi, Po = vi > 0 ? Io : 0, zo = ka > 0 ? hi : q, Ro = vi > 0 ? q : zo, Oo = La > 0 ? hi : s, jo = vi > 0 ? Oo : s, Ge = "M0,0 L" + j + ",0 L" + Co + "," + Po + " L" + ne + ",0 L" + n + ",0 L" + n + "," + q + " L" + So + "," + Ro + " L" + n + "," + ae + " L" + n + "," + s + " L" + ne + "," + s + " L" + Mo + "," + jo + " L" + j + "," + s + " L0," + s + " L0," + ae + " L" + Fo + "," + Eo + " L0," + q + " z", h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "wedgeRoundRectCallout":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Le = A, Me, te = -20833 * Le, Ie, de = 62500 * Le, xt, Ae = 16667 * Le;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * Le) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * Le) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * Le);
					}
					var Ge, he = 1e5 * A, Be = Math.min(n, s), ka, La, ci, hi, yo, Do, Uo, vi, _o, wo, j, ne, ko, To, q, ae, Lo, Fo, Wo, Co, Js, So, Ao, Mo, Bo, Eo, Io, Po, zo, Ro, Oo, jo, Aa, on, Er, X = s / 2, N = n / 2;
					ka = n * te / he, La = s * de / he, ci = N + ka, hi = X + La, yo = ka * s / n, Do = Math.abs(La), Uo = Math.abs(yo), vi = Do - Uo, _o = ka > 0 ? 7 : 2, wo = ka > 0 ? 10 : 5, j = n * _o / 12, ne = n * wo / 12, ko = La > 0 ? 7 : 2, To = La > 0 ? 10 : 5, q = s * ko / 12, ae = s * To / 12, Lo = ka > 0 ? 0 : ci, Fo = vi > 0 ? 0 : Lo, Wo = La > 0 ? j : ci, Co = vi > 0 ? Wo : j, Js = ka > 0 ? ci : n, So = vi > 0 ? n : Js, Ao = La > 0 ? ci : j, Mo = vi > 0 ? Ao : j, Bo = ka > 0 ? q : hi, Eo = vi > 0 ? q : Bo, Io = La > 0 ? 0 : hi, Po = vi > 0 ? Io : 0, zo = ka > 0 ? hi : q, Ro = vi > 0 ? q : zo, Oo = La > 0 ? hi : s, jo = vi > 0 ? Oo : s, Aa = Be * Ae / he, on = n - Aa, Er = s - Aa, Ge = "M0," + Aa + ye(Aa, Aa, Aa, Aa, 180, 270, !1).replace("M", "L") + " L" + j + ",0 L" + Co + "," + Po + " L" + ne + ",0 L" + on + ",0" + ye(on, Aa, Aa, Aa, 270, 360, !1).replace("M", "L") + " L" + n + "," + q + " L" + So + "," + Ro + " L" + n + "," + ae + " L" + n + "," + Er + ye(on, Er, Aa, Aa, 0, 90, !1).replace("M", "L") + " L" + ne + "," + s + " L" + Mo + "," + jo + " L" + j + "," + s + " L" + Aa + "," + s + ye(Aa, Er, Aa, Aa, 90, 180, !1).replace("M", "L") + " L0," + ae + " L" + Fo + "," + Eo + " L0," + q + " z", h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
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
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Le = A, Me, te = 18750 * Le, Ie, de = -8333 * Le, xt, Ae = 18750 * Le, pa, Wt = -16667 * Le, Pn, Za = 1e5 * Le, Eg, Lr = -16667 * Le, Ig, Go = 112963 * Le, Pg, No = -8333 * Le;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * Le) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * Le) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * Le) : ue == "adj4" ? (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) * Le) : ue == "adj5" ? (Pn = x(O[Z], ["attrs", "fmla"]), Za = parseInt(Pn.substr(4)) * Le) : ue == "adj6" ? (Eg = x(O[Z], ["attrs", "fmla"]), Lr = parseInt(Eg.substr(4)) * Le) : ue == "adj7" ? (Ig = x(O[Z], ["attrs", "fmla"]), Go = parseInt(Ig.substr(4)) * Le) : ue == "adj8" && (Pg = x(O[Z], ["attrs", "fmla"]), No = parseInt(Pg.substr(4)) * Le);
					}
					var Ge, he = 1e5 * Le;
					switch (b) {
						case "borderCallout1":
						case "callout1":
							O === void 0 && (te = 18750 * Le, de = -8333 * Le, Ae = 112500 * Le, Wt = -38333 * Le);
							var q = s * te / he, j = n * de / he, ae = s * Ae / he, ne = n * Wt / he;
							Ge = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " z M" + j + "," + q + " L" + ne + "," + ae;
							break;
						case "borderCallout2":
						case "callout2":
							O === void 0 && (te = 18750 * Le, de = -8333 * Le, Ae = 18750 * Le, Wt = -16667 * Le, Za = 112500 * Le, Lr = -46667 * Le);
							var q = s * te / he, j = n * de / he, ae = s * Ae / he, ne = n * Wt / he, le = s * Za / he, me = n * Lr / he;
							Ge = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " z M" + j + "," + q + " L" + ne + "," + ae + " L" + me + "," + le + " L" + ne + "," + ae;
							break;
						case "borderCallout3":
						case "callout3":
							O === void 0 && (te = 18750 * Le, de = -8333 * Le, Ae = 18750 * Le, Wt = -16667 * Le, Za = 1e5 * Le, Lr = -16667 * Le, Go = 112963 * Le, No = -8333 * Le);
							var q = s * te / he, j = n * de / he, ae = s * Ae / he, ne = n * Wt / he, le = s * Za / he, me = n * Lr / he, Ue = s * Go / he, Te = n * No / he;
							Ge = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " z M" + j + "," + q + " L" + ne + "," + ae + " L" + me + "," + le + " L" + Te + "," + Ue + " L" + me + "," + le + " L" + ne + "," + ae;
							break;
						case "accentBorderCallout1":
						case "accentCallout1":
							O === void 0 && (te = 18750 * Le, de = -8333 * Le, Ae = 112500 * Le, Wt = -38333 * Le);
							var q = s * te / he, j = n * de / he, ae = s * Ae / he, ne = n * Wt / he;
							Ge = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " z M" + j + "," + q + " L" + ne + "," + ae + " M" + j + ",0 L" + j + "," + s;
							break;
						case "accentBorderCallout2":
						case "accentCallout2":
							O === void 0 && (te = 18750 * Le, de = -8333 * Le, Ae = 18750 * Le, Wt = -16667 * Le, Za = 112500 * Le, Lr = -46667 * Le);
							var q = s * te / he, j = n * de / he, ae = s * Ae / he, ne = n * Wt / he, le = s * Za / he, me = n * Lr / he;
							Ge = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " z M" + j + "," + q + " L" + ne + "," + ae + " L" + me + "," + le + " L" + ne + "," + ae + " M" + j + ",0 L" + j + "," + s;
							break;
						case "accentBorderCallout3":
						case "accentCallout3":
							O === void 0 && (te = 18750 * Le, de = -8333 * Le, Ae = 18750 * Le, Wt = -16667 * Le, Za = 1e5 * Le, Lr = -16667 * Le, Go = 112963 * Le, No = -8333 * Le);
							var q = s * te / he, j = n * de / he, ae = s * Ae / he, ne = n * Wt / he, le = s * Za / he, me = n * Lr / he, Ue = s * Go / he, Te = n * No / he;
							Ge = "M0,0 L" + n + ",0 L" + n + "," + s + " L0," + s + " z M" + j + "," + q + " L" + ne + "," + ae + " L" + me + "," + le + " L" + Te + "," + Ue + " L" + me + "," + le + " L" + ne + "," + ae + " M" + j + ",0 L" + j + "," + s;
							break;
					}
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftRightRibbon":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Le = A, Me, te = 5e4 * Le, Ie, de = 5e4 * Le, xt, Ae = 16667 * Le;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * Le) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * Le) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * Le);
					}
					var Ge, he = 33333 * Le, xe = 1e5 * Le, Mt = 2e5 * Le, Sa = 4e5 * Le, Be = Math.min(n, s), ht, Ut, De, zg, Et, Pe, j, Te, je, it, Ys, Ho, Qc, hh, e0, lh, Zo, Xo, ut, ne, me, q, ae, Na = n / 32, X = s / 2, N = n / 2;
					ht = Ae < 0 ? 0 : Ae > he ? he : Ae, Ut = xe - ht, De = te < 0 ? 0 : te > Ut ? Ut : te, zg = N - Na, Et = xe * zg / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, j = Be * Pe / xe, Te = n - j, je = s * De / Mt, it = s * ht / -Mt, Ys = X + it - je, Ho = X + je - it, Qc = Ys + je, hh = s - Qc, e0 = Qc * 2, lh = s - e0, Zo = e0 - Ys, Xo = s - Zo, ut = ht * Be / Sa, ne = N - Na, me = N + Na, q = Ys + ut, ae = Xo - ut, Ge = "M0," + Qc + "L" + j + ",0L" + j + "," + Ys + "L" + N + "," + Ys + ye(N, q, Na, ut, 270, 450, !1).replace("M", "L") + ye(N, ae, Na, ut, 270, 90, !1).replace("M", "L") + "L" + Te + "," + Xo + "L" + Te + "," + lh + "L" + n + "," + hh + "L" + Te + "," + s + "L" + Te + "," + Ho + "L" + N + "," + Ho + ye(N, Ho - ut, Na, ut, 90, 180, !1).replace("M", "L") + "L" + ne + "," + Zo + "L" + j + "," + Zo + "L" + j + "," + e0 + " zM" + me + "," + q + "L" + me + "," + Xo + "M" + ne + "," + ae + "L" + ne + "," + Zo, h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "ribbon":
				case "ribbon2":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 16667 * A, Ie, de = 5e4 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A);
					}
					var Ge, he = 25e3 * A, xe = 33333 * A, Mt = 75e3 * A, Sa = 1e5 * A, Zi = 2e5 * A, _i = 4e5 * A, N = n / 2, Qt = 0, Nt = 0, mt = s, Tt = n, An = n / 8, Na = n / 32, De, Pe, ai, we, ne, fa, me, Xt, st, vt, Te, jt, q, ae, Ue, le, ut, At;
					if (De = te < 0 ? 0 : te > xe ? xe : te, Pe = de < he ? he : de > Mt ? Mt : de, ai = Tt - An, we = n * Pe / Zi, ne = N - we, fa = N + we, me = ne + Na, Xt = fa - Na, st = ne + An, vt = fa - An, Te = st - Na, jt = vt + Na, ut = s * De / _i, b == "ribbon2") {
						var je = s * De / Zi, it, ta;
						q = mt - je, it = s * De / Sa, ae = mt - it, Ue = Qt + it, le = (Ue + mt) / 2, At = mt - ut, ta = q - ut, Ge = "M" + Nt + "," + mt + " L" + An + "," + le + " L" + Nt + "," + Ue + " L" + ne + "," + Ue + " L" + ne + "," + ut + ye(me, ut, Na, ut, 180, 270, !1).replace("M", "L") + " L" + Xt + "," + Qt + ye(Xt, ut, Na, ut, 270, 360, !1).replace("M", "L") + " L" + fa + "," + Ue + " L" + fa + "," + Ue + " L" + Tt + "," + Ue + " L" + ai + "," + le + " L" + Tt + "," + mt + " L" + jt + "," + mt + ye(jt, At, Na, ut, 90, 270, !1).replace("M", "L") + " L" + Xt + "," + q + ye(Xt, ta, Na, ut, 90, -90, !1).replace("M", "L") + " L" + me + "," + ae + ye(me, ta, Na, ut, 270, 90, !1).replace("M", "L") + " L" + Te + "," + q + ye(Te, At, Na, ut, 270, 450, !1).replace("M", "L") + " z M" + st + "," + ae + " L" + st + "," + At + "M" + vt + "," + At + " L" + vt + "," + ae + "M" + ne + "," + ta + " L" + ne + "," + Ue + "M" + fa + "," + Ue + " L" + fa + "," + ta;
					} else if (b == "ribbon") {
						var ct;
						q = s * De / Zi, ae = s * De / Sa, Ue = mt - ae, le = Ue / 2, ct = mt - ut, At = ae - ut, Ge = "M" + Nt + "," + Qt + " L" + Te + "," + Qt + ye(Te, ut, Na, ut, 270, 450, !1).replace("M", "L") + " L" + me + "," + q + ye(me, At, Na, ut, 270, 90, !1).replace("M", "L") + " L" + Xt + "," + ae + ye(Xt, At, Na, ut, 90, -90, !1).replace("M", "L") + " L" + jt + "," + q + ye(jt, ut, Na, ut, 90, 270, !1).replace("M", "L") + " L" + Tt + "," + Qt + " L" + ai + "," + le + " L" + Tt + "," + Ue + " L" + fa + "," + Ue + " L" + fa + "," + ct + ye(Xt, ct, Na, ut, 0, 90, !1).replace("M", "L") + " L" + me + "," + mt + ye(me, ct, Na, ut, 90, 180, !1).replace("M", "L") + " L" + ne + "," + Ue + " L" + Nt + "," + Ue + " L" + An + "," + le + " z M" + st + "," + ut + " L" + st + "," + ae + "M" + vt + "," + ae + " L" + vt + "," + ut + "M" + ne + "," + Ue + " L" + ne + "," + At + "M" + fa + "," + At + " L" + fa + "," + Ue;
					}
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "doubleWave":
				case "wave":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = b == "doubleWave" ? 6250 * A : 12500 * A, Ie, de = 0;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A);
					}
					var Ge, xe = -1e4 * A, Mt = 5e4 * A, Sa = 1e5 * A, N = n / 2, Qt = 0, Nt = 0, mt = s, Tt = n, An = n / 8, Na = n / 32;
					if (b == "doubleWave") {
						var he = 12500 * A, De = te < 0 ? 0 : te > he ? he : te, Pe = de < xe ? xe : de > Sa ? Sa : de, q = s * De / Sa, it = q * 10 / 3, ae = q - it, le = q + it, Ue = mt - q, ct = Ue - it, At = Ue + it, Fr = n * Pe / Mt, we = Fr > 0 ? 0 : Fr, ne = Nt - we, Rg = Fr > 0 ? Fr : 0, Xt = Tt - Rg, Ot = (we + Xt) / 6, me = ne + Ot, Qi = (we + Xt) / 3, Te = ne + Qi, st = (ne + Xt) / 2, vt = st + Ot, jt = (vt + Xt) / 2, fa = Nt + Rg, Os = Tt + we, ai = fa + Ot, Nr = fa + Qi, _r = (fa + Os) / 2, wr = _r + Ot, Gr = (wr + Os) / 2;
						Ge = "M" + ne + "," + q + " C" + me + "," + ae + " " + Te + "," + le + " " + st + "," + q + " C" + vt + "," + ae + " " + jt + "," + le + " " + Xt + "," + q + " L" + Os + "," + Ue + " C" + Gr + "," + At + " " + wr + "," + ct + " " + _r + "," + Ue + " C" + Nr + "," + At + " " + ai + "," + ct + " " + fa + "," + Ue + " z";
					} else if (b == "wave") {
						var Zi = 2e4 * A, De = te < 0 ? 0 : te > Zi ? Zi : te, Pe = de < xe ? xe : de > Sa ? Sa : de, q = s * De / Sa, it = q * 10 / 3, ae = q - it, le = q + it, Ue = mt - q, ct = Ue - it, At = Ue + it, Fr = n * Pe / Mt, we = Fr > 0 ? 0 : Fr, ne = Nt - we, sn = Fr > 0 ? Fr : 0, st = Tt - sn, Ot = (we + st) / 3, me = ne + Ot, Te = (me + st) / 2, vt = Nt + sn, ai = Tt + we, jt = vt + Ot, Xt = (jt + ai) / 2;
						Ge = "M" + ne + "," + q + " C" + me + "," + ae + " " + Te + "," + le + " " + st + "," + q + " L" + ai + "," + Ue + " C" + Xt + "," + At + " " + jt + "," + ct + " " + vt + "," + Ue + " z";
					}
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "ellipseRibbon":
				case "ellipseRibbon2":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 5e4 * A, xt, Ae = 12500 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var Ge, he = 25e3 * A, Mt = 75e3 * A, Sa = 1e5 * A, Zi = 2e5 * A, N = n / 2, Qt = 0, Nt = 0, mt = s, Tt = n, An = n / 8, De, Pe, Si, Ai, pi, gh, ht, we, ne, me, Te, st, vt, je, ys, Kt, qt, $s, fh, Kt, sa, Ra, qa, yi, Ki, Ci, Jo, Gi, ph;
					if (De = te < 0 ? 0 : te > Sa ? Sa : te, Pe = de < he ? he : de > Mt ? Mt : de, Si = Sa - De, Ai = Si / 2, pi = De - Ai, gh = 0 > pi ? 0 : pi, ht = Ae < gh ? gh : Ae > De ? De : Ae, we = n * Pe / Zi, ne = N - we, me = ne + An, Te = Tt - me, st = Tt - ne, vt = Tt - An, je = s * ht / Sa, ys = 4 * je / n, Kt = me * me / n, qt = me - Kt, $s = me / 2, fh = Tt - $s, Kt = s * De / Sa, sa = Kt - je, Ra = ne * ne / n, qa = ne - Ra, yi = ys * qa, Ki = mt - Kt, Ci = je * 14 / 16, Jo = ne / 2, Gi = ys * Jo, ph = Tt - Jo, b == "ellipseRibbon") {
						var q = ys * qt, Yo = ys * $s, le = yi + sa, ji = je + sa - le, Ba = ji + je, t0 = Ba + sa, ae = (Ci + Ki) / 2, ct = yi + Ki, At = le + Ki, $o = Gi + Ki, uh = t0 + Ki, ta = q + sa, Ha;
						Kt + Kt - ta, Ha = mt - je, Ge = "M" + Nt + "," + Qt + " Q" + $s + "," + Yo + " " + me + "," + q + " L" + ne + "," + le + " Q" + N + "," + t0 + " " + st + "," + le + " L" + Te + "," + q + " Q" + fh + "," + Yo + " " + Tt + "," + Qt + " L" + vt + "," + ae + " L" + Tt + "," + Ki + " Q" + ph + "," + $o + " " + st + "," + ct + " L" + st + "," + At + " Q" + N + "," + uh + " " + ne + "," + At + " L" + ne + "," + ct + " Q" + Jo + "," + $o + " " + Nt + "," + Ki + " L" + An + "," + ae + " zM" + ne + "," + ct + " L" + ne + "," + le + "M" + st + "," + le + " L" + st + "," + ct + "M" + me + "," + q + " L" + me + "," + ta + "M" + Te + "," + ta + " L" + Te + "," + q;
					} else if (b == "ellipseRibbon2") {
						var Aa = ys * qt, q = mt - Aa, Yo = mt - ys * $s, Ra, yi, $n = yi + sa, le = mt - $n, ji = je + sa - $n, Ba = ji + je, Og = Ba + sa, t0 = mt - Og, Ki, Ci, on = (Ci + Ki) / 2, ae = mt - on, id = yi + Ki, ct = mt - id, nd = $n + Ki, At = mt - nd, $o = mt - (Gi + Ki), uh = mt - (Og + Ki), ws = Aa + sa, ta = mt - ws;
						mt - (Kt + Kt - ws), Ge = "M" + Nt + "," + mt + " L" + An + "," + ae + " L" + Nt + "," + Kt + " Q" + Jo + "," + $o + " " + ne + "," + ct + " L" + ne + "," + At + " Q" + N + "," + uh + " " + st + "," + At + " L" + st + "," + ct + " Q" + ph + "," + $o + " " + Tt + "," + Kt + " L" + vt + "," + ae + " L" + Tt + "," + mt + " Q" + fh + "," + Yo + " " + Te + "," + q + " L" + st + "," + le + " Q" + N + "," + t0 + " " + ne + "," + le + " L" + me + "," + q + " Q" + $s + "," + Yo + " " + Nt + "," + mt + " zM" + ne + "," + le + " L" + ne + "," + ct + "M" + st + "," + ct + " L" + st + "," + le + "M" + me + "," + ta + " L" + me + "," + q + "M" + Te + "," + q + " L" + Te + "," + ta;
					}
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "line":
				case "straightConnector1":
				case "bentConnector4":
				case "bentConnector5":
				case "curvedConnector2":
				case "curvedConnector3":
				case "curvedConnector4":
				case "curvedConnector5":
					var bu = fl(x(m, [
						"a:ext",
						"attrs",
						"cx"
					]), "x", g, n), mu = fl(x(m, [
						"a:ext",
						"attrs",
						"cy"
					]), "y", g, s);
					h += "<line x1='0' y1='0' x2='" + bu + "' y2='" + mu + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' ", Dt !== void 0 && (Dt.type === "triangle" || Dt.type === "arrow") && (h += "marker-start='url(#markerTriangle_" + c + ")' "), Lt !== void 0 && (Lt.type === "triangle" || Lt.type === "arrow") && (h += "marker-end='url(#markerTriangle_" + c + ")' "), h += "/>";
					break;
				case "rightArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = .25, Ie, pt = .5, Bn = n / s;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						if (ue == "adj1") Me = x(O[Z], ["attrs", "fmla"]), ft = .5 - parseInt(Me.substr(4)) / 2e5;
						else if (ue == "adj2") {
							Ie = x(O[Z], ["attrs", "fmla"]);
							var Mn = parseInt(Ie.substr(4)) / 1e5;
							pt = 1 - Mn / Bn;
						}
					}
					h += " <polygon points='" + n + " " + s / 2 + "," + pt * n + " 0," + pt * n + " " + ft * s + ",0 " + ft * s + ",0 " + (1 - ft) * s + "," + pt * n + " " + (1 - ft) * s + ", " + pt * n + " " + s + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = .25, Ie, pt = .5, Bn = n / s;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						if (ue == "adj1") Me = x(O[Z], ["attrs", "fmla"]), ft = .5 - parseInt(Me.substr(4)) / 2e5;
						else if (ue == "adj2") {
							Ie = x(O[Z], ["attrs", "fmla"]);
							var Mn = parseInt(Ie.substr(4)) / 1e5;
							pt = Mn / Bn;
						}
					}
					h += " <polygon points='0 " + s / 2 + "," + pt * n + " " + s + "," + pt * n + " " + (1 - ft) * s + "," + n + " " + (1 - ft) * s + "," + n + " " + ft * s + "," + pt * n + " " + ft * s + ", " + pt * n + " 0' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "downArrow":
				case "flowChartOffpageConnector":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = .25, Ie, pt = .5, Bn = s / n;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						if (ue == "adj1") Me = x(O[Z], ["attrs", "fmla"]), ft = parseInt(Me.substr(4)) / 2e5;
						else if (ue == "adj2") {
							Ie = x(O[Z], ["attrs", "fmla"]);
							var Mn = parseInt(Ie.substr(4)) / 1e5;
							pt = Mn / Bn;
						}
					}
					b == "flowChartOffpageConnector" && (ft = .5, pt = .212), h += " <polygon points='" + (.5 - ft) * n + " 0," + (.5 - ft) * n + " " + (1 - pt) * s + ",0 " + (1 - pt) * s + "," + n / 2 + " " + s + "," + n + " " + (1 - pt) * s + "," + (.5 + ft) * n + " " + (1 - pt) * s + ", " + (.5 + ft) * n + " 0' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "upArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = .25, Ie, pt = .5, Bn = s / n;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						if (ue == "adj1") Me = x(O[Z], ["attrs", "fmla"]), ft = parseInt(Me.substr(4)) / 2e5;
						else if (ue == "adj2") {
							Ie = x(O[Z], ["attrs", "fmla"]);
							var Mn = parseInt(Ie.substr(4)) / 1e5;
							pt = Mn / Bn;
						}
					}
					h += " <polygon points='" + n / 2 + " 0,0 " + pt * s + "," + (.5 - ft) * n + " " + pt * s + "," + (.5 - ft) * n + " " + s + "," + (.5 + ft) * n + " " + s + "," + (.5 + ft) * n + " " + pt * s + ", " + n + " " + pt * s + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftRightArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = .25, Ie, pt = .25, Bn = n / s;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						if (ue == "adj1") Me = x(O[Z], ["attrs", "fmla"]), ft = .5 - parseInt(Me.substr(4)) / 2e5;
						else if (ue == "adj2") {
							Ie = x(O[Z], ["attrs", "fmla"]);
							var Mn = parseInt(Ie.substr(4)) / 1e5;
							pt = Mn / Bn;
						}
					}
					h += " <polygon points='0 " + s / 2 + "," + pt * n + " " + s + "," + pt * n + " " + (1 - ft) * s + "," + (1 - pt) * n + " " + (1 - ft) * s + "," + (1 - pt) * n + " " + s + "," + n + " " + s / 2 + ", " + (1 - pt) * n + " 0," + (1 - pt) * n + " " + ft * s + "," + pt * n + " " + ft * s + "," + pt * n + " 0' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "upDownArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, ft = .25, Ie, pt = .25, Bn = s / n;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						if (ue == "adj1") Me = x(O[Z], ["attrs", "fmla"]), ft = .5 - parseInt(Me.substr(4)) / 2e5;
						else if (ue == "adj2") {
							Ie = x(O[Z], ["attrs", "fmla"]);
							var Mn = parseInt(Ie.substr(4)) / 1e5;
							pt = Mn / Bn;
						}
					}
					h += " <polygon points='" + n / 2 + " 0,0 " + pt * s + "," + ft * n + " " + pt * s + "," + ft * n + " " + (1 - pt) * s + ",0 " + (1 - pt) * s + "," + n / 2 + " " + s + ", " + n + " " + (1 - pt) * s + "," + (1 - ft) * n + " " + (1 - pt) * s + "," + (1 - ft) * n + " " + pt * s + "," + n + " " + pt * s + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "quadArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 22500 * A, Ie, de = 22500 * A, xt, Ae = 22500 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, De, Pe, ht, Kt, j, ne, we, me, Ot, Te, st, vt, ae, le, Ue, ct, At, Ut, St, yt = Math.min(n, s);
					de < 0 ? Pe = 0 : de > he ? Pe = he : Pe = de, Ut = 2 * Pe, te < 0 ? De = 0 : te > Ut ? De = Ut : De = te, Kt = xe - Ut, St = Kt / 2, Ae < 0 ? ht = 0 : Ae > St ? ht = St : ht = Ae, j = yt * ht / xe, we = yt * Pe / xe, ne = N - we, st = N + we, Ot = yt * De / Mt, me = N - Ot, Te = N + Ot, vt = n - j, ae = X - we, ct = X + we, le = X - Ot, Ue = X + Ot, At = s - j;
					var Ge = "M0," + X + " L" + j + "," + ae + " L" + j + "," + le + " L" + me + "," + le + " L" + me + "," + j + " L" + ne + "," + j + " L" + N + ",0 L" + st + "," + j + " L" + Te + "," + j + " L" + Te + "," + le + " L" + vt + "," + le + " L" + vt + "," + ae + " L" + n + "," + X + " L" + vt + "," + ct + " L" + vt + "," + Ue + " L" + Te + "," + Ue + " L" + Te + "," + At + " L" + st + "," + At + " L" + N + "," + s + " L" + ne + "," + At + " L" + me + "," + At + " L" + me + "," + Ue + " L" + j + "," + Ue + " L" + j + "," + ct + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftRightUpArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, De, Pe, ht, Kt, j, ne, we, me, Ot, Te, st, vt, ae, it, le, Ue, ct, Ut, St, yt = Math.min(n, s);
					de < 0 ? Pe = 0 : de > he ? Pe = he : Pe = de, Ut = 2 * Pe, te < 0 ? De = 0 : te > Ut ? De = Ut : De = te, Kt = xe - Ut, St = Kt / 2, Ae < 0 ? ht = 0 : Ae > St ? ht = St : ht = Ae, j = yt * ht / xe, we = yt * Pe / xe, ne = N - we, st = N + we, Ot = yt * De / Mt, me = N - Ot, Te = N + Ot, vt = n - j, it = yt * Pe / he, ae = s - it, Ue = s - we, le = Ue - Ot, ct = Ue + Ot;
					var Ge = "M0," + Ue + " L" + j + "," + ae + " L" + j + "," + le + " L" + me + "," + le + " L" + me + "," + j + " L" + ne + "," + j + " L" + N + ",0 L" + st + "," + j + " L" + Te + "," + j + " L" + Te + "," + le + " L" + vt + "," + le + " L" + vt + "," + ae + " L" + n + "," + Ue + " L" + vt + "," + s + " L" + vt + "," + ct + " L" + j + "," + ct + " L" + j + "," + s + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftUpArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, De, Pe, ht, j, ne, Qi, Ot, me, Te, st, ae, le, Ue, ct, Ut, St, yt = Math.min(n, s);
					de < 0 ? Pe = 0 : de > he ? Pe = he : Pe = de, Ut = 2 * Pe, te < 0 ? De = 0 : te > Ut ? De = Ut : De = te, St = xe - Ut, Ae < 0 ? ht = 0 : Ae > St ? ht = St : ht = Ae, j = yt * ht / xe, we = yt * Pe / he, ne = n - we, ae = s - we, Qi = yt * Pe / xe, Te = n - Qi, Ue = s - Qi, Ot = yt * De / Mt, me = Te - Ot, st = Te + Ot, le = Ue - Ot, ct = Ue + Ot;
					var Ge = "M0," + Ue + " L" + j + "," + ae + " L" + j + "," + le + " L" + me + "," + le + " L" + me + "," + j + " L" + ne + "," + j + " L" + Te + ",0 L" + n + "," + j + " L" + st + "," + j + " L" + st + "," + ct + " L" + j + "," + ct + " L" + j + "," + s + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "bentUpArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, De, Pe, ht, et, j, we, ne, Ot, me, Te, q, ae, it, yt = Math.min(n, s);
					te < 0 ? De = 0 : te > he ? De = he : De = te, de < 0 ? Pe = 0 : de > he ? Pe = he : Pe = de, Ae < 0 ? ht = 0 : Ae > St ? ht = St : ht = Ae, q = yt * ht / xe, et = yt * Pe / he, j = n - et, Ot = yt * Pe / xe, me = n - Ot, we = yt * De / Mt, ne = me - we, Te = me + we, it = yt * De / xe, ae = s - it;
					var Ge = "M0," + ae + " L" + ne + "," + ae + " L" + ne + "," + q + " L" + j + "," + q + " L" + me + ",0 L" + n + "," + q + " L" + Te + "," + q + " L" + Te + "," + s + " L0," + s + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "bentArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, pa, Wt = 43750 * A, he = 5e4 * A, xe = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A) : ue == "adj4" && (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) * A);
					}
					var De, Pe, ht, Ca, me, Te, le, Ue, ct, At, Ut, Ua, yt = Math.min(n, s);
					de < 0 ? Pe = 0 : de > he ? Pe = he : Pe = de, Ut = 2 * Pe, te < 0 ? De = 0 : te > Ut ? De = Ut : De = te, Ae < 0 ? ht = 0 : Ae > he ? ht = he : ht = Ae;
					var Ct, Pi, Ri, Gn, ra, Ds, bh, qo, wi, Us, rn, Ct = yt * De / xe;
					Pi = yt * Pe / xe, Ri = Ct / 2, Gn = Pi - Ri, ra = yt * ht / xe, Ds = n - ra, bh = s - Gn, qo = Ds < bh ? Ds : bh, Ua = xe * qo / yt, Wt < 0 ? Ca = 0 : Wt > Ua ? Ca = Ua : Ca = Wt, wi = yt * Ca / xe, Us = wi - Ct, rn = Us > 0 ? Us : 0, me = Ct + rn, Te = n - ra, le = Gn + Ct, Ue = le + Gn, ct = Gn + wi, At = le + rn;
					var Ge = "M0," + s + " L0," + ct + ye(wi, ct, wi, wi, 180, 270, !1).replace("M", "L") + " L" + Te + "," + Gn + " L" + Te + ",0 L" + n + "," + Pi + " L" + Te + "," + Ue + " L" + Te + "," + le + " L" + me + "," + le + ye(me, At, rn, rn, 270, 180, !1).replace("M", "L") + " L" + Ct + "," + s + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "uturnArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, pa, Wt = 43750 * A, Pn, Za = 75e3 * A, he = 25e3 * A, xe = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A) : ue == "adj4" ? (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) * A) : ue == "adj5" && (Pn = x(O[Z], ["attrs", "fmla"]), Za = parseInt(Pn.substr(4)) * A);
					}
					var De, Pe, ht, Ca, zn, Kt, qt, Ra, me, Te, st, vt, jt, Xt, fa, Ue, ct, mh, Ut, St, Ua, yt = Math.min(n, s);
					de < 0 ? Pe = 0 : de > he ? Pe = he : Pe = de, Ut = 2 * Pe, te < 0 ? De = 0 : te > Ut ? De = Ut : De = te, qt = De * yt / s, Ra = xe - qt, St = Ra * s / yt, Ae < 0 ? ht = 0 : Ae > St ? ht = St : ht = Ae, Kt = ht + De, mh = Kt * yt / s, Za < mh ? zn = mh : Za > xe ? zn = xe : zn = Za;
					var Ct, Pi, Ri, Gn, ra, Ds, qo, wi, Us, rn, Ct = yt * De / xe;
					Pi = yt * Pe / xe, Ri = Ct / 2, Gn = Pi - Ri, ct = s * zn / xe, ra = yt * ht / xe, Ue = ct - ra, fa = n - Gn, Ds = fa / 2, qo = Ds < Ue ? Ds : Ue, Ua = xe * qo / yt, Wt < 0 ? Ca = 0 : Wt > Ua ? Ca = Ua : Ca = Wt, wi = yt * Ca / xe, Us = wi - Ct, rn = Us > 0 ? Us : 0, me = Ct + rn, Xt = n - Pi, vt = Xt - Pi, jt = vt + Gn, Te = fa - wi, st = jt - rn, (Ct + jt) / 2, (Ue + Ct) / 2;
					var Ge = "M0," + s + " L0," + wi + ye(wi, wi, wi, wi, 180, 270, !1).replace("M", "L") + " L" + Te + ",0" + ye(Te, wi, wi, wi, 270, 360, !1).replace("M", "L") + " L" + fa + "," + Ue + " L" + n + "," + Ue + " L" + Xt + "," + ct + " L" + vt + "," + Ue + " L" + jt + "," + Ue + " L" + jt + "," + me + ye(st, me, rn, rn, 0, -90, !1).replace("M", "L") + " L" + me + "," + Ct + ye(me, me, rn, rn, 270, 180, !1).replace("M", "L") + " L" + Ct + "," + s + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "stripedRightArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 5e4 * A, Ie, de = 5e4 * A, he = 1e5 * A, xe = 2e5 * A, Mt = 84375 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A);
					}
					var De, Pe, Te, st, sn, vt, a0, q, je, ae, Et, X = s / 2, yt = Math.min(n, s);
					Et = Mt * n / yt, te < 0 ? De = 0 : te > he ? De = he : De = te, de < 0 ? Pe = 0 : de > Et ? Pe = Et : Pe = de, Te = yt * 5 / 32, sn = yt * Pe / he, st = n - sn, je = s * De / xe, q = X - je, ae = X + je;
					var Ks = yt / 8, jg = yt / 16, Gg = yt / 32, Ge = "M0," + q + " L" + Gg + "," + q + " L" + Gg + "," + ae + " L0," + ae + " z M" + jg + "," + q + " L" + Ks + "," + q + " L" + Ks + "," + ae + " L" + jg + "," + ae + " z M" + Te + "," + q + " L" + st + "," + q + " L" + st + ",0 L" + n + "," + X + " L" + st + "," + s + " L" + st + "," + ae + " L" + Te + "," + ae + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "notchedRightArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 5e4 * A, Ie, de = 5e4 * A, he = 1e5 * A, xe = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A);
					}
					var De, Pe, j, ne, we, q, je, ae, Et, X = s / 2, Ke = X, yt = Math.min(n, s);
					Et = he * n / yt, te < 0 ? De = 0 : te > he ? De = he : De = te, de < 0 ? Pe = 0 : de > Et ? Pe = Et : Pe = de, we = yt * Pe / he, ne = n - we, je = s * De / xe, q = X - je, ae = X + je, j = je * we / Ke;
					var Ge = "M0," + q + " L" + ne + "," + q + " L" + ne + ",0 L" + n + "," + X + " L" + ne + "," + s + " L" + ne + "," + ae + " L0," + ae + " L" + j + "," + X + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "homePlate":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 5e4 * A, he = 1e5 * A;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var Ze, j, et, wt, X = s / 2, yt = Math.min(n, s);
					wt = he * n / yt, Re < 0 ? Ze = 0 : Re > wt ? Ze = wt : Ze = Re, et = yt * Ze / he, j = n - et;
					var Ge = "M0,0 L" + j + ",0 L" + n + "," + X + " L" + j + "," + s + " L0," + s + " z";
					h += "<path  d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "chevron":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 5e4 * A, he = 1e5 * A;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var Ze, j, et, ne, wt, X = s / 2, yt = Math.min(n, s);
					wt = he * n / yt, Re < 0 ? Ze = 0 : Re > wt ? Ze = wt : Ze = Re, j = yt * Ze / he, ne = n - j;
					var Ge = "M0,0 L" + ne + ",0 L" + n + "," + X + " L" + ne + "," + s + " L0," + s + " L" + j + "," + X + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "rightArrowCallout":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, pa, Wt = 64977 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A) : ue == "adj4" && (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) * A);
					}
					var Et, Pe, Ut, De, St, ht, qt, Ua, Ca, je, it, q, ae, le, Ue, Ot, me, ne, j, X = s / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Be = Math.min(n, s);
					Et = he * s / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, Ut = Pe * 2, De = te < 0 ? 0 : te > Ut ? Ut : te, St = xe * n / Be, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, qt = ht * Be / n, Ua = ri - qt, Ca = Wt < 0 ? 0 : Wt > Ua ? Ua : Wt, je = Be * Pe / xe, it = Be * De / Mt, q = X - je, ae = X - it, le = X + it, Ue = X + je, Ot = Be * ht / xe, me = Tt - Ot, ne = n * Ca / xe, j = ne / 2;
					var Ge = "M" + Nt + "," + Qt + " L" + ne + "," + Qt + " L" + ne + "," + ae + " L" + me + "," + ae + " L" + me + "," + q + " L" + Tt + "," + X + " L" + me + "," + Ue + " L" + me + "," + le + " L" + ne + "," + le + " L" + ne + "," + mt + " L" + Nt + "," + mt + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "downArrowCallout":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, pa, Wt = 64977 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A) : ue == "adj4" && (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) * A);
					}
					var Et, Pe, Ut, De, St, ht, qt, Ua, Ca, et, we, j, ne, me, Te, sa, le, ae, q, N = n / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Be = Math.min(n, s);
					Et = he * n / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, Ut = Pe * 2, De = te < 0 ? 0 : te > Ut ? Ut : te, St = xe * s / Be, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, qt = ht * Be / s, Ua = xe - qt, Ca = Wt < 0 ? 0 : Wt > Ua ? Ua : Wt, et = Be * Pe / xe, we = Be * De / Mt, j = N - et, ne = N - we, me = N + we, Te = N + et, sa = Be * ht / xe, le = mt - sa, ae = s * Ca / xe, q = ae / 2;
					var Ge = "M" + Nt + "," + Qt + " L" + Tt + "," + Qt + " L" + Tt + "," + ae + " L" + me + "," + ae + " L" + me + "," + le + " L" + Te + "," + le + " L" + N + "," + mt + " L" + j + "," + le + " L" + ne + "," + le + " L" + ne + "," + ae + " L" + Nt + "," + ae + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftArrowCallout":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, pa, Wt = 64977 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A) : ue == "adj4" && (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) * A);
					}
					var Et, Pe, Ut, De, St, ht, qt, Ua, Ca, je, it, q, ae, le, Ue, j, we, ne, me, X = s / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Be = Math.min(n, s);
					Et = he * s / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, Ut = Pe * 2, De = te < 0 ? 0 : te > Ut ? Ut : te, St = xe * n / Be, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, qt = ht * Be / n, Ua = xe - qt, Ca = Wt < 0 ? 0 : Wt > Ua ? Ua : Wt, je = Be * Pe / xe, it = Be * De / Mt, q = X - je, ae = X - it, le = X + it, Ue = X + je, j = Be * ht / xe, we = n * Ca / xe, ne = Tt - we, me = (ne + Tt) / 2;
					var Ge = "M" + Nt + "," + X + " L" + j + "," + q + " L" + j + "," + ae + " L" + ne + "," + ae + " L" + ne + "," + Qt + " L" + Tt + "," + Qt + " L" + Tt + "," + mt + " L" + ne + "," + mt + " L" + ne + "," + le + " L" + j + "," + le + " L" + j + "," + Ue + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "upArrowCallout":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, pa, Wt = 64977 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A) : ue == "adj4" && (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) * A);
					}
					var Et, Pe, Ut, De, St, ht, qt, Ua, Ca, et, we, j, ne, me, Te, q, it, ae, le, N = n / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Be = Math.min(n, s);
					Et = he * n / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, Ut = Pe * 2, De = te < 0 ? 0 : te > Ut ? Ut : te, St = xe * s / Be, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, qt = ht * Be / s, Ua = xe - qt, Ca = Wt < 0 ? 0 : Wt > Ua ? Ua : Wt, et = Be * Pe / xe, we = Be * De / Mt, j = N - et, ne = N - we, me = N + we, Te = N + et, q = Be * ht / xe, it = s * Ca / xe, ae = mt - it, le = (ae + mt) / 2;
					var Ge = "M" + Nt + "," + ae + " L" + ne + "," + ae + " L" + ne + "," + q + " L" + j + "," + q + " L" + N + "," + Qt + " L" + Te + "," + q + " L" + me + "," + q + " L" + me + "," + ae + " L" + Tt + "," + ae + " L" + Tt + "," + mt + " L" + Nt + "," + mt + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftRightArrowCallout":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 25e3 * A, xt, Ae = 25e3 * A, pa, Wt = 48123 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A) : ue == "adj4" && (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) * A);
					}
					var Et, Pe, Ut, De, St, ht, qt, Ua, Ca, je, it, q, ae, le, Ue, j, Te, we, ne, me, X = s / 2, N = n / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Be = Math.min(n, s);
					Et = he * s / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, Ut = Pe * 2, De = te < 0 ? 0 : te > Ut ? Ut : te, St = he * n / Be, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, qt = ht * Be / nt, Ua = xe - qt, Ca = Wt < 0 ? 0 : Wt > Ua ? Ua : Wt, je = Be * Pe / xe, it = Be * De / Mt, q = X - je, ae = X - it, le = X + it, Ue = X + je, j = Be * ht / xe, Te = Tt - j, we = n * Ca / Mt, ne = N - we, me = N + we;
					var Ge = "M" + Nt + "," + X + " L" + j + "," + q + " L" + j + "," + ae + " L" + ne + "," + ae + " L" + ne + "," + Qt + " L" + me + "," + Qt + " L" + me + "," + ae + " L" + Te + "," + ae + " L" + Te + "," + q + " L" + Tt + "," + X + " L" + Te + "," + Ue + " L" + Te + "," + le + " L" + me + "," + le + " L" + me + "," + mt + " L" + ne + "," + mt + " L" + ne + "," + le + " L" + j + "," + le + " L" + j + "," + Ue + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "quadArrowCallout":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 18515 * A, Ie, de = 18515 * A, xt, Ae = 18515 * A, pa, Wt = 48123 * A, he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A) : ue == "adj4" && (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Be = Math.min(n, s), Pe = de < 0 ? 0 : de > he ? he : de, Ut = Pe * 2, De = te < 0 ? 0 : te > Ut ? Ut : te, St = he - Pe, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, qt = ht * 2, Ua = xe - qt, Ca = Wt < De ? De : Wt > Ua ? Ua : Wt, we = Be * Pe / xe, Ot = Be * De / Mt, ra = Be * ht / xe, et = n * Ca / Mt, je = s * Ca / Mt, Xt = Tt - ra, ne = N - et, jt = N + et, me = N - we, vt = N + we, Te = N - Ot, st = N + Ot, Ha = mt - ra, ae = X - je, ta = X + je, le = X - we, At = X + we, Ue = X - Ot, ct = X + Ot, Ge = "M" + Nt + "," + X + " L" + ra + "," + le + " L" + ra + "," + Ue + " L" + ne + "," + Ue + " L" + ne + "," + ae + " L" + Te + "," + ae + " L" + Te + "," + ra + " L" + me + "," + ra + " L" + N + "," + Qt + " L" + vt + "," + ra + " L" + st + "," + ra + " L" + st + "," + ae + " L" + jt + "," + ae + " L" + jt + "," + Ue + " L" + Xt + "," + Ue + " L" + Xt + "," + le + " L" + Tt + "," + X + " L" + Xt + "," + At + " L" + Xt + "," + ct + " L" + jt + "," + ct + " L" + jt + "," + ta + " L" + st + "," + ta + " L" + st + "," + Ha + " L" + vt + "," + Ha + " L" + N + "," + mt + " L" + me + "," + Ha + " L" + Te + "," + Ha + " L" + Te + "," + ta + " L" + ne + "," + ta + " L" + ne + "," + ct + " L" + ra + "," + ct + " L" + ra + "," + At + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "curvedDownArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 5e4 * A, xt, Ae = 25e3 * A, he = 5e4 * A, xe = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, nt = n / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Ht = 270, It = 180, Zt = 90, Be = Math.min(n, s), Et = he * n / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, De = te < 0 ? 0 : te > xe ? xe : te, Ct = Be * De / xe, Xi = Be * Pe / xe, Kt = (Ct + Xi) / 4, aa = nt - Kt, Ba = aa * 2, Ci = Ba * Ba, Gi = Ct * Ct, Si = Ci - Gi, Ai = Math.sqrt(Si), za = Ai * s / Ba, St = xe * za / Be, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, ra = Be * Ae / xe, me = aa + Ct, qt = s * s, Ra = ra * ra, qa = qt - Ra, yi = Math.sqrt(qa), Cr = yi * aa / s, st = aa + Cr, jt = me + Cr, ji = Xi - Ct, En = ji / 2, Te = st - En, Xt = jt + En, Pi = Xi / 2, vt = Tt - Pi, q = mt - ra, ua = Math.atan(Cr / ra), qs, pi, li, ia, Ar, dn, Sr, xh = ua * 180 / Math.PI;
					qs = -xh, mt - za, (aa + me) / 2, pi = Ct / 2, li = Math.atan(pi / za);
					var vh = li * 180 / Math.PI;
					ia = Ht + xh, Ar = Ht - vh, dn = vh - Zt, Sr = Zt + vh;
					var Ge = "M" + vt + "," + mt + " L" + Te + "," + q + " L" + st + "," + q + ye(aa, s, aa, s, ia, ia + qs, !1).replace("M", "L") + " L" + me + "," + Qt + ye(me, s, aa, s, Ht, Ht + xh, !1).replace("M", "L") + " L" + (st + Ct) + "," + q + " L" + Xt + "," + q + " zM" + me + "," + Qt + ye(me, s, aa, s, Ar, Ar + dn, !1).replace("M", "L") + ye(aa, s, aa, s, It, It + Sr, !1).replace("M", "L");
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "curvedLeftArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 5e4 * A, xt, Ae = 25e3 * A, he = 5e4 * A, xe = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, Ke = s / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Ht = 270, It = 180, Zt = 90, Be = Math.min(n, s), Et = he * s / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, De = te < 0 ? 0 : te > Pe ? Pe : te, Ct = Be * De / xe, Xi = Be * Pe / xe, Kt = (Ct + Xi) / 4, ut = Ke - Kt, Ba = ut * 2, Ci = Ba * Ba, Gi = Ct * Ct, Si = Ci - Gi, Ai = Math.sqrt(Si), $a = Ai * n / Ba, St = xe * $a / Be, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, ra = Be * ht / xe, le = ut + Ct, qt = n * n, Ra = ra * ra, qa = qt - Ra, yi = Math.sqrt(qa), Wr = yi * ut / n, ct = ut + Wr, ta = le + Wr, ji = Xi - Ct, En = ji / 2, Ue = ct - En, Ha = ta + En, Pi = Xi / 2, At = mt - Pi, j = Nt + ra, ua = Math.atan(Wr / ra), qs = -ua, pi, li, dn, Sr, _s;
					Nt + $a, (ut + le) / 2, pi = Ct / 2, li = Math.atan(pi / $a), dn = li - ua, Sr = ua + li, _s = -li;
					var Jr = ua * 180 / Math.PI, xu = dn * 180 / Math.PI, i0;
					Sr * 180 / Math.PI, i0 = _s * 180 / Math.PI;
					var Ge = "M" + Tt + "," + le + ye(Nt, ut, n, ut, 0, -Zt, !1).replace("M", "L") + " L" + Nt + "," + Qt + ye(Nt, le, n, ut, Ht, Ht + Zt, !1).replace("M", "L") + " L" + Tt + "," + le + ye(Nt, le, n, ut, 0, Jr, !1).replace("M", "L") + " L" + j + "," + ta + " L" + j + "," + Ha + " L" + Nt + "," + At + " L" + j + "," + Ue + " L" + j + "," + ct + ye(Nt, ut, n, ut, Jr, Jr + xu, !1).replace("M", "L") + ye(Nt, ut, n, ut, 0, -Zt, !1).replace("M", "L") + ye(Nt, le, n, ut, Ht, Ht + Zt, !1).replace("M", "L");
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "curvedRightArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 5e4 * A, xt, Ae = 25e3 * A, he = 5e4 * A, xe = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, Ke = s / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Ht = 270, It = 180, Zt = 90, Be = Math.min(n, s), Et = he * s / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, De = te < 0 ? 0 : te > Pe ? Pe : te, Ct = Be * De / xe, Xi = Be * Pe / xe, Kt = (Ct + Xi) / 4, ut = Ke - Kt, Ba = ut * 2, Ci = Ba * Ba, Gi = Ct * Ct, Si = Ci - Gi, Ai = Math.sqrt(Si), $a = Ai * n / Ba, St = xe * $a / Be, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, ra = Be * ht / xe, le = ut + Ct, qt = n * n, Ra = ra * ra, qa = qt - Ra, yi = Math.sqrt(qa), Wr = yi * ut / n, ct = ut + Wr, ta = le + Wr, ji = Xi - Ct, En = ji / 2, Ue = ct - En, Ha = ta + En, Pi = Xi / 2, At = mt - Pi, j = Tt - ra, ua = Math.atan(Wr / ra), ia = Math.PI + 0 - ua, qs = -ua, pi, li, dn, Sr, _s;
					Tt - $a, (ut + le) / 2, pi = Ct / 2, li = Math.atan(pi / $a), dn = li - Math.PI / 2, Sr = Math.PI / 2 + li, _s = Math.PI - li;
					var Ng = ia * 180 / Math.PI, vu = qs * 180 / Math.PI, Jr = ua * 180 / Math.PI, n0 = dn * 180 / Math.PI, Ge = "M" + Nt + "," + ut + ye(n, ut, n, ut, It, It + vu, !1).replace("M", "L") + " L" + j + "," + ct + " L" + j + "," + Ue + " L" + Tt + "," + At + " L" + j + "," + Ha + " L" + j + "," + ta + ye(n, le, n, ut, Ng, Ng + Jr, !1).replace("M", "L") + " L" + Nt + "," + ut + ye(n, ut, n, ut, It, It + Zt, !1).replace("M", "L") + " L" + Tt + "," + Ct + ye(n, le, n, ut, Ht, Ht + n0, !1).replace("M", "L");
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "curvedUpArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 25e3 * A, Ie, de = 5e4 * A, xt, Ae = 25e3 * A, he = 5e4 * A, xe = 1e5 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * A) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, nt = n / 2, Tt = n, mt = s, Nt = 0, Qt = 0, Ht = 270, It = 180, Zt = 90, Be = Math.min(n, s), Et = he * n / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, De = te < 0 ? 0 : te > xe ? xe : te, Ct = Be * De / xe, Xi = Be * Pe / xe, Kt = (Ct + Xi) / 4, aa = nt - Kt, Ba = aa * 2, Ci = Ba * Ba, Gi = Ct * Ct, Si = Ci - Gi, Ai = Math.sqrt(Si), za = Ai * s / Ba, St = xe * za / Be, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, ra = Be * Ae / xe, me = aa + Ct, qt = s * s, Ra = ra * ra, qa = qt - Ra, yi = Math.sqrt(qa), Cr = yi * aa / s, st = aa + Cr, jt = me + Cr, ji = Xi - Ct, En = ji / 2, Te = st - En, Xt = jt + En, Pi = Xi / 2, vt = Tt - Pi, q = Qt + ra, ua = Math.atan(Cr / ra), qs = -ua, pi, li, dn, _s, Sr, Ar;
					Qt + za, (aa + me) / 2, pi = Ct / 2, li = Math.atan(pi / za), dn = li - ua, -dn, _s = Math.PI / 2 - ua, Sr = ua + li, Ar = Math.PI / 2 - li;
					var Hg = Ar * 180 / Math.PI, n0, Jr, n0 = dn * 180 / Math.PI;
					i0 = _s * 180 / Math.PI, Jr = ua * 180 / Math.PI;
					var Ge = ye(aa, 0, aa, s, Hg, Hg + n0, !1) + " L" + st + "," + q + " L" + Te + "," + q + " L" + vt + "," + Qt + " L" + Xt + "," + q + " L" + jt + "," + q + ye(me, 0, aa, s, i0, i0 + Jr, !1).replace("M", "L") + " L" + aa + "," + mt + ye(aa, 0, aa, s, Zt, It, !1).replace("M", "L") + " L" + Ct + "," + Qt + ye(me, 0, aa, s, It, Zt, !1).replace("M", "L");
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "mathDivide":
				case "mathEqual":
				case "mathMinus":
				case "mathMultiply":
				case "mathNotEqual":
				case "mathPlus":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te, Ie, de, xt, Ae;
					if (O !== void 0) if (O.constructor === Array) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4))) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4))) : ue == "adj3" && (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)));
					}
					else Me = x(O, ["attrs", "fmla"]), te = parseInt(Me.substr(4));
					var he = 5e4 * A, xe = 1e5 * A, Mt = 2e5 * A, mn, N = n / 2, X = s / 2, Ke = s / 2;
					if (b == "mathNotEqual") {
						O === void 0 ? (te = 23520 * A, de = 110 * Math.PI / 180, Ae = 11760 * A) : (te = te * A, de = de / 6e4 * Math.PI / 180, Ae = Ae * A);
						var De, Zg, r0, St, ht, je, it, et, j, Xt, ae, le, q, Ue, Vs, Nn, s0, Yr, Xg, jt, Jg, vt, Yg, st, $g, Te, qg, me, Vg, ne, Lc, q1, $1, Y1, J1, is, Kg, Qg, d0, o0, sa, bn, c0, h0, yh, Dh, Uh, _h, vs = 70 * Math.PI / 180, ef = 110 * Math.PI / 180, Sa = 73490 * A;
						De = te < 0 ? 0 : te > he ? he : te, Zg = de < vs ? vs : de > ef ? ef : de, r0 = De * 2, St = xe - r0, ht = Ae < 0 ? 0 : Ae > St ? St : Ae, je = s * De / xe, it = s * ht / Mt, et = n * Sa / Mt, j = N - et, Xt = N + et, ae = X - it, le = X + it, q = ae - je, Ue = le + je, Vs = Zg - Math.PI / 2, Nn = Ke * Math.tan(Vs), s0 = Math.sqrt(Nn * Nn + Ke * Ke), Yr = s0 * je / Ke, Xg = Yr / 2, jt = N + Nn - Xg, Jg = Nn * q / Ke, vt = jt - Jg, Yg = Nn * ae / Ke, st = jt - Yg, $g = Nn * le / Ke, Te = jt - $g, qg = Nn * Ue / Ke, me = jt - qg, Vg = Nn * 2, ne = jt - Vg, Lc = jt + Yr, q1 = vt + Yr, $1 = st + Yr, Y1 = Te + Yr, J1 = me + Yr, ne + Yr, is = je * Ke / s0, Kg = jt + is, Qg = Lc - is, d0 = Vs > 0 ? Kg : Lc, o0 = Vs > 0 ? jt : Qg, sa = je * Nn / s0, bn = -sa, c0 = Vs > 0 ? sa : 0, h0 = Vs > 0 ? 0 : bn, yh = n - d0, Dh = n - o0, Uh = s - c0, _h = s - h0, (d0 + o0) / 2, (Dh + yh) / 2, (c0 + h0) / 2, (q + ae) / 2, (le + Ue) / 2, (_h + Uh) / 2, mn = "M" + j + "," + q + " L" + vt + "," + q + " L" + o0 + "," + h0 + " L" + d0 + "," + c0 + " L" + q1 + "," + q + " L" + Xt + "," + q + " L" + Xt + "," + ae + " L" + $1 + "," + ae + " L" + Y1 + "," + le + " L" + Xt + "," + le + " L" + Xt + "," + Ue + " L" + J1 + "," + Ue + " L" + Dh + "," + _h + " L" + yh + "," + Uh + " L" + me + "," + Ue + " L" + j + "," + Ue + " L" + j + "," + le + " L" + Te + "," + le + " L" + st + "," + ae + " L" + j + "," + ae + " z";
					} else if (b == "mathDivide") {
						O === void 0 ? (te = 23520 * A, de = 5880 * A, Ae = 11760 * A) : (te = te * A, de = de * A, Ae = Ae * A);
						var De, tf, wh, kh, St, ht, af, Et, Pe, je, nf, un, et, le, Ue, Ze, ae, q, ct, j, me, ne, Sa = 1e3 * A, Zi = 36745 * A, _i = 73490 * A;
						De = te < Sa ? Sa : te > Zi ? Zi : te, tf = -De, wh = (_i + tf) / 4, kh = Zi * n / s, St = wh < kh ? wh : kh, ht = Ae < Sa ? Sa : Ae > St ? St : Ae, af = -4 * ht, Et = _i + af - De, Pe = de < 0 ? 0 : de > Et ? Et : de, je = s * De / Mt, nf = s * Pe / xe, un = s * ht / xe, et = n * _i / Mt, le = X - je, Ue = X + je, Ze = nf + un, ae = le - Ze, q = ae - un, ct = s - q, j = N - et, me = N + et, ne = N - un;
						var Zt = 90, Ht = 270, Sn = N - Math.cos(Ht * Math.PI / 180) * un, kr = q - Math.sin(Ht * Math.PI / 180) * un, Zr = N - Math.cos(Math.PI / 2) * un, Hr = ct - Math.sin(Math.PI / 2) * un;
						mn = "M" + N + "," + q + ye(Sn, kr, un, un, Ht, Ht + 360, !1).replace("M", "L") + " z M" + N + "," + ct + ye(Zr, Hr, un, un, Zt, Zt + 360, !1).replace("M", "L") + " z M" + j + "," + le + " L" + me + "," + le + " L" + me + "," + Ue + " L" + j + "," + Ue + " z";
					} else if (b == "mathEqual") {
						O === void 0 ? (te = 23520 * A, de = 11760 * A) : (te = te * A, de = de * A);
						var Zi = 36745 * A, _i = 73490 * A, De = te < 0 ? 0 : te > Zi ? Zi : te, r0 = De * 2, rf = xe - r0, Pe = de < 0 ? 0 : de > rf ? rf : de, je = s * De / xe, it = s * Pe / Mt, et = n * _i / Mt, ae = X - it, le = X + it, q = ae - je, Ue = le + je, j = N - et, ne = N + et;
						(q + ae) / 2, (le + Ue) / 2, mn = "M" + j + "," + q + " L" + ne + "," + q + " L" + ne + "," + ae + " L" + j + "," + ae + " zM" + j + "," + le + " L" + ne + "," + le + " L" + ne + "," + Ue + " L" + j + "," + Ue + " z";
					} else if (b == "mathMinus") {
						O === void 0 ? te = 23520 * A : te = te * A;
						var _i = 73490 * A, De = te < 0 ? 0 : te > xe ? xe : te, je = s * De / Mt, et = n * _i / Mt, q = X - je, ae = X + je, j = N - et, ne = N + et;
						mn = "M" + j + "," + q + " L" + ne + "," + q + " L" + ne + "," + ae + " L" + j + "," + ae + " z";
					} else if (b == "mathMultiply") {
						O === void 0 ? te = 23520 * A : te = te * A;
						var _i = 51965 * A, De, Ct, Ze, Th, Lh, Fh, Wh, sf, Ch, l0, g0, Sh, Ah, qn, Vn, Oi, Yi, df, of, On, Ko, Kn, cf, Mh, cn, hf, Qn, Yn, lf, Be = Math.min(n, s);
						De = te < 0 ? 0 : te > _i ? _i : te, Ct = Be * De / xe, Ze = Math.atan(s / n), Th = 1 * Math.sin(Ze), Lh = 1 * Math.cos(Ze), Fh = 1 * Math.tan(Ze), Wh = Math.sqrt(n * n + s * s), sf = Wh * _i / xe, Ch = Wh - sf, l0 = Lh * Ch / 2, g0 = Th * Ch / 2, Sh = Th * Ct / 2, Ah = Lh * Ct / 2, qn = l0 - Sh, Vn = g0 + Ah, Oi = l0 + Sh, Yi = g0 - Ah, df = N - Oi, of = df * Fh, On = of + Yi, Ko = n - Oi, Kn = n - qn, cf = X - Vn, Mh = cf / Fh, cn = Kn - Mh, hf = qn + Mh, Qn = s - Vn, Yn = s - Yi, lf = s - On, n - l0, s - g0, mn = "M" + qn + "," + Vn + " L" + Oi + "," + Yi + " L" + N + "," + On + " L" + Ko + "," + Yi + " L" + Kn + "," + Vn + " L" + cn + "," + X + " L" + Kn + "," + Qn + " L" + Ko + "," + Yn + " L" + N + "," + lf + " L" + Oi + "," + Yn + " L" + qn + "," + Qn + " L" + hf + "," + X + " z";
					} else if (b == "mathPlus") {
						O === void 0 ? te = 23520 * A : te = te * A;
						var _i = 73490 * A, Be = Math.min(n, s), De = te < 0 ? 0 : te > _i ? _i : te, et = n * _i / Mt, je = s * _i / Mt, we = Be * De / Mt, j = N - et, ne = N - we, me = N + we, Te = N + et, q = X - je, ae = X - we, le = X + we, Ue = X + je;
						mn = "M" + j + "," + ae + " L" + ne + "," + ae + " L" + ne + "," + q + " L" + me + "," + q + " L" + me + "," + ae + " L" + Te + "," + ae + " L" + Te + "," + le + " L" + me + "," + le + " L" + me + "," + Ue + " L" + ne + "," + Ue + " L" + ne + "," + le + " L" + j + "," + le + " z";
					}
					h += "<path d='" + mn + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "can":
				case "flowChartMagneticDisk":
				case "flowChartMagneticDrum":
					var Ee = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd",
						"attrs",
						"fmla"
					]), Re = 25e3 * A, he = 5e4 * A, xe = 2e5 * A;
					Ee !== void 0 && (Re = parseInt(Ee.substr(4)) * A);
					var Be = Math.min(n, s), wt, Ze, q, ae, le, mn;
					(b == "flowChartMagneticDisk" || b == "flowChartMagneticDrum") && (Re = 5e4 * A), wt = he * s / Be, Ze = Re < 0 ? 0 : Re > wt ? wt : Re, q = Be * Ze / xe, ae = q + q, le = s - q;
					var It = 180, nt = n / 2, In = "";
					b == "flowChartMagneticDrum" && (In = "transform='rotate(90 " + n / 2 + "," + s / 2 + ")'"), mn = ye(nt, q, nt, q, 0, It, !1) + ye(nt, q, nt, q, It, It + It, !1).replace("M", "L") + " L" + n + "," + le + ye(nt, le, nt, q, 0, It, !1).replace("M", "L") + " L0," + q, h += "<path " + In + " d='" + mn + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "swooshArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Le = A, Me, te = 25e3 * Le, Ie, de = 16667 * Le;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * Le) : ue == "adj2" && (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) * Le);
					}
					var he = 1 * Le, xe = 7e4 * Le, Mt = 75e3 * Le, Sa = 1e5 * Le, Be = Math.min(n, s), Ks = Be / 8, Bh = s / 6, De = te < he ? he : te > Mt ? Mt : te, Et = xe * n / Be, Pe = de < 0 ? 0 : de > Et ? Et : de, gf = s * De / Sa, yu = Be * Pe / Sa, Oi = n - yu, Yi = Ks, ff = Math.PI / 2 / 14, pf = Ks * Math.tan(ff), Ir = Oi - pf, et = gf * Math.tan(ff), Rn = Yi + gf, cn = Oi + et, Kn = cn + pf, cd = Rn + Ks, it = cd - 0, Du = it / 2, sa = s / 20, Ih = Du - sa, bn = Bh, Uu = Bh + bn, _u = n / 6, Mr = Bh / 2, wu = Rn + Mr, ku = n / 4, mn = "M0," + s + " Q" + _u + "," + Uu + " " + Oi + "," + Yi + " L" + Ir + ",0 L" + n + "," + Ih + " L" + Kn + "," + cd + " L" + cn + "," + Rn + " Q" + ku + "," + wu + " 0," + s + " z";
					h += "<path d='" + mn + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "circularArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 12500 * A, Ie, de = 1142319 / 6e4 * Math.PI / 180, xt, Ae = 20457681 / 6e4 * Math.PI / 180, pa, Wt = 108e5 / 6e4 * Math.PI / 180, Pn, Za = 12500 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) / 6e4 * Math.PI / 180) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) / 6e4 * Math.PI / 180) : ue == "adj4" ? (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) / 6e4 * Math.PI / 180) : ue == "adj5" && (Pn = x(O[Z], ["attrs", "fmla"]), Za = parseInt(Pn.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, Tt = n, mt = s, Nt = 0, Qt = 0, nt = n / 2, Ke = s / 2, Be = Math.min(n, s), zn, Ut, De, en, ia, Ct, zi, Ri, gi, fi, ki, Ti, Hn, Zn, Qs, ed, Xn, Jn, td, Yn, ii, Aa, on, $n, ad, id, nd, ws, f0, p0, u0, b0, m0, $r, x0, v0, qr, y0, Vr, D0, U0, _0, Eh, w0, tn, rd, sd, k0, T0, qn, Vn, dd, od, L0, F0, Kn, cd, W0, C0, hd, Qn, S0, A0, Oi, Yi, Vt, Jt, $t, Yt, Li, ld, gd, er, tr, ar, xn, fd, Kt, qt, ir, Ra, qa, yi, ji, Ba, Ci, pd, M0, ud, Gi, Si, Ai, bd, pi, md, B0, xd, vd, yd, E0, Dd, Ud, _d, wd, kd, I0, P0, Td, z0, R0, Ld, Fd, cn, Rn, nr, rr, Wd, Cd, sr, dr, Sd, O0, Er, or, j0, vn, G0, N0, Ad, H0, Md, Z0, Bd, Ed, Id, X0, Pd, J0, zd, Rd, Od, Y0, jd, Gd, Nd, Hd, Zd, $0, q0, Xd, V0, K0, Jd, Yd, Ir, On, Kr, Q0, hn, Qr, e1, ks, $d, qd, t1, a1, cr, i1, n1, r1, s1, es, d1, o1, ts, c1, ua, he = 25e3 * A, xe = 1e5 * A, Vo = 1 / 6e4 * Math.PI / 180, Br = 21599999 / 6e4 * Math.PI / 180, Ji = 2 * Math.PI;
					zn = Za < 0 ? 0 : Za > he ? he : Za, Ut = zn * 2, De = te < 0 ? 0 : te > Ut ? Ut : te, en = Ae < Vo ? Vo : Ae > Br ? Br : Ae, ia = Wt < 0 ? 0 : Wt > Br ? Br : Wt, Ct = Be * De / xe, zi = Be * zn / xe, Ri = Ct / 2, gi = nt + Ri - zi, fi = Ke + Ri - zi, ki = gi - Ct, Ti = fi - Ct, Hn = ki + Ri, Zn = Ti + Ri, Qs = Hn * Math.sin(en), ed = Zn * Math.cos(en), Xn = Hn * Math.cos(Math.atan2(Qs, ed)), Jn = Zn * Math.sin(Math.atan2(Qs, ed)), td = N + Xn, Yn = X + Jn, ii = ki < Ti ? ki : Ti, Aa = Xn * Xn, on = Jn * Jn, $n = ii * ii, ad = Aa - $n, id = on - $n, nd = ad * id / Aa, ws = nd / on, f0 = 1 - ws, p0 = Math.sqrt(f0), u0 = ad / Xn, b0 = u0 / Jn, m0 = (1 + p0) / b0, $r = Math.atan2(m0, 1), x0 = $r + Ji, v0 = $r > 0 ? $r : x0, qr = v0 - en, y0 = qr + Ji, Vr = qr > 0 ? qr : y0, D0 = Vr - It, U0 = Vr - Ji, _0 = D0 > 0 ? U0 : Vr, Eh = Math.abs(_0), w0 = de < 0 ? 0 : de > Eh ? Eh : de, tn = en + w0, rd = Hn * Math.sin(tn), sd = Zn * Math.cos(tn), k0 = Hn * Math.cos(Math.atan2(rd, sd)), T0 = Zn * Math.sin(Math.atan2(rd, sd)), qn = N + k0, Vn = X + T0, dd = gi * Math.sin(ia), od = fi * Math.cos(ia), L0 = gi * Math.cos(Math.atan2(dd, od)), F0 = fi * Math.sin(Math.atan2(dd, od)), Kn = N + L0, cd = X + F0, W0 = zi * Math.cos(tn), C0 = zi * Math.sin(tn), hd = td + W0, Qn = Yn + C0, S0 = zi * Math.cos(tn), A0 = zi * Math.sin(tn), Oi = td - S0, Yi = Yn - A0, Vt = Oi - N, Jt = Yi - X, $t = hd - N, Yt = Qn - X, Li = gi < fi ? gi : fi, ld = Vt * Li / gi, gd = Jt * Li / fi, er = $t * Li / gi, tr = Yt * Li / fi, ar = er - ld, xn = tr - gd, fd = Math.sqrt(ar * ar + xn * xn), Kt = ld * tr, qt = er * gd, ir = Kt - qt, Ra = Li * Li, qa = fd * fd, yi = Ra * qa, ji = ir * ir, Ba = yi - ji, Ci = Ba > 0 ? Ba : 0, pd = Math.sqrt(Ci), M0 = xn * -1, ud = M0 > 0 ? -1 : 1, Gi = ud * ar, Si = Gi * pd, Ai = ir * xn, bd = (Ai + Si) / qa, pi = Ai - Si, md = pi / qa, B0 = Math.abs(xn), xd = B0 * pd, vd = ir * ar / -1, yd = (vd + xd) / qa, E0 = vd - xd, Dd = E0 / qa, Ud = er - bd, _d = er - md, wd = tr - yd, kd = tr - Dd, I0 = Math.sqrt(Ud * Ud + wd * wd), P0 = Math.sqrt(_d * _d + kd * kd), Td = P0 - I0, z0 = Td > 0 ? bd : md, R0 = Td > 0 ? yd : Dd, Ld = z0 * gi / Li, Fd = R0 * fi / Li, cn = N + Ld, Rn = X + Fd, nr = Vt * ii / ki, rr = Jt * ii / Ti, Wd = $t * ii / ki, Cd = Yt * ii / Ti, sr = Wd - nr, dr = Cd - rr, Sd = Math.sqrt(sr * sr + dr * dr), O0 = nr * Cd, Er = Wd * rr, or = O0 - Er, j0 = ii * ii, vn = Sd * Sd, G0 = j0 * vn, N0 = or * or, Ad = G0 - N0, H0 = Ad > 0 ? Ad : 0, Md = Math.sqrt(H0), Z0 = ud * sr, Bd = Z0 * Md, Ed = or * dr, Id = (Ed + Bd) / vn, X0 = Ed - Bd, Pd = X0 / vn, J0 = Math.abs(dr), zd = J0 * Md, Rd = or * sr / -1, Od = (Rd + zd) / vn, Y0 = Rd - zd, jd = Y0 / vn, Gd = nr - Id, Nd = nr - Pd, Hd = rr - Od, Zd = rr - jd, $0 = Math.sqrt(Gd * Gd + Hd * Hd), q0 = Math.sqrt(Nd * Nd + Zd * Zd), Xd = q0 - $0, V0 = Xd > 0 ? Id : Pd, K0 = Xd > 0 ? Od : jd, Jd = V0 * ki / ii, Yd = K0 * Ti / ii, Ir = N + Jd, On = X + Yd, Kr = Math.atan2(Yd, Jd), Q0 = Kr + Ji, hn = Kr > 0 ? Kr : Q0, Qr = ia - hn, e1 = Qr - Ji, ks = Qr > 0 ? e1 : Qr, $d = cn - Ir, qd = Rn - On, t1 = Math.sqrt($d * $d + qd * qd), a1 = t1 / 2, cr = a1 - zi, i1 = cr > 0 ? cn : hd, n1 = cr > 0 ? Rn : Qn, r1 = cr > 0 ? Ir : Oi, s1 = cr > 0 ? On : Yi, es = Math.atan2(Fd, Ld), d1 = es + Ji, o1 = es > 0 ? es : d1, ts = o1 - ia, c1 = ts + Ji, ua = ts > 0 ? ts : c1;
					var h1 = ia * 180 / Math.PI, jn = h1 + ua * 180 / Math.PI, Qo = hn * 180 / Math.PI, Ph = ks * 180 / Math.PI, zh = Qo + Ph, Ge = ye(n / 2, s / 2, gi, fi, h1, jn, !1) + " L" + i1 + "," + n1 + " L" + qn + "," + Vn + " L" + r1 + "," + s1 + " L" + Ir + "," + On + ye(n / 2, s / 2, ki, Ti, Qo, zh, !1).replace("M", "L") + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
					break;
				case "leftCircularArrow":
					var O = x(e, [
						"p:spPr",
						"a:prstGeom",
						"a:avLst",
						"a:gd"
					]), Me, te = 12500 * A, Ie, de = -1142319 / 6e4 * Math.PI / 180, xt, Ae = 1142319 / 6e4 * Math.PI / 180, pa, Wt = 108e5 / 6e4 * Math.PI / 180, Pn, Za = 12500 * A;
					if (O !== void 0) for (var Z = 0; Z < O.length; Z++) {
						var ue = x(O[Z], ["attrs", "name"]);
						ue == "adj1" ? (Me = x(O[Z], ["attrs", "fmla"]), te = parseInt(Me.substr(4)) * A) : ue == "adj2" ? (Ie = x(O[Z], ["attrs", "fmla"]), de = parseInt(Ie.substr(4)) / 6e4 * Math.PI / 180) : ue == "adj3" ? (xt = x(O[Z], ["attrs", "fmla"]), Ae = parseInt(xt.substr(4)) / 6e4 * Math.PI / 180) : ue == "adj4" ? (pa = x(O[Z], ["attrs", "fmla"]), Wt = parseInt(pa.substr(4)) / 6e4 * Math.PI / 180) : ue == "adj5" && (Pn = x(O[Z], ["attrs", "fmla"]), Za = parseInt(Pn.substr(4)) * A);
					}
					var X = s / 2, N = n / 2, Tt = n, mt = s, Nt = 0, Qt = 0, nt = n / 2, Ke = s / 2, Be = Math.min(n, s), he = 25e3 * A, xe = 1e5 * A, Vo = 1 / 6e4 * Math.PI / 180, Br = 21599999 / 6e4 * Math.PI / 180, Ji = 2 * Math.PI, zn = Za < 0 ? 0 : Za > he ? he : Za, Ut = zn * 2, De = te < 0 ? 0 : te > Ut ? Ut : te, en = Ae < Vo ? Vo : Ae > Br ? Br : Ae, ia = Wt < 0 ? 0 : Wt > Br ? Br : Wt, Ct = Be * De / xe, zi = Be * zn / xe, Ri = Ct / 2, gi = nt + Ri - zi, fi = Ke + Ri - zi, ki = gi - Ct, Ti = fi - Ct, Hn = ki + Ri, Zn = Ti + Ri, Qs = Hn * Math.sin(en), ed = Zn * Math.cos(en), Xn = Hn * Math.cos(Math.atan2(Qs, ed)), Jn = Zn * Math.sin(Math.atan2(Qs, ed)), td = N + Xn, Yn = X + Jn, ii = ki < Ti ? ki : Ti, Aa = Xn * Xn, on = Jn * Jn, $n = ii * ii, ad = Aa - $n, id = on - $n, nd = ad * id / Aa, ws = nd / on, f0 = 1 - ws, p0 = Math.sqrt(f0), u0 = ad / Xn, b0 = u0 / Jn, m0 = (1 + p0) / b0, $r = Math.atan2(m0, 1), x0 = $r + Ji, v0 = $r > 0 ? $r : x0, qr = v0 - en, y0 = qr + Ji, Vr = qr > 0 ? qr : y0, D0 = Vr - It, U0 = Vr - Ji, _0 = D0 > 0 ? U0 : Vr, uf = Math.abs(_0) * -1, Pe = Math.abs(de) * -1, w0 = Pe < uf ? uf : Pe > 0 ? 0 : Pe, tn = en + w0, rd = Hn * Math.sin(tn), sd = Zn * Math.cos(tn), k0 = Hn * Math.cos(Math.atan2(rd, sd)), T0 = Zn * Math.sin(Math.atan2(rd, sd)), qn = N + k0, Vn = X + T0, dd = gi * Math.sin(ia), od = fi * Math.cos(ia), L0 = gi * Math.cos(Math.atan2(dd, od)), F0 = fi * Math.sin(Math.atan2(dd, od)), Kn = N + L0, cd = X + F0, bf = ki * Math.sin(ia), mf = Ti * Math.cos(ia), Tu = ki * Math.cos(Math.atan2(bf, mf)), Lu = Ti * Math.sin(Math.atan2(bf, mf)), Ko = N + Tu, Ih = X + Lu, W0 = zi * Math.cos(tn), C0 = zi * Math.sin(tn), hd = td + W0, Qn = Yn + C0, S0 = zi * Math.cos(tn), A0 = zi * Math.sin(tn), Oi = td - S0, Yi = Yn - A0, Vt = Oi - N, Jt = Yi - X, $t = hd - N, Yt = Qn - X, Li = gi < fi ? gi : fi, ld = Vt * Li / gi, gd = Jt * Li / fi, er = $t * Li / gi, tr = Yt * Li / fi, ar = er - ld, xn = tr - gd, fd = Math.sqrt(ar * ar + xn * xn), Kt = ld * tr, qt = er * gd, ir = Kt - qt, Ra = Li * Li, qa = fd * fd, yi = Ra * qa, ji = ir * ir, Ba = yi - ji, Ci = Ba > 0 ? Ba : 0, pd = Math.sqrt(Ci), M0 = xn * -1, ud = M0 > 0 ? -1 : 1, Gi = ud * ar, Si = Gi * pd, Ai = ir * xn, bd = (Ai + Si) / qa, pi = Ai - Si, md = pi / qa, B0 = Math.abs(xn), xd = B0 * pd, vd = ir * ar / -1, yd = (vd + xd) / qa, E0 = vd - xd, Dd = E0 / qa, Ud = er - bd, _d = er - md, wd = tr - yd, kd = tr - Dd, I0 = Math.sqrt(Ud * Ud + wd * wd), P0 = Math.sqrt(_d * _d + kd * kd), Td = P0 - I0, z0 = Td > 0 ? bd : md, R0 = Td > 0 ? yd : Dd, Ld = z0 * gi / Li, Fd = R0 * fi / Li, cn = N + Ld, Rn = X + Fd, nr = Vt * ii / ki, rr = Jt * ii / Ti, Wd = $t * ii / ki, Cd = Yt * ii / Ti, sr = Wd - nr, dr = Cd - rr, Sd = Math.sqrt(sr * sr + dr * dr), O0 = nr * Cd, Er = Wd * rr, or = O0 - Er, j0 = ii * ii, vn = Sd * Sd, G0 = j0 * vn, N0 = or * or, Ad = G0 - N0, H0 = Ad > 0 ? Ad : 0, Md = Math.sqrt(H0), Z0 = ud * sr, Bd = Z0 * Md, Ed = or * dr, Id = (Ed + Bd) / vn, X0 = Ed - Bd, Pd = X0 / vn, J0 = Math.abs(dr), zd = J0 * Md, Rd = or * sr / -1, Od = (Rd + zd) / vn, Y0 = Rd - zd, jd = Y0 / vn, Gd = nr - Id, Nd = nr - Pd, Hd = rr - Od, Zd = rr - jd, $0 = Math.sqrt(Gd * Gd + Hd * Hd), q0 = Math.sqrt(Nd * Nd + Zd * Zd), Xd = q0 - $0, V0 = Xd > 0 ? Id : Pd, K0 = Xd > 0 ? Od : jd, Jd = V0 * ki / ii, Yd = K0 * Ti / ii, Ir = N + Jd, On = X + Yd, Kr = Math.atan2(Yd, Jd), Q0 = Kr + Ji, xf = Kr > 0 ? Kr : Q0, Qr = ia - xf, e1 = Qr + Ji, vf = Qr > 0 ? Qr : e1, hn = xf + vf, ks = -vf, $d = cn - Ir, qd = Rn - On, t1 = Math.sqrt($d * $d + qd * qd), a1 = t1 / 2, cr = a1 - zi, i1 = cr > 0 ? cn : hd, n1 = cr > 0 ? Rn : Qn, r1 = cr > 0 ? Ir : Oi, s1 = cr > 0 ? On : Yi, es = Math.atan2(Fd, Ld), d1 = es + Ji, o1 = es > 0 ? es : d1, ts = o1 - ia, c1 = ts - Ji, ua = ts > 0 ? c1 : ts, h1 = (ia + ua) * 180 / Math.PI, jn = ia * 180 / Math.PI, Qo = hn * 180 / Math.PI, Ph = ks * 180 / Math.PI, zh = Qo + Ph, Ge = "M" + Kn + "," + cd + " L" + Ko + "," + Ih + ye(n / 2, s / 2, ki, Ti, Qo, zh, !1).replace("M", "L") + " L" + r1 + "," + s1 + " L" + qn + "," + Vn + " L" + i1 + "," + n1 + " L" + cn + "," + Rn + ye(n / 2, s / 2, gi, fi, h1, jn, !1).replace("M", "L") + " z";
					h += "<path d='" + Ge + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + W.color + "' stroke-width='" + W.width + "' stroke-dasharray='" + W.strokeDasharray + "' />";
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
					console.log(b, " -unsupported shape type.");
					break;
				default: console.warn("Undefine shape type.(" + b + ")");
			}
			h += "</svg>", h += "<div class='block " + y1(e, t, U, a) + " " + D1(e, a, o) + "' _id='" + f + "' _idx='" + l + "' _type='" + a + "' _name='" + r + "' style='" + pr(m, d, u, D, y, g) + ur(m, u, D, g) + " z-index: " + i + ";transform: rotate(" + (ee !== void 0 ? ee : 0) + "deg);'>", e["p:txBody"] !== void 0 && (v === void 0 || v === !0) && (a != "diagram" && a != "textBox" && (a = "shape"), h += await cc(e["p:txBody"], e, t, U, a, l, o, void 0, g)), h += "</div>";
		} else if (L !== void 0) {
			var Vd = x(x(L, ["a:pathLst"]), ["a:path"]);
			let ui = Vd.attrs || {};
			var Fu = Ia(ui.w, 21600), Wu = Ia(ui.h, 21600), Kd = 1 / Fu * n, Qd = 1 / Wu * s, eo = x(Vd, ["a:moveTo"]) || [];
			eo.length;
			var yf = Vd["a:lnTo"], Df = Vd["a:cubicBezTo"], Uf = Vd["a:arcTo"], _f = x(Vd, ["a:close"]);
			Array.isArray(eo) || (eo = [eo]);
			var ba = [];
			if (eo.length > 0) {
				if (gn(eo).forEach(function(xa) {
					var Xa = xa["a:pt"];
					Xa !== void 0 && gn(Xa).forEach(function(ln) {
						var $i = ln.attrs || {};
						if (!($i.x === void 0 || $i.y === void 0)) {
							var Fi = {}, ec = $i.x, tc = $i.y, to = $i.order;
							Fi.type = "movto", Fi.order = Ia(to, ba.length), Fi.x = ec, Fi.y = tc, ba.push(Fi);
						}
					});
				}), yf !== void 0 && gn(yf).forEach(function(xa) {
					var Xa = xa["a:pt"];
					Xa !== void 0 && gn(Xa).forEach(function(ln) {
						var $i = ln.attrs || {};
						if (!($i.x === void 0 || $i.y === void 0)) {
							var Fi = {}, ec = $i.x, tc = $i.y, to = $i.order;
							Fi.type = "lnto", Fi.order = Ia(to, ba.length), Fi.x = ec, Fi.y = tc, ba.push(Fi);
						}
					});
				}), Df !== void 0) {
					var wf = [];
					gn(Df).forEach(function(xa) {
						wf.push(xa["a:pt"]);
					}), wf.forEach(function(xa) {
						xa = gn(xa);
						var Xa = {};
						Xa.type = "cubicBezTo", Xa.order = Ia(x(xa[0], ["attrs", "order"]), ba.length);
						var ln = [];
						xa.forEach(function($i) {
							var Fi = $i.attrs || {};
							Fi.x !== void 0 && Fi.y !== void 0 && ln.push({
								x: Fi.x,
								y: Fi.y
							});
						}), ln.length === 3 && (Xa.cubBzPt = ln, ba.push(Xa));
					});
				}
				Uf !== void 0 && gn(Uf).forEach(function(xa) {
					var Xa = xa.attrs || {};
					if (!(Xa.hR === void 0 || Xa.wR === void 0 || Xa.stAng === void 0 || Xa.swAng === void 0)) {
						var ln = Xa.order, $i = Xa.hR, Fi = Xa.wR, ec = Xa.stAng, tc = Xa.swAng, to = 0, Ef = 0, Rh = x(xa, ["a:pt", "attrs"]);
						Rh !== void 0 && (to = Rh.x, Ef = Rh.y);
						var Pr = {};
						Pr.type = "arcTo", Pr.order = Ia(ln, ba.length), Pr.hR = $i, Pr.wR = Fi, Pr.stAng = ec, Pr.swAng = tc, Pr.shftX = to, Pr.shftY = Ef, ba.push(Pr);
					}
				}), _f !== void 0 && gn(_f).forEach(function(xa) {
					var Xa = (xa.attrs || {}).order, ln = {};
					ln.type = "close", ln.order = Ia(Xa, ba.length), ba.push(ln);
				}), ba.sort(function(xa, Xa) {
					return xa.order - Xa.order;
				});
				for (var Ea = 0, fo = !1, Xe = ""; Ea < ba.length;) {
					if (ba[Ea].type == "movto") {
						var kf = Ia(ba[Ea].x, NaN) * Kd, Tf = Ia(ba[Ea].y, NaN) * Qd;
						if (!Number.isFinite(kf) || !Number.isFinite(Tf)) {
							Ea++;
							continue;
						}
						Xe += " M" + kf + "," + Tf;
					} else if (ba[Ea].type == "lnto") {
						var Lf = Ia(ba[Ea].x, NaN) * Kd, Ff = Ia(ba[Ea].y, NaN) * Qd;
						if (!Number.isFinite(Lf) || !Number.isFinite(Ff)) {
							Ea++;
							continue;
						}
						Xe += " L" + Lf + "," + Ff;
					} else if (ba[Ea].type == "cubicBezTo") {
						var Wf = Ia(ba[Ea].cubBzPt[0].x, NaN) * Kd, Cf = Ia(ba[Ea].cubBzPt[0].y, NaN) * Qd, Sf = Ia(ba[Ea].cubBzPt[1].x, NaN) * Kd, Af = Ia(ba[Ea].cubBzPt[1].y, NaN) * Qd, Mf = Ia(ba[Ea].cubBzPt[2].x, NaN) * Kd, Bf = Ia(ba[Ea].cubBzPt[2].y, NaN) * Qd;
						if (![
							Wf,
							Cf,
							Sf,
							Af,
							Mf,
							Bf
						].every(Number.isFinite)) {
							Ea++;
							continue;
						}
						Xe += " C" + Wf + "," + Cf + " " + Sf + "," + Af + " " + Mf + "," + Bf;
					} else if (ba[Ea].type == "arcTo") {
						var ut = Ia(ba[Ea].hR, NaN) * Kd, aa = Ia(ba[Ea].wR, NaN) * Qd, ia = Ia(ba[Ea].stAng, NaN) / 6e4, ua = Ia(ba[Ea].swAng, NaN) / 6e4;
						if (![
							ut,
							aa,
							ia,
							ua
						].every(Number.isFinite)) {
							Ea++;
							continue;
						}
						var jn = ia + ua;
						Xe += ye(aa, ut, aa, ut, ia, jn, !1);
					} else ba[Ea].type == "quadBezTo" ? console.log("custShapType: quadBezTo - TODO") : ba[Ea].type == "close" && (Xe += "z");
					Ea++;
				}
				Xe && !/NaN/.test(Xe) && (h += "<path d='" + Xe + "' fill='" + (Y ? "url(#imgPtrn_" + c + ")" : C ? "url(#linGrd_" + c + ")" : I) + "' stroke='" + (W === void 0 ? "" : W.color) + "' stroke-width='" + (W === void 0 ? "" : W.width) + "' stroke-dasharray='" + (W === void 0 ? "" : W.strokeDasharray) + "' ", h += "/>");
			}
			h += "</svg>", h += "<div class='block " + y1(e, t, U, a) + " " + D1(e, a, o) + "' _id='" + f + "' _idx='" + l + "' _type='" + a + "' _name='" + r + "' style='" + pr(m, d, u, D, y, g) + ur(m, u, D, g) + " z-index: " + i + ";transform: rotate(" + (ee !== void 0 ? ee : 0) + "deg);'>", e["p:txBody"] !== void 0 && (v === void 0 || v === !0) && (a != "diagram" && a != "textBox" && (a = "shape"), h += await cc(e["p:txBody"], e, t, U, a, l, o, void 0, g)), h += "</div>";
		} else h += "<div class='block " + y1(e, t, U, a) + " " + D1(e, a, o) + "' _id='" + f + "' _idx='" + l + "' _type='" + a + "' _name='" + r + "' style='" + pr(m, d, u, D, y, g) + ur(m, u, D, g) + Un(e, d, !1, "shape", o) + await fc(e, d, !1, o, _) + " z-index: " + i + ";transform: rotate(" + (ee !== void 0 ? ee : 0) + "deg);'>", e["p:txBody"] !== void 0 && (v === void 0 || v === !0) && (h += await cc(e["p:txBody"], e, t, U, a, l, o, void 0, g)), h += "</div>";
		return h;
	}
	function ap(e, d, t, U, f) {
		var r = parseInt(U), l = parseInt(t), a = parseInt(e) / 2, i = r - l;
		i < 0 && (i = 360 + i), i = Math.min(Math.max(i, 0), 360);
		var o = Math.cos(2 * Math.PI / (360 / i)), v = Math.sin(2 * Math.PI / (360 / i)), y, _, g;
		if (f) y = i <= 180 ? 0 : 1, _ = "M" + a + "," + a + " L" + a + ",0 A" + a + "," + a + " 0 " + y + ",1 " + (a + v * a) + "," + (a - o * a) + " z", g = "rotate(" + (l - 270) + ", " + a + ", " + a + ")";
		else {
			y = i <= 180 ? 0 : 1;
			var p = a, m = d / 2;
			_ = "M" + p + ",0 A" + m + "," + p + " 0 " + y + ",1 " + (m + v * m) + "," + (p - o * p), g = "rotate(" + (l + 90) + ", " + a + ", " + a + ")";
		}
		return [_, g];
	}
	function ip(e, d, t) {
		var U = d, f = 1.5 * U, r = f;
		let l = f, a = t, i = f, o = U, v = 50, y = 35, _ = 2 * Math.PI, g = _ / (a * 2), p = g * y * .005, m = g * v * .005, u = g, D = !1;
		for (var h = " M" + (r + i * Math.cos(m)) + " " + (l + i * Math.sin(m)); u <= _ + g; u += g) D ? (h += " L" + (r + o * Math.cos(u - p)) + "," + (l + o * Math.sin(u - p)), h += " L" + (r + i * Math.cos(u + m)) + "," + (l + i * Math.sin(u + m))) : (h += " L" + (r + i * Math.cos(u - m)) + "," + (l + i * Math.sin(u - m)), h += " L" + (r + o * Math.cos(u + p)) + "," + (l + o * Math.sin(u + p))), D = !D;
		return h += " ", h;
	}
	function ye(e, d, t, U, f, r, l) {
		var a, i = f;
		if (r >= f) for (; i <= r;) {
			var o = i * (Math.PI / 180), v = e + Math.cos(o) * t, y = d + Math.sin(o) * U;
			i == f && (a = " M" + v + " " + y), a += " L" + v + " " + y, i++;
		}
		else for (; i > r;) {
			var o = i * (Math.PI / 180), v = e + Math.cos(o) * t, y = d + Math.sin(o) * U;
			i == f && (a = " M " + v + " " + y), a += " L " + v + " " + y, i--;
		}
		return a += l ? " z" : "", a;
	}
	function np(e, d, t, U, f, r) {
		var l, a, i, o;
		r == "cornr1" ? (l = 0, a = 0, i = 0, o = t) : r == "cornr2" ? (l = t, a = U, i = U, o = t) : r == "cornrAll" ? (l = t, a = t, i = t, o = t) : r == "diag" && (l = t, a = U, i = t, o = U);
		var v;
		return f == "round" ? v = "M0," + (d / 2 + (1 - a) * (d / 2)) + " Q0," + d + " " + a * (e / 2) + "," + d + " L" + (e / 2 + (1 - i) * (e / 2)) + "," + d + " Q" + e + "," + d + " " + e + "," + (d / 2 + d / 2 * (1 - i)) + "L" + e + "," + d / 2 * o + " Q" + e + ",0 " + (e / 2 + e / 2 * (1 - o)) + ",0 L" + e / 2 * l + ",0 Q0,0 0," + d / 2 * l + " z" : f == "snip" && (v = "M0," + l * (d / 2) + " L0," + (d / 2 + d / 2 * (1 - a)) + "L" + a * (e / 2) + "," + d + " L" + (e / 2 + e / 2 * (1 - i)) + "," + d + "L" + e + "," + (d / 2 + d / 2 * (1 - i)) + " L" + e + "," + o * (d / 2) + "L" + (e / 2 + e / 2 * (1 - o)) + ",0 L" + e / 2 * l + ",0 z"), v;
	}
	async function rp(e, d, t, U, f) {
		var r = "", l = !1, a = e.attrs.order, i = e["p:blipFill"]["a:blip"].attrs["r:embed"], o;
		t == "slideMasterBg" ? o = d.masterResObj : t == "slideLayoutBg" ? o = d.layoutResObj : o = d.slideResObj;
		var v = o[i].target, y = T1(v).toLowerCase(), _ = d.zip, g = await _.file(v).async("arraybuffer"), p = e["p:spPr"]["a:xfrm"];
		if (p === void 0) {
			var m = x(e, [
				"p:nvPicPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"idx"
			]);
			x(e, [
				"p:nvPicPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]), m !== void 0 && (p = x(d.slideLayoutTables, [
				"idxTable",
				m,
				"p:spPr",
				"a:xfrm"
			]));
		}
		var u = 0, D = x(e, [
			"p:spPr",
			"a:xfrm",
			"attrs",
			"rot"
		]);
		D !== void 0 && (u = Ms(D));
		var h = x(e, [
			"p:nvPicPr",
			"p:nvPr",
			"a:videoFile"
		]), c, b, L, S, R, P, M, ee = !1, V = !1, F = sc.mediaProcess;
		h !== void 0 & F && (c = h.attrs["r:link"], b = o[c].target, Vp(b) ? (b = mc(b), V = !0, ee = !0, l = !0) : (L = T1(b).toLowerCase(), (L == "mp4" || L == "webm" || L == "ogg") && (R = await _.file(b).async("arraybuffer"), S = uc(L), P = new Blob([R], { type: S }), M = URL.createObjectURL(P), ee = !0, l = !0)));
		var K = x(e, [
			"p:nvPicPr",
			"p:nvPr",
			"a:audioFile"
		]), k, Q, J, n, s, ie, ce = !1, I;
		if (K !== void 0 & F && (k = K.attrs["r:link"], Q = o[k].target, J = T1(Q).toLowerCase(), J == "mp3" || J == "wav" || J == "ogg")) {
			n = await _.file(Q).async("arraybuffer"), s = new Blob([n]), ie = URL.createObjectURL(s);
			var C = parseInt(p["a:ext"].attrs.cx) * 20, Y = p["a:ext"].attrs.cy, ve = parseInt(p["a:off"].attrs.x) / 2.5, _e = p["a:off"].attrs.y;
			I = {
				"a:ext": { attrs: {
					cx: C,
					cy: Y
				} },
				"a:off": { attrs: {
					x: ve,
					y: _e
				} }
			}, ce = !0, ee = !0, l = !0;
		}
		uc(y);
		var Ye = await bl(y, g);
		if (!Ye && (h === void 0 && K === void 0 || !F || !ee)) return "";
		var Je = Q2(e["p:blipFill"]);
		return r = "<div class='block content' style='" + pr(F && ce ? I : p, e, void 0, void 0, U, f) + ur(F && ce ? I : p, void 0, void 0, f) + " z-index: " + a + ";transform: rotate(" + u + "deg);" + (h === void 0 && K === void 0 || !F || !ee ? Je.container : "") + "'>", h === void 0 && K === void 0 || !F || !ee ? r += "<img src='" + Ye + "' style='" + Je.image + ep(e["p:blipFill"]) + "'/>" : (h !== void 0 || K !== void 0) && F && ee && (h !== void 0 && !V ? r += "<video  src='" + M + "' controls style='width: 100%; height: 100%'>Your browser does not support the video tag.</video>" : h !== void 0 && V && (r += "<iframe   src='" + b + "' controls style='width: 100%; height: 100%'></iframe >"), K !== void 0 && (r += "<audio id=\"audio_player\" controls ><source src=\"" + ie + "\"></audio>")), !ee && l && (r += "<span style='color:red;font-size:40px;position: absolute;'>This media file Not supported by HTML5</span>"), (h !== void 0 || K !== void 0) && !F && ee && console.log("Founded supported media file but media process disabled (mediaProcess=false)"), r += "</div>", r;
	}
	async function sp(e, d, t, U, f) {
		var r = "";
		switch (x(e, [
			"a:graphic",
			"a:graphicData",
			"attrs",
			"uri"
		])) {
			case "http://schemas.openxmlformats.org/drawingml/2006/table":
				r = await gp(e, d, f);
				break;
			case "http://schemas.openxmlformats.org/drawingml/2006/chart":
				r = await fp(e, d, f);
				break;
			case "http://schemas.openxmlformats.org/drawingml/2006/diagram":
				r = await pp(e, d, t, U, f);
				break;
			case "http://schemas.openxmlformats.org/presentationml/2006/ole":
				var l = x(e, [
					"a:graphic",
					"a:graphicData",
					"mc:AlternateContent",
					"mc:Fallback",
					"p:oleObj"
				]);
				l === void 0 && (l = x(e, [
					"a:graphic",
					"a:graphicData",
					"p:oleObj"
				])), l !== void 0 && (r = await v1(l, d, t, f));
				break;
			default:
		}
		return r;
	}
	var oc = !1;
	async function cc(e, d, t, U, f, r, l, a, i) {
		var o = "";
		if (l.slideMasterTextStyles, e === void 0) return o;
		var v = x(d, ["p:style", "a:fontRef"]), y = e["a:p"];
		y.constructor !== Array && (y = [y]);
		for (var _ = 0; _ < y.length; _++) {
			var g = y[_], p = g["a:r"], m = g["a:fld"], u = g["a:br"];
			p !== void 0 && (p = p.constructor === Array ? p : [p]), p !== void 0 && m !== void 0 && (m = m.constructor === Array ? m : [m], p = p.concat(m)), p !== void 0 && u !== void 0 && (oc = !0, u = u.constructor === Array ? u : [u], u.forEach(function(ve, _e) {
				ve.type = "br";
			}), u.length > 1 && u.shift(), p = p.concat(u), p.sort(function(ve, _e) {
				return ve.attrs.order - _e.attrs.order;
			}));
			var D = "", h = up(g, e, f, r, l);
			h != "" && (D = h), (f == "body" || f == "obj" || f == "shape") && (D += "font-size: 0px;", D += "font-weight: 100;", D += "font-style: normal;");
			var c = "";
			D in Va ? c = Va[D].name : (c = "_css_" + (Object.keys(Va).length + 1), Va[D] = {
				name: c,
				text: D
			});
			var b = x(d, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cx"
			]);
			b === void 0 && (b = x(t, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cx"
			])), b === void 0 && (b = x(U, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cx"
			]));
			var L = x(d, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cy"
			]);
			L === void 0 && (L = x(t, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cy"
			])), L === void 0 && (L = x(U, [
				"p:spPr",
				"a:xfrm",
				"a:ext",
				"attrs",
				"cy"
			]));
			var S = b !== void 0 ? gr(b, "x", i) : NaN, R = L !== void 0 ? gr(L, "y", i) : NaN, P = Number.isFinite(S) ? "width:" + S + "px;" : "width:inherit;", M = Number.isFinite(R) ? "height:" + R + "px;" : "", ee = mp(g, e, r, f, l);
			o += "<div style='display: flex;" + P + M + "' class='slide-prgrph " + bp(g, e, r, f, ee, l) + " " + ee + " " + c + "' >";
			var V = await dp(g, _, d, e, v, r, f, l), F = V[0] !== void 0 && V[0] !== null && V[0] != "", K = V[1] !== void 0 && V[1] !== null && F ? V[1] + V[2] : 0;
			o += V[0] !== void 0 ? V[0] : "";
			var k = hp(g, r, f, F, l), Q = k[0], J = k[1];
			b === void 0 && a !== void 0 && a != 0 && (b = a);
			var n = "", s = 0;
			if (p === void 0 && g !== void 0) {
				var ie = await vl(g, void 0, d, e, v, t, r, f, 1, l, F);
				if (F) {
					var ce = $(ie).css({
						position: "absolute",
						float: "left",
						"white-space": "nowrap",
						visibility: "hidden"
					}).appendTo($("body"));
					s += ce.outerWidth(), ce.remove();
				}
				n += ie;
			} else if (p !== void 0) for (var I = 0; I < p.length; I++) {
				var ie = await vl(p[I], I, g, e, v, t, r, f, p.length, l, F);
				if (F) {
					var ce = $(ie).css({
						position: "absolute",
						float: "left",
						"white-space": "nowrap",
						visibility: "hidden"
					}).appendTo($("body"));
					s += ce.outerWidth(), ce.remove();
				}
				n += ie;
			}
			var C = void 0;
			b !== void 0 && (C = gr(b, "x", i) - K - J), F && C !== void 0 && s < C && (C = s + K);
			var Y = C !== void 0 && !isNaN(C) ? "width:" + C + "px;" : "width:inherit;";
			o += "<div style='height: 100%;direction: initial;overflow-wrap:break-word;word-wrap: break-word;" + Y + Q + "' >", o += n, o += "</div>", o += "</div>";
		}
		return o;
	}
	async function dp(e, d, t, U, f, r, l, a) {
		a.slideMasterTextStyles;
		var i = U["a:lstStyle"];
		let o = "";
		var v = x(e, ["a:r"]);
		v !== void 0 && v.constructor === Array && (v = v[0]);
		var y = parseInt(x(e["a:pPr"], ["attrs", "lvl"])) + 1;
		isNaN(y) && (y = 1);
		var _ = "a:lvl" + y + "pPr", g, p, m, u, D;
		if (v !== void 0) g = await Ul(v, t, i, f, y, r, l, a), D = g[2], p = _1(v, U, f, y, l, a);
		else return "";
		var h = "", c = "", b = "", L = 0, S = 0, R = e["a:pPr"], P = x(R, ["a:buNone"]);
		if (P !== void 0) return "";
		var M = "TYPE_NONE", ee = oo(e, r, l, a), V = ee.nodeLaout, F = ee.nodeMaster, K = x(R, [
			"a:buChar",
			"attrs",
			"char"
		]), k = x(R, [
			"a:buAutoNum",
			"attrs",
			"type"
		]), Q = x(R, ["a:buBlip"]);
		K !== void 0 && (M = "TYPE_BULLET"), k !== void 0 && (M = "TYPE_NUMERIC"), Q !== void 0 && (M = "TYPE_BULPIC");
		var J = x(R, [
			"a:buSzPts",
			"attrs",
			"val"
		]);
		if (J === void 0) {
			if (J = x(R, [
				"a:buSzPct",
				"attrs",
				"val"
			]), J !== void 0) {
				var n = parseInt(J) / 1e5, s = parseInt(p, "px");
				u = n * parseInt(s) + "px";
			}
		} else u = parseInt(J) / 100 * nc + "px";
		var ie = x(R, ["a:buClr"]);
		if (K === void 0 && k === void 0 && Q === void 0 && i !== void 0) {
			if (P = x(i, [_, "a:buNone"]), P !== void 0) return "";
			M = "TYPE_NONE", K = x(i, [
				_,
				"a:buChar",
				"attrs",
				"char"
			]), k = x(i, [
				_,
				"a:buAutoNum",
				"attrs",
				"type"
			]), Q = x(i, [_, "a:buBlip"]), K !== void 0 && (M = "TYPE_BULLET"), k !== void 0 && (M = "TYPE_NUMERIC"), Q !== void 0 && (M = "TYPE_BULPIC"), (K !== void 0 || k !== void 0 || Q !== void 0) && (R = i[_]);
		}
		if (K === void 0 && k === void 0 && Q === void 0) {
			if (V !== void 0) {
				if (P = x(V, ["a:buNone"]), P !== void 0) return "";
				M = "TYPE_NONE", K = x(V, [
					"a:buChar",
					"attrs",
					"char"
				]), k = x(V, [
					"a:buAutoNum",
					"attrs",
					"type"
				]), Q = x(V, ["a:buBlip"]), K !== void 0 && (M = "TYPE_BULLET"), k !== void 0 && (M = "TYPE_NUMERIC"), Q !== void 0 && (M = "TYPE_BULPIC");
			}
			if (K === void 0 && k === void 0 && Q === void 0 && F !== void 0) {
				if (P = x(F, ["a:buNone"]), P !== void 0) return "";
				M = "TYPE_NONE", K = x(F, [
					"a:buChar",
					"attrs",
					"char"
				]), k = x(F, [
					"a:buAutoNum",
					"attrs",
					"type"
				]), Q = x(F, ["a:buBlip"]), K !== void 0 && (M = "TYPE_BULLET"), k !== void 0 && (M = "TYPE_NUMERIC"), Q !== void 0 && (M = "TYPE_BULPIC");
			}
		}
		var ce = x(R, ["attrs", "rtl"]);
		ce === void 0 && (ce = x(V, ["attrs", "rtl"]), ce === void 0 && l != "shape" && (ce = x(F, ["attrs", "rtl"])));
		var I = !1;
		ce !== void 0 && ce == "1" && (I = !0);
		var C = x(R, ["attrs", "algn"]);
		C === void 0 && (C = x(V, ["attrs", "algn"]), C === void 0 && (C = x(F, ["attrs", "algn"])));
		var Y = x(R, ["attrs", "indent"]);
		Y === void 0 && (Y = x(V, ["attrs", "indent"]), Y === void 0 && (Y = x(F, ["attrs", "indent"])));
		var ve = 0;
		Y !== void 0 && (ve = parseInt(Y) * A);
		var _e = x(R, ["attrs", "marL"]);
		if (_e === void 0 && (_e = x(V, ["attrs", "marL"]), _e === void 0 && (_e = x(F, ["attrs", "marL"]))), _e !== void 0) {
			var Ye = parseInt(_e) * A;
			I ? b = "padding-right:" : b = "padding-left:", L = Ye + ve < 0 ? 0 : Ye + ve, b += L + "px;";
		}
		var Je = x(R, ["attrs", "marR"]);
		if (Je === void 0 && _e === void 0 && (Je = x(V, ["attrs", "marR"]), Je === void 0 && (Je = x(F, ["attrs", "marR"]))), Je !== void 0) {
			var Ve = parseInt(Je) * A;
			I ? b = "padding-right:" : b = "padding-left:", c += (Ve + ve < 0 ? 0 : Ve + ve) + "px;";
		}
		ie === void 0 && (ie = x(i, [_, "a:buClr"])), ie === void 0 && (ie = x(V, ["a:buClr"]), ie === void 0 && (ie = x(F, ["a:buClr"])));
		var at;
		if (ie !== void 0 ? at = Rt(ie, void 0, void 0, a) : f !== void 0 && (at = Rt(f, void 0, void 0, a)), at === void 0 || at == "NONE" ? m = g : (m = [
			at,
			"",
			"solid"
		], D = "solid"), J === void 0) if (J = x(V, [
			"a:buSzPts",
			"attrs",
			"val"
		]), J === void 0) {
			if (J = x(V, [
				"a:buSzPct",
				"attrs",
				"val"
			]), J !== void 0) {
				var n = parseInt(J) / 1e5, s = parseInt(p, "px");
				u = n * parseInt(s) + "px";
			}
		} else u = parseInt(J) / 100 * nc + "px";
		if (J === void 0) if (J = x(F, [
			"a:buSzPts",
			"attrs",
			"val"
		]), J === void 0) {
			if (J = x(F, [
				"a:buSzPct",
				"attrs",
				"val"
			]), J !== void 0) {
				var n = parseInt(J) / 1e5, s = parseInt(p, "px");
				u = n * parseInt(s) + "px";
			}
		} else u = parseInt(J) / 100 * nc + "px";
		if (J === void 0 && (u = p), S = parseInt(u, "px"), M == "TYPE_BULLET") {
			var W = x(R, [
				"a:buFont",
				"attrs",
				"typeface"
			]), Dt = "";
			if (W !== void 0 && (Dt = "font-family: " + W), h = "<div style='height: 100%;" + Dt + ";" + b + c + "font-size:" + u + ";", D == "solid") m[0] !== void 0 && m[0] != "" && (h += "color:#" + m[0] + "; "), m[1] !== void 0 && m[1] != "" && m[1] != ";" && (h += "text-shadow:" + m[1] + ";");
			else if (D == "pattern" || D == "pic" || D == "gradient") {
				if (D == "pattern") h += "background:" + m[0][0] + ";", m[0][1] !== null && m[0][1] !== void 0 && m[0][1] != "" && (h += "background-size:" + m[0][1] + ";"), m[0][2] !== null && m[0][2] !== void 0 && m[0][2] != "" && (h += "background-position:" + m[0][2] + ";");
				else if (D == "pic") h += m[0] + ";";
				else if (D == "gradient") {
					var Lt = m[0].color, kt = m[0].rot;
					h += "background: linear-gradient(" + kt + "deg,";
					for (var d = 0; d < Lt.length; d++) d == Lt.length - 1 ? h += "#" + Lt[d] + ");" : h += "#" + Lt[d] + ", ";
				}
				h += "-webkit-background-clip: text;background-clip: text;color: transparent;", m[1].border !== void 0 && m[1].border !== "" && (h += "-webkit-text-stroke: " + m[1].border + ";"), m[1].effcts !== void 0 && m[1].effcts !== "" && (h += "filter: " + m[1].effcts + ";");
			}
			I && (h += "white-space: nowrap ;direction:rtl");
			var T = K;
			il || (T = op(W, K)), h += "'><div style='line-height: " + S / 2 + "px;'>" + T + "</div></div>";
		} else if (M == "TYPE_NUMERIC") h = "<div style='height: 100%;" + b + c + "color:#" + m[0] + ";font-size:" + u + ";", I ? h += "display: inline-block;white-space: nowrap ;direction:rtl;" : h += "display: inline-block;white-space: nowrap ;direction:ltr;", h += "' data-bulltname = '" + k + "' data-bulltlvl = '" + y + "' class='numeric-bullet-style'></div>";
		else if (M == "TYPE_BULPIC") {
			var ke = x(Q, [
				"a:blip",
				"attrs",
				"r:embed"
			]), be;
			if (ke !== void 0) {
				var G = a.slideResObj[ke].target, z = await a.zip.file(G).async("arraybuffer");
				be = "<img src='data:" + uc(G.split(".").pop()) + ";base64," + bc(z) + "' style='width: 100%;'/>";
			}
			ke === void 0 && (be = "&#8227;"), h = "<div style='height: 100%;" + b + c + "width:" + u + ";display: inline-block; ", I && (h += "display: inline-block;white-space: nowrap ;direction:rtl;"), h += "'>" + be + "  </div>";
		}
		return [
			o,
			L,
			S
		];
	}
	function op(e, d) {
		switch (d) {
			case "§": return "&#9632;";
			case "q": return "&#10065;";
			case "v": return "&#10070;";
			case "Ø": return "&#11162;";
			case "ü": return "&#10004;";
			default:
				if (e == "Wingdings 2" || e == "Wingdings 3") {
					var t = cp(e, d);
					if (t !== null) return "&#" + t + ";";
				}
				return "&#" + d.charCodeAt(0) + ";";
		}
	}
	function cp(e, d) {
		let t = d.codePointAt(0) & 4095;
		return F2.codePoint(e, t).codePoint;
	}
	function oo(e, d, t, U) {
		var f, r, l = e["a:pPr"], a = 1, i = x(l, ["attrs", "lvl"]);
		if (i !== void 0 && (a = parseInt(i) + 1), d !== void 0 && (f = x(U.slideLayoutTables.idxTable[d], [
			"p:txBody",
			"a:lstStyle",
			"a:lvl" + a + "pPr"
		]), f === void 0 && (f = x(U.slideLayoutTables.idxTable[d], [
			"p:txBody",
			"a:p",
			"a:pPr"
		]), f === void 0 && (f = x(U.slideLayoutTables.idxTable[d], [
			"p:txBody",
			"a:p",
			a - 1,
			"a:pPr"
		])))), t !== void 0) {
			var o = "a:lvl" + a + "pPr";
			f === void 0 && (f = x(U, [
				"slideLayoutTables",
				"typeTable",
				t,
				"p:txBody",
				"a:lstStyle",
				o
			])), t == "title" || t == "ctrTitle" ? r = x(U, [
				"slideMasterTextStyles",
				"p:titleStyle",
				o
			]) : t == "body" || t == "obj" || t == "subTitle" ? r = x(U, [
				"slideMasterTextStyles",
				"p:bodyStyle",
				o
			]) : t == "shape" || t == "diagram" ? r = x(U, [
				"slideMasterTextStyles",
				"p:otherStyle",
				o
			]) : t == "textBox" ? r = x(U, ["defaultTextStyle", o]) : r = x(U, [
				"slideMasterTables",
				"typeTable",
				t,
				"p:txBody",
				"a:lstStyle",
				o
			]);
		}
		return {
			nodeLaout: f,
			nodeMaster: r
		};
	}
	async function vl(e, d, t, U, f, r, l, a, i, o, v) {
		var y = "", _ = U["a:lstStyle"], g = o.slideMasterTextStyles, p = e["a:t"], m = x(e, [
			"a:fld",
			"attrs",
			"type"
		]);
		typeof m == "string" && m.toLowerCase() === "slidenum" && (p = String(o && o.slideNumber || ""));
		var u = "<span", D = "</span>", h = "";
		if (p === void 0 && e.type !== void 0) {
			if (oc) return oc = !1, "<span class='line-break-br' ></span>";
			h += "display: block;";
		} else oc = !0;
		typeof p != "string" && (p = x(e, ["a:fld", "a:t"]), typeof p != "string" && (p = "&nbsp;"));
		var c = t["a:pPr"], b = 1, L = x(c, ["attrs", "lvl"]);
		L !== void 0 && (b = parseInt(L) + 1);
		var S = oo(t, l, a, o), R = S.nodeLaout, P = S.nodeMaster, M = x(e, [
			"a:rPr",
			"attrs",
			"lang"
		]), ee = M !== void 0 && rl.indexOf(M) !== -1, V = x(c, ["attrs", "rtl"]);
		V === void 0 && (V = x(R, ["attrs", "rtl"]), V === void 0 && a != "shape" && (V = x(P, ["attrs", "rtl"])));
		var F = x(e, [
			"a:rPr",
			"a:hlinkClick",
			"attrs",
			"r:id"
		]), K = "", k;
		if (F !== void 0) {
			K = x(e, [
				"a:rPr",
				"a:hlinkClick",
				"attrs",
				"tooltip"
			]), K !== void 0 && (K = "title='" + K + "'"), k = kl("a:hlink", void 0, void 0, o);
			var Q = Rt(x(e, ["a:rPr", "a:solidFill"]), void 0, void 0, o);
			Q !== void 0 && Q != "" && (k = Q);
		}
		var J = await Ul(e, t, _, f, b, l, a, o), n = J[2];
		if (n == "solid") F === void 0 && J[0] !== void 0 && J[0] != "" ? h += "color: #" + J[0] + ";" : F !== void 0 && k !== void 0 && (h += "color: #" + k + ";"), J[1] !== void 0 && J[1] != "" && J[1] != ";" && (h += "text-shadow:" + J[1] + ";"), J[3] !== void 0 && J[3] != "" && (h += "background-color: #" + J[3] + ";");
		else if (n == "pattern" || n == "pic" || n == "gradient") {
			if (n == "pattern") h += "background:" + J[0][0] + ";", J[0][1] !== null && J[0][1] !== void 0 && J[0][1] != "" && (h += "background-size:" + J[0][1] + ";"), J[0][2] !== null && J[0][2] !== void 0 && J[0][2] != "" && (h += "background-position:" + J[0][2] + ";");
			else if (n == "pic") h += J[0] + ";";
			else if (n == "gradient") {
				var s = J[0].color, ie = J[0].rot;
				h += "background: linear-gradient(" + ie + "deg,";
				for (var ce = 0; ce < s.length; ce++) ce == s.length - 1 ? h += "#" + s[ce] + ");" : h += "#" + s[ce] + ", ";
			}
			h += "-webkit-background-clip: text;background-clip: text;color: transparent;", J[1].border !== void 0 && J[1].border !== "" && (h += "-webkit-text-stroke: " + J[1].border + ";"), J[1].effcts !== void 0 && J[1].effcts !== "" && (h += "filter: " + J[1].effcts + ";");
		}
		var I = _1(e, U, f, b, a, o);
		y += "font-size:" + I + ";font-family:" + _p(e, a, o, f, p, M, R, P, b) + ";font-weight:" + wp(e, a, g, R, P) + ";font-style:" + kp(e, a, g, R, P) + ";text-decoration:" + Tp(e, a, g) + ";text-align:" + Lp(e, t, a, o) + ";vertical-align:" + Fp(e, a, g) + ";", ee ? h += "direction:rtl;" : h += "direction:ltr;";
		var C = x(e, ["a:rPr", "a:highlight"]);
		C !== void 0 && (h += "background-color:#" + Rt(C, void 0, void 0, o) + ";");
		var Y = x(e, [
			"a:rPr",
			"attrs",
			"spc"
		]);
		if (Y === void 0 && (Y = x(R, [
			"a:defRPr",
			"attrs",
			"spc"
		]), Y === void 0 && (Y = x(P, [
			"a:defRPr",
			"attrs",
			"spc"
		]))), Y !== void 0) {
			var ve = parseInt(Y) / 100;
			h += "letter-spacing: " + ve + "px;";
		}
		var _e = x(e, [
			"a:rPr",
			"attrs",
			"cap"
		]);
		_e === void 0 && (_e = x(R, [
			"a:defRPr",
			"attrs",
			"cap"
		]), _e === void 0 && (_e = x(P, [
			"a:defRPr",
			"attrs",
			"cap"
		]))), (_e == "small" || _e == "all") && (h += "text-transform: uppercase");
		var Ye = "";
		h in Va ? Ye = Va[h].name : (Ye = "_css_" + (Object.keys(Va).length + 1), Va[h] = {
			name: Ye,
			text: h
		});
		var Je = "";
		if (n == "solid" && F !== void 0 && (Je = "style='color: inherit;'"), F !== void 0 && F != "") {
			var Ve = o.slideResObj[F].target;
			return Ve = mc(Ve), u + " class='text-block " + Ye + "' style='" + y + "'><a href='" + Ve + "' " + Je + "  " + K + " target='_blank'>" + p.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\s/g, "&nbsp;") + "</a>" + D;
		} else return u + " class='text-block " + Ye + "' style='" + y + "'>" + p.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\s/g, "&nbsp;") + D;
	}
	function hp(e, d, t, U, f) {
		if (!U) return ["", 0];
		var r = "", l = "", a = 0, i = e["a:pPr"], o = oo(e, d, t, f), v = o.nodeLaout, y = o.nodeMaster, _ = x(i, ["attrs", "rtl"]);
		_ === void 0 && (_ = x(v, ["attrs", "rtl"]), _ === void 0 && t != "shape" && (_ = x(y, ["attrs", "rtl"])));
		var g = !1;
		_ !== void 0 && _ == "1" && (g = !0);
		var p = x(i, ["attrs", "algn"]);
		p === void 0 && (p = x(v, ["attrs", "algn"]), p === void 0 && (p = x(y, ["attrs", "algn"])));
		var m = x(i, ["attrs", "indent"]);
		m === void 0 && (m = x(v, ["attrs", "indent"]), m === void 0 && (m = x(y, ["attrs", "indent"])));
		var u = 0;
		m !== void 0 && (u = parseInt(m) * A);
		var D = x(i, ["attrs", "marL"]);
		D === void 0 && (D = x(v, ["attrs", "marL"]), D === void 0 && (D = x(y, ["attrs", "marL"])));
		var h = 0;
		D !== void 0 && (h = parseInt(D) * A), (m !== void 0 || D !== void 0) && (g ? r = "padding-right: " : r = "padding-left: ", U ? (a = Math.abs(0 - u), r += a + "px;") : (a = Math.abs(h + u), r += a + "px;"));
		var c = x(i, ["attrs", "marR"]);
		return c === void 0 && D === void 0 && (c = x(v, ["attrs", "marR"]), c === void 0 && (c = x(y, ["attrs", "marR"]))), c !== void 0 && U && (parseInt(c) * A, g ? l = "padding-right: " : l = "padding-left: ", l += Math.abs(0 - u) + "px;"), [r, a];
	}
	function lp() {
		var e = "";
		for (var d in Va) e += " ." + Va[d].name + (Va[d].suffix ? Va[d].suffix : "") + "{" + Va[d].text + `}
`;
		return e;
	}
	async function gp(e, d, t) {
		var U = e.attrs.order, f = x(e, [
			"a:graphic",
			"a:graphicData",
			"a:tbl"
		]), r = x(e, ["p:xfrm"]), l = x(e, [
			"a:graphic",
			"a:graphicData",
			"a:tbl",
			"a:tblPr"
		]), a = x(e, [
			"a:graphic",
			"a:graphicData",
			"a:tbl",
			"a:tblGrid",
			"a:gridCol"
		]), i = "";
		l !== void 0 && (i = l.attrs.rtl == 1 ? "dir=rtl" : "dir=ltr");
		var o = l.attrs.firstRow, v = l.attrs.firstCol, y = l.attrs.lastRow, _ = l.attrs.lastCol, g = l.attrs.bandRow, p = l.attrs.bandCol, m = {
			isFrstRowAttr: o !== void 0 && o == "1" ? 1 : 0,
			isFrstColAttr: v !== void 0 && v == "1" ? 1 : 0,
			isLstRowAttr: y !== void 0 && y == "1" ? 1 : 0,
			isLstColAttr: _ !== void 0 && _ == "1" ? 1 : 0,
			isBandRowAttr: g !== void 0 && g == "1" ? 1 : 0,
			isBandColAttr: p !== void 0 && p == "1" ? 1 : 0
		}, u, D = l["a:tableStyleId"];
		if (D !== void 0) {
			var h = ll["a:tblStyleLst"]["a:tblStyle"];
			if (h !== void 0) if (h.constructor === Array) for (var c = 0; c < h.length; c++) h[c].attrs.styleId == D && (u = h[c]);
			else h.attrs.styleId == D && (u = h);
		}
		u !== void 0 && (u.tblStylAttrObj = m, d.thisTbiStyle = u);
		var b = x(x(u, ["a:wholeTbl", "a:tcStyle"]), ["a:tcBdr"]), L = "";
		b !== void 0 && (L = ho(b, d));
		var S = "", R = x(u, ["a:tblBg", "a:fillRef"]);
		R !== void 0 && (S = Rt(R, void 0, void 0, d)), R === void 0 && (R = x(u, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:fill",
			"a:solidFill"
		]), S = Rt(R, void 0, void 0, d)), S !== "" && (S = "background-color: #" + S + ";");
		var P = "<table " + i + " style='border-collapse: collapse;" + pr(r, e, void 0, void 0, "group", t) + ur(r, void 0, void 0, t) + " z-index: " + U + ";" + L + ";" + S + "'>", M = f["a:tr"];
		M.constructor !== Array && (M = [M]);
		for (var ee = 0, V = [], F = 0; F < M.length; F++) {
			var K = M[F].attrs.h, k = 0, Q = "";
			K !== void 0 && (k = parseInt(K) * A, Q += "height:" + k + "px;");
			var J = "", n = "", s = "", ie = "";
			if (u !== void 0 && u["a:wholeTbl"] !== void 0) {
				var ce = x(u, [
					"a:wholeTbl",
					"a:tcStyle",
					"a:fill",
					"a:solidFill"
				]);
				if (ce !== void 0) {
					var I = Rt(ce, void 0, void 0, d);
					I !== void 0 && (J = I);
				}
				var C = x(u, ["a:wholeTbl", "a:tcTxStyle"]);
				if (C !== void 0) {
					var Y = Rt(C, void 0, void 0, d);
					Y !== void 0 && (s = Y);
					var ve = x(C, ["attrs", "b"]) == "on" ? "bold" : "";
					ve != "" && (ie = ve);
				}
			}
			if (F == 0 && m.isFrstRowAttr == 1 && u !== void 0) {
				var ce = x(u, [
					"a:firstRow",
					"a:tcStyle",
					"a:fill",
					"a:solidFill"
				]);
				if (ce !== void 0) {
					var I = Rt(ce, void 0, void 0, d);
					I !== void 0 && (J = I);
				}
				var _e = x(u, [
					"a:firstRow",
					"a:tcStyle",
					"a:tcBdr"
				]);
				if (_e !== void 0) {
					var Ye = ho(_e, d);
					Ye != "" && (n = Ye);
				}
				var C = x(u, ["a:firstRow", "a:tcTxStyle"]);
				if (C !== void 0) {
					var Je = Rt(C, void 0, void 0, d);
					Je !== void 0 && (s = Je);
					var ve = x(C, ["attrs", "b"]) == "on" ? "bold" : "";
					ve !== "" && (ie = ve);
				}
			} else if (F > 0 && m.isBandRowAttr == 1 && u !== void 0) {
				if (J = "", n = void 0, F % 2 == 0 && u["a:band2H"] !== void 0) {
					var ce = x(u, [
						"a:band2H",
						"a:tcStyle",
						"a:fill",
						"a:solidFill"
					]);
					if (ce !== void 0) {
						var I = Rt(ce, void 0, void 0, d);
						I !== "" && (J = I);
					}
					var _e = x(u, [
						"a:band2H",
						"a:tcStyle",
						"a:tcBdr"
					]);
					if (_e !== void 0) {
						var Ye = ho(_e, d);
						Ye != "" && (n = Ye);
					}
					var C = x(u, ["a:band2H", "a:tcTxStyle"]);
					if (C !== void 0) {
						var Je = Rt(C, void 0, void 0, d);
						Je !== void 0 && (s = Je);
					}
					var ve = x(C, ["attrs", "b"]) == "on" ? "bold" : "";
					ve !== "" && (ie = ve);
				}
				if (F % 2 != 0 && u["a:band1H"] !== void 0) {
					var ce = x(u, [
						"a:band1H",
						"a:tcStyle",
						"a:fill",
						"a:solidFill"
					]);
					if (ce !== void 0) {
						var I = Rt(ce, void 0, void 0, d);
						I !== void 0 && (J = I);
					}
					var _e = x(u, [
						"a:band1H",
						"a:tcStyle",
						"a:tcBdr"
					]);
					if (_e !== void 0) {
						var Ye = ho(_e, d);
						Ye != "" && (n = Ye);
					}
					var C = x(u, ["a:band1H", "a:tcTxStyle"]);
					if (C !== void 0) {
						var Je = Rt(C, void 0, void 0, d);
						Je !== void 0 && (s = Je);
						var ve = x(C, ["attrs", "b"]) == "on" ? "bold" : "";
						ve != "" && (ie = ve);
					}
				}
			}
			if (F == M.length - 1 && m.isLstRowAttr == 1 && u !== void 0) {
				var ce = x(u, [
					"a:lastRow",
					"a:tcStyle",
					"a:fill",
					"a:solidFill"
				]);
				if (ce !== void 0) {
					var I = Rt(ce, void 0, void 0, d);
					I !== void 0 && (J = I);
				}
				var _e = x(u, [
					"a:lastRow",
					"a:tcStyle",
					"a:tcBdr"
				]);
				if (_e !== void 0) {
					var Ye = ho(_e, d);
					Ye != "" && (n = Ye);
				}
				var C = x(u, ["a:lastRow", "a:tcTxStyle"]);
				if (C !== void 0) {
					var Je = Rt(C, void 0, void 0, d);
					Je !== void 0 && (s = Je);
					var ve = x(C, ["attrs", "b"]) == "on" ? "bold" : "";
					ve !== "" && (ie = ve);
				}
			}
			Q += n !== void 0 ? n : "", Q += s !== void 0 ? " color: #" + s + ";" : "", Q += ie != "" ? " font-weight:" + ie + ";" : "", J !== void 0 && J != "" && (Q += "background-color: #" + J + ";"), P += "<tr style='" + Q + "'>";
			var Ve = M[F]["a:tc"];
			if (Ve !== void 0) if (Ve.constructor === Array) {
				var at = 0;
				V.length == 0 && (V = Array.apply(null, Array(Ve.length)).map(function() {
					return 0;
				}));
				for (var W = 0; at < Ve.length;) {
					if (V[at] == 0 && W == 0) {
						var Dt;
						if (at == 0 && m.isFrstColAttr == 1) Dt = "a:firstCol", m.isLstRowAttr == 1 && F == M.length - 1 && x(u, ["a:seCell"]) !== void 0 ? Dt = "a:seCell" : m.isFrstRowAttr == 1 && F == 0 && x(u, ["a:neCell"]) !== void 0 && (Dt = "a:neCell");
						else if (at > 0 && m.isBandColAttr == 1 && !(m.isFrstColAttr == 1 && F == 0) && !(m.isLstRowAttr == 1 && F == M.length - 1) && at != Ve.length - 1 && at % 2 != 0) {
							var Lt = x(u, ["a:band2V"]);
							Lt === void 0 ? (Lt = x(u, ["a:band1V"]), Lt !== void 0 && (Dt = "a:band2V")) : Dt = "a:band2V";
						}
						at == Ve.length - 1 && m.isLstColAttr == 1 && (Dt = "a:lastCol", m.isLstRowAttr == 1 && F == M.length - 1 && x(u, ["a:swCell"]) !== void 0 ? Dt = "a:swCell" : m.isFrstRowAttr == 1 && F == 0 && x(u, ["a:nwCell"]) !== void 0 && (Dt = "a:nwCell"));
						var kt = await yl(Ve[at], a, F, at, u, Dt, d), T = kt[0], ke = kt[1], be = kt[2], G = kt[3], z = kt[4];
						G !== void 0 ? (ee++, V[at] = parseInt(G) - 1, P += "<td class='" + be + "' data-row='" + F + "," + at + "' rowspan ='" + parseInt(G) + "' style='" + ke + "'>" + T + "</td>") : z !== void 0 ? (P += "<td class='" + be + "' data-row='" + F + "," + at + "' colspan = '" + parseInt(z) + "' style='" + ke + "'>" + T + "</td>", W = parseInt(z) - 1) : P += "<td class='" + be + "' data-row='" + F + "," + at + "' style = '" + ke + "'>" + T + "</td>";
					} else V[at] != 0 && (V[at] -= 1), W != 0 && W--;
					at++;
				}
			} else {
				var Dt;
				if (m.isFrstColAttr == 1 && m.isLstRowAttr != 1) Dt = "a:firstCol";
				else if (m.isBandColAttr == 1 && m.isLstRowAttr != 1) {
					var Lt = x(u, ["a:band2V"]);
					Lt === void 0 ? (Lt = x(u, ["a:band1V"]), Lt !== void 0 && (Dt = "a:band2V")) : Dt = "a:band2V";
				}
				m.isLstColAttr == 1 && m.isLstRowAttr != 1 && (Dt = "a:lastCol");
				var kt = await yl(Ve, a, F, void 0, u, Dt, d), T = kt[0], ke = kt[1], be = kt[2], G = kt[3];
				G !== void 0 ? P += "<td  class='" + be + "' rowspan='" + parseInt(G) + "' style = '" + ke + "'>" + T + "</td>" : P += "<td class='" + be + "' style='" + ke + "'>" + T + "</td>";
			}
			P += "</tr>";
		}
		return P;
	}
	async function yl(e, d, t, U, f, r, l) {
		var a = x(e, ["attrs", "rowSpan"]), i = x(e, ["attrs", "gridSpan"]);
		x(e, ["attrs", "vMerge"]), x(e, ["attrs", "hMerge"]);
		var o = "word-wrap: break-word;", v, y = "", _ = "", g = "", p = "", m = "", u = "", D = "", h = parseInt(i), c = 0;
		if (!isNaN(h) && h > 1) for (var b = 0; b < h; b++) c += parseInt(x(d[U + b], ["attrs", "w"]));
		else c = x(U === void 0 ? d : d[U], ["attrs", "w"]);
		var L = await cc(e["a:txBody"], e, void 0, void 0, void 0, void 0, l, c);
		if (c != 0 && (v = parseInt(c) * A, o += "width:" + v + "px;"), p = x(e, ["a:tcPr", "a:lnB"]), p === void 0 && r !== void 0 && (r !== void 0 && (p = x(f[r], [
			"a:tcStyle",
			"a:tcBdr",
			"a:bottom",
			"a:ln"
		])), p === void 0 && (p = x(f, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:tcBdr",
			"a:bottom",
			"a:ln"
		]))), m = x(e, ["a:tcPr", "a:lnT"]), m === void 0 && (r !== void 0 && (m = x(f[r], [
			"a:tcStyle",
			"a:tcBdr",
			"a:top",
			"a:ln"
		])), m === void 0 && (m = x(f, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:tcBdr",
			"a:top",
			"a:ln"
		]))), u = x(e, ["a:tcPr", "a:lnL"]), u === void 0 && (r !== void 0 && (u = x(f[r], [
			"a:tcStyle",
			"a:tcBdr",
			"a:left",
			"a:ln"
		])), u === void 0 && (u = x(f, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:tcBdr",
			"a:left",
			"a:ln"
		]))), D = x(e, ["a:tcPr", "a:lnR"]), D === void 0 && (r !== void 0 && (D = x(f[r], [
			"a:tcStyle",
			"a:tcBdr",
			"a:right",
			"a:ln"
		])), D === void 0 && (D = x(f, [
			"a:wholeTbl",
			"a:tcStyle",
			"a:tcBdr",
			"a:right",
			"a:ln"
		]))), x(e, ["a:tcPr", "a:lnBlToTr"]), x(e, ["a:tcPr", "a:InTlToBr"]), p !== void 0 && p != "") {
			var S = Un(p, void 0, !1, "", l);
			S != "" && (o += "border-bottom:" + S + ";");
		}
		if (m !== void 0 && m != "") {
			var R = Un(m, void 0, !1, "", l);
			R != "" && (o += "border-top: " + R + ";");
		}
		if (u !== void 0 && u != "") {
			var P = Un(u, void 0, !1, "", l);
			P != "" && (o += "border-left: " + P + ";");
		}
		if (D !== void 0 && D != "") {
			var M = Un(D, void 0, !1, "", l);
			M != "" && (o += "border-right:" + M + ";");
		}
		var ee = x(e, ["a:tcPr"]);
		if (ee !== void 0 && ee != "" && (y = await fc({ "p:spPr": ee }, void 0, !1, l, "slide")), y == "" || y == "background-color: inherit;") {
			var V;
			if (r !== void 0 && (V = x(f, [
				r,
				"a:tcStyle",
				"a:fill",
				"a:solidFill"
			])), V !== void 0) {
				var F = Rt(V, void 0, void 0, l);
				F !== void 0 && (y = " background-color: #" + F + ";");
			}
		}
		var K = "";
		y !== void 0 && y != "" && (y in Va ? K = Va[y].name : (K = "_tbl_cell_css_" + (Object.keys(Va).length + 1), Va[y] = {
			name: K,
			text: y
		}));
		var k;
		if (r !== void 0 && (k = x(f, [r, "a:tcTxStyle"])), k !== void 0) {
			var Q = Rt(k, void 0, void 0, l);
			Q !== void 0 && (_ = Q);
			var J = x(k, ["attrs", "b"]) == "on" ? "bold" : "";
			J !== "" && (g = J);
		}
		return o += _ !== "" ? "color: #" + _ + ";" : "", o += g != "" ? " font-weight:" + g + ";" : "", [
			L,
			o,
			K,
			a,
			i
		];
	}
	async function fp(e, d, t) {
		var U = e.attrs.order, f = x(e, ["p:xfrm"]), r = "<div id='chart" + Rr + "' class='block content' style='" + pr(f, e, void 0, void 0, "group", t) + ur(f, void 0, void 0, t) + " z-index: " + U + ";'></div>", l = e["a:graphic"]["a:graphicData"]["c:chart"].attrs["r:id"], a = d.slideResObj[l].target, i = x(await ni(d.zip, a), [
			"c:chartSpace",
			"c:chart",
			"c:plotArea"
		]), o = null;
		for (var v in i) switch (v) {
			case "c:lineChart":
				o = {
					type: "createChart",
					data: {
						chartID: "chart" + Rr,
						chartType: "lineChart",
						chartData: Ss(i[v]["c:ser"])
					}
				};
				break;
			case "c:barChart":
				o = {
					type: "createChart",
					data: {
						chartID: "chart" + Rr,
						chartType: "barChart",
						chartData: Ss(i[v]["c:ser"])
					}
				};
				break;
			case "c:pieChart":
				o = {
					type: "createChart",
					data: {
						chartID: "chart" + Rr,
						chartType: "pieChart",
						chartData: Ss(i[v]["c:ser"])
					}
				};
				break;
			case "c:pie3DChart":
				o = {
					type: "createChart",
					data: {
						chartID: "chart" + Rr,
						chartType: "pie3DChart",
						chartData: Ss(i[v]["c:ser"])
					}
				};
				break;
			case "c:areaChart":
				o = {
					type: "createChart",
					data: {
						chartID: "chart" + Rr,
						chartType: "areaChart",
						chartData: Ss(i[v]["c:ser"])
					}
				};
				break;
			case "c:scatterChart":
				o = {
					type: "createChart",
					data: {
						chartID: "chart" + Rr,
						chartType: "scatterChart",
						chartData: Ss(i[v]["c:ser"])
					}
				};
				break;
			case "c:catAx": break;
			case "c:valAx": break;
			default:
		}
		return o !== null && al.MsgQueue.push(o), Rr++, r;
	}
	async function pp(e, d, t, U, f) {
		e.attrs.order;
		var r = d.zip, l = x(e, ["p:xfrm"]), a = x(e, [
			"a:graphic",
			"a:graphicData",
			"dgm:relIds",
			"attrs"
		]), i = a["r:cs"], o = a["r:dm"], v = a["r:lo"], y = a["r:qs"], _ = d.slideResObj[i].target, g = d.slideResObj[o].target, p = d.slideResObj[v].target, m = d.slideResObj[y].target;
		await ni(r, _), await ni(r, g), await ni(r, p), await ni(r, m);
		var u = x(d.digramFileContent, [
			"p:drawing",
			"p:spTree",
			"p:sp"
		]), D = "";
		if (u !== void 0) for (var h = u.length, c = 0; c < h; c++) {
			var b = u[c];
			D += await ml(b, e, d, "diagramBg", U, f);
		}
		return "<div class='block diagram-content' style='" + pr(l, e, void 0, void 0, U, f) + ur(l, void 0, void 0, f) + "'>" + D + "</div>";
	}
	function pr(e, d, t, U, f, r) {
		var l, a = -1, i = -1;
		return e !== void 0 && (l = x(e, ["a:off", "attrs"])), l === void 0 && t !== void 0 ? l = x(t, ["a:off", "attrs"]) : l === void 0 && U !== void 0 && (l = x(U, ["a:off", "attrs"])), l === void 0 ? "" : (a = Ws(l.x, "x", r), i = Ws(l.y, "y", r), isNaN(a) || isNaN(i) ? "" : "top:" + i + "px; left:" + a + "px;");
	}
	function ur(e, d, t, U) {
		var f = void 0, r = -1, l = -1;
		return e !== void 0 ? f = x(e, ["a:ext", "attrs"]) : d !== void 0 ? f = x(d, ["a:ext", "attrs"]) : t !== void 0 && (f = x(t, ["a:ext", "attrs"])), f === void 0 ? "" : (r = gr(f.cx, "x", U), l = gr(f.cy, "y", U), isNaN(r) || isNaN(l) ? "" : "width:" + r + "px; height:" + l + "px;");
	}
	function up(e, d, t, U, f) {
		var r = 1, l = x(e, [
			"a:pPr",
			"a:spcBef",
			"a:spcPts",
			"attrs",
			"val"
		]), a = x(e, [
			"a:pPr",
			"a:spcAft",
			"a:spcPts",
			"attrs",
			"val"
		]), i = x(e, [
			"a:pPr",
			"a:lnSpc",
			"a:spcPct",
			"attrs",
			"val"
		]), o = "Pct";
		i === void 0 && (i = x(e, [
			"a:pPr",
			"a:lnSpc",
			"a:spcPts",
			"attrs",
			"val"
		]), i !== void 0 && (o = "Pts"));
		var v = x(e, [
			"a:pPr",
			"attrs",
			"lvl"
		]);
		v !== void 0 && (r = parseInt(v) + 1);
		var y;
		if (x(e, ["a:r"]) !== void 0) {
			var _ = _1(e["a:r"], d, void 0, r, t, f);
			_ != "inherit" && (y = parseInt(_, "px"));
		}
		var g = !0;
		if ((t == "shape" || t == "textBox") && (g = !1), g && (l === void 0 || a === void 0 || i === void 0) && U !== void 0) {
			var p = x(f, [
				"slideLayoutTables",
				"idxTable",
				U,
				"p:txBody",
				"a:p",
				r - 1,
				"a:pPr"
			]);
			l === void 0 && (l = x(p, [
				"a:spcBef",
				"a:spcPts",
				"attrs",
				"val"
			])), a === void 0 && (a = x(p, [
				"a:spcAft",
				"a:spcPts",
				"attrs",
				"val"
			])), i === void 0 && (i = x(p, [
				"a:lnSpc",
				"a:spcPct",
				"attrs",
				"val"
			]), i === void 0 && (i = x(p, [
				"a:pPr",
				"a:lnSpc",
				"a:spcPts",
				"attrs",
				"val"
			]), i !== void 0 && (o = "Pts")));
		}
		if (g && (l === void 0 || a === void 0 || i === void 0)) {
			var m = f.slideMasterTextStyles, u = "", r = "a:lvl" + r + "pPr";
			switch (t) {
				case "title":
				case "ctrTitle":
					u = "p:titleStyle";
					break;
				case "body":
				case "obj":
				case "dt":
				case "ftr":
				case "sldNum":
				case "textBox":
					u = "p:bodyStyle";
					break;
				default: u = "p:otherStyle";
			}
			var D = x(m, [u, r]);
			D !== void 0 && (l === void 0 && (l = x(D, [
				"a:spcBef",
				"a:spcPts",
				"attrs",
				"val"
			])), a === void 0 && (a = x(D, [
				"a:spcAft",
				"a:spcPts",
				"attrs",
				"val"
			])), i === void 0 && (i = x(D, [
				"a:lnSpc",
				"a:spcPct",
				"attrs",
				"val"
			]), i === void 0 && (i = x(D, [
				"a:pPr",
				"a:lnSpc",
				"a:spcPts",
				"attrs",
				"val"
			]), i !== void 0 && (o = "Pts"))));
		}
		var h = 0, c = 0, b = 0, L = "";
		if (l !== void 0 && (h = parseInt(l) / 100), a !== void 0 && (c = parseInt(a) / 100), i !== void 0 && y !== void 0) if (o == "Pts") L += "padding-top: " + (parseInt(i) / 100 - y) + "px;";
		else {
			var S = parseInt(i) / 1e5;
			b = y * (S - 1) - y, L += "padding-top: " + (S > 1 ? y : 0) + "px;", L += "padding-bottom: " + b + "px;";
		}
		return L += "margin-top: " + (h - 1) + "px;", (a !== void 0 || i !== void 0) && (L += "margin-bottom: " + c + "px;"), L;
	}
	function bp(e, d, t, U, f, r) {
		var l = x(e, [
			"a:pPr",
			"attrs",
			"algn"
		]);
		if (l === void 0) {
			var a = 1, i = x(e, [
				"a:pPr",
				"attrs",
				"lvl"
			]);
			i !== void 0 && (a = parseInt(i) + 1);
			var o = "a:lvl" + a + "pPr", v = d["a:lstStyle"];
			l = x(v, [
				o,
				"attrs",
				"algn"
			]), l === void 0 && t !== void 0 && (l = x(r.slideLayoutTables.idxTable[t], [
				"p:txBody",
				"a:lstStyle",
				o,
				"attrs",
				"algn"
			]), l === void 0 && (l = x(r.slideLayoutTables.idxTable[t], [
				"p:txBody",
				"a:p",
				"a:pPr",
				"attrs",
				"algn"
			]), l === void 0 && (l = x(r.slideLayoutTables.idxTable[t], [
				"p:txBody",
				"a:p",
				a - 1,
				"a:pPr",
				"attrs",
				"algn"
			])))), l === void 0 && (U !== void 0 ? (l = x(r, [
				"slideLayoutTables",
				"typeTable",
				U,
				"p:txBody",
				"a:lstStyle",
				o,
				"attrs",
				"algn"
			]), l === void 0 && (U == "title" || U == "ctrTitle" ? l = x(r, [
				"slideMasterTextStyles",
				"p:titleStyle",
				o,
				"attrs",
				"algn"
			]) : U == "body" || U == "obj" || U == "subTitle" ? l = x(r, [
				"slideMasterTextStyles",
				"p:bodyStyle",
				o,
				"attrs",
				"algn"
			]) : U == "shape" || U == "diagram" ? l = x(r, [
				"slideMasterTextStyles",
				"p:otherStyle",
				o,
				"attrs",
				"algn"
			]) : U == "textBox" ? l = x(r, [
				"defaultTextStyle",
				o,
				"attrs",
				"algn"
			]) : l = x(r, [
				"slideMasterTables",
				"typeTable",
				U,
				"p:txBody",
				"a:lstStyle",
				o,
				"attrs",
				"algn"
			]))) : l = x(r, [
				"slideMasterTextStyles",
				"p:bodyStyle",
				o,
				"attrs",
				"algn"
			]));
		}
		if (l === void 0) {
			if (U == "title" || U == "subTitle" || U == "ctrTitle") return "h-mid";
			if (U == "sldNum") return "h-right";
		}
		if (l !== void 0) switch (l) {
			case "l": return f == "pregraph-rtl" ? "h-left-rtl" : "h-left";
			case "r": return f == "pregraph-rtl" ? "h-right-rtl" : "h-right";
			case "ctr": return "h-mid";
			default: return "h-" + l;
		}
	}
	function mp(e, d, t, U, f) {
		var r = x(e, [
			"a:pPr",
			"attrs",
			"rtl"
		]);
		if (r === void 0) {
			var l = oo(e, t, U, f), a = l.nodeLaout, i = l.nodeMaster;
			r = x(a, ["attrs", "rtl"]), r === void 0 && U != "shape" && (r = x(i, ["attrs", "rtl"]));
		}
		return r == "1" ? "pregraph-rtl" : r == "0" ? "pregraph-ltr" : "pregraph-inherit";
	}
	function y1(e, d, t, U) {
		var f = x(e, [
			"p:txBody",
			"a:bodyPr",
			"attrs",
			"anchor"
		]);
		return f === void 0 && (f = x(d, [
			"p:txBody",
			"a:bodyPr",
			"attrs",
			"anchor"
		]), f === void 0 && (f = x(t, [
			"p:txBody",
			"a:bodyPr",
			"attrs",
			"anchor"
		]), f === void 0 && (f = "t"))), f === "ctr" ? "v-mid" : f === "b" ? "v-down" : "v-up";
	}
	function D1(e, d, t) {
		return "content";
	}
	function xp(e, d) {
		return /^(zh|ja|ko)(-|$)/i.test(d || "") || /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(e || "");
	}
	function vp(e, d) {
		return rl.indexOf(d) !== -1 || /^(ar|fa|he|ur|dv)(-|$)/i.test(d || "") || /[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufeff]/.test(e || "");
	}
	function yp(e, d) {
		if (/^zh-(tw|hk|mo)/i.test(e || "")) return "Hant";
		if (/^zh/i.test(e || "") || /[\u3400-\u9fff]/.test(d || "")) return "Hans";
		if (/^ja/i.test(e || "") || /[\u3040-\u30ff]/.test(d || "")) return "Jpan";
		if (/^ko/i.test(e || "") || /[\uac00-\ud7af]/.test(d || "")) return "Hang";
		if (/^(ar|fa|ur|dv)/i.test(e || "") || /[\u0600-\u06ff]/.test(d || "")) return "Arab";
		if (/^he/i.test(e || "") || /[\u0590-\u05ff]/.test(d || "")) return "Hebr";
	}
	function Dl(e, d, t) {
		var U = yp(d, t), f = x(e, ["a:font"]);
		if (!(U === void 0 || f === void 0)) {
			f = f.constructor === Array ? f : [f];
			for (var r = 0; r < f.length; r++) if (x(f[r], ["attrs", "script"]) === U) return x(f[r], ["attrs", "typeface"]);
		}
	}
	function hc(e, d, t, U) {
		if (!(e === void 0 || e === "")) {
			var f = /^\+(mj|mn)-(lt|ea|cs)$/.exec(e);
			if (f === null) return e;
			var r = f[1] === "mj" ? "a:majorFont" : "a:minorFont", l = f[2] === "lt" ? "a:latin" : "a:" + f[2], a = x(d.themeContent, [
				"a:theme",
				"a:themeElements",
				"a:fontScheme",
				r
			]);
			return x(a, [
				l,
				"attrs",
				"typeface"
			]) || Dl(a, t, U);
		}
	}
	function U1(e, d, t, U, f) {
		var r = d === "major" ? "a:majorFont" : "a:minorFont", l = x(e.themeContent, [
			"a:theme",
			"a:themeElements",
			"a:fontScheme",
			r
		]);
		return x(l, [
			"a:" + t,
			"attrs",
			"typeface"
		]) || Dl(l, U, f);
	}
	function lc(e, d, t, U) {
		return e === void 0 ? {} : {
			latin: hc(x(e, [
				"a:latin",
				"attrs",
				"typeface"
			]), d, t, U),
			ea: hc(x(e, [
				"a:ea",
				"attrs",
				"typeface"
			]), d, t, U),
			cs: hc(x(e, [
				"a:cs",
				"attrs",
				"typeface"
			]), d, t, U),
			sym: hc(x(e, [
				"a:sym",
				"attrs",
				"typeface"
			]), d, t, U)
		};
	}
	function co(e, d) {
		Object.keys(d).forEach(function(t) {
			(e[t] === void 0 || e[t] === "") && d[t] !== void 0 && d[t] !== "" && (e[t] = d[t]);
		});
	}
	function Dp(e) {
		if (!(e === void 0 || e === "")) return /^(inherit|serif|sans-serif|monospace|cursive|fantasy|system-ui)$/i.test(e) ? e : "\"" + String(e).replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
	}
	function Up(e, d) {
		var t = x(d, ["attrs", "idx"]);
		return t === "major" || t === "minor" ? t : e == "title" || e == "subTitle" || e == "ctrTitle" ? "major" : "minor";
	}
	function _p(e, d, t, U, f, r, l, a, i) {
		var o = {};
		co(o, lc(x(e, ["a:rPr"]), t, r, f)), co(o, lc(x(l, ["a:defRPr"]), t, r, f)), co(o, lc(x(a, ["a:defRPr"]), t, r, f));
		var v = "a:lvl" + i + "pPr";
		co(o, lc(x(t.defaultTextStyle, [v, "a:defRPr"]), t, r, f));
		var y = Up(d, U);
		co(o, {
			latin: U1(t, y, "latin", r, f),
			ea: U1(t, y, "ea", r, f),
			cs: U1(t, y, "cs", r, f)
		});
		var _ = [
			o[vp(f, r) ? "cs" : xp(f, r) ? "ea" : "latin"],
			o.latin,
			o.ea,
			o.cs,
			o.sym
		], g = [];
		return _.forEach(function(p) {
			var m = Dp(p);
			m !== void 0 && g.indexOf(m) === -1 && g.push(m);
		}), g.length ? g.join(",") : "inherit";
	}
	async function Ul(e, d, t, U, f, r, l, a) {
		var i = x(e, ["a:rPr"]), o, v, V, y = "", _ = "";
		if (i !== void 0) {
			if (o = nn(i), o == "SOLID_FILL") {
				var g = i["a:solidFill"];
				v = Rt(g, void 0, void 0, a);
				var p = i["a:highlight"];
				p !== void 0 && (_ = Rt(p, void 0, void 0, a)), y = "solid";
			} else if (o == "PATTERN_FILL") {
				var m = i["a:pattFill"];
				v = lo(m, a), y = "pattern";
			} else if (o == "PIC_FILL") v = await br(i, "slideBg", a, void 0, void 0), y = "pic";
			else if (o == "GRADIENT_FILL") {
				var u = i["a:gradFill"];
				v = pc(u, a), y = "gradient";
			}
		}
		if (v === void 0 && x(t, ["a:lvl" + f + "pPr", "a:defRPr"]) !== void 0) {
			var D = x(t, ["a:lvl" + f + "pPr", "a:defRPr"]);
			if (o = nn(D), o == "SOLID_FILL") {
				var g = D["a:solidFill"];
				v = Rt(g, void 0, void 0, a);
				var p = D["a:highlight"];
				p !== void 0 && (_ = Rt(p, void 0, void 0, a)), y = "solid";
			} else if (o == "PATTERN_FILL") {
				var m = D["a:pattFill"];
				v = lo(m, a), y = "pattern";
			} else if (o == "PIC_FILL") v = await br(D, "slideBg", a, void 0, void 0), y = "pic";
			else if (o == "GRADIENT_FILL") {
				var u = D["a:gradFill"];
				v = pc(u, a), y = "gradient";
			}
		}
		if (v === void 0) {
			var h = x(d, ["p:style", "a:fontRef"]);
			if (h !== void 0) {
				v = Rt(h, void 0, void 0, a), v !== void 0 && (y = "solid");
				var p = h["a:highlight"];
				p !== void 0 && (_ = Rt(p, void 0, void 0, a));
			}
			v === void 0 && U !== void 0 && (v = Rt(U, void 0, void 0, a), v !== void 0 && (y = "solid"));
		}
		if (v === void 0) {
			var c = oo(d, r, l, a), b = c.nodeLaout, L = c.nodeMaster;
			if (b !== void 0) {
				var S = x(b, ["a:defRPr", "a:solidFill"]);
				if (S !== void 0) {
					v = Rt(S, void 0, void 0, a);
					var p = x(b, ["a:defRPr", "a:highlight"]);
					p !== void 0 && (_ = Rt(p, void 0, void 0, a)), y = "solid";
				}
			}
			if (v === void 0 && L !== void 0) {
				var R = x(L, ["a:defRPr", "a:solidFill"]);
				if (R !== void 0) {
					v = Rt(R, void 0, void 0, a);
					var p = x(L, ["a:defRPr", "a:highlight"]);
					p !== void 0 && (_ = Rt(p, void 0, void 0, a)), y = "solid";
				}
			}
		}
		var P = [], M = {}, ee = x(e, ["a:rPr", "a:ln"]), V = "";
		if (ee !== void 0 && ee["a:noFill"] === void 0) {
			var F = Un(e, d, !1, "text", a).split(" "), K = parseInt(F[0].substring(0, F[0].indexOf("px"))) + "px", k = F[2];
			y == "solid" ? (V = "-" + K + " 0 " + k + ", 0 " + K + " " + k + ", " + K + " 0 " + k + ", 0 -" + K + " " + k, P.push(V)) : M.border = K + " " + k;
		}
		var Q = x(e, [
			"a:rPr",
			"a:effectLst",
			"a:glow"
		]), J = "";
		if (Q !== void 0) {
			var n = Rt(Q, void 0, void 0, a), s = Q.attrs.rad ? Q.attrs.rad * A : 0;
			J = "0 0 " + s + "px #" + n + ", 0 0 " + s + "px #" + n + ", 0 0 " + s + "px #" + n + ", 0 0 " + s + "px #" + n + ", 0 0 " + s + "px #" + n + ", 0 0 " + s + "px #" + n + ", 0 0 " + s + "px #" + n, y == "solid" ? P.push(J) : P.push("drop-shadow(0 0 " + s / 3 + "px #" + n + ") drop-shadow(0 0 " + s * 2 / 3 + "px #" + n + ") drop-shadow(0 0 " + s + "px #" + n + ")");
		}
		var ie = x(e, [
			"a:rPr",
			"a:effectLst",
			"a:outerShdw"
		]), ce = "";
		if (ie !== void 0) {
			var I = Rt(ie, void 0, void 0, a), C = ie.attrs;
			C.algn;
			var Y = C.dir ? parseInt(C.dir) / 6e4 : 0, ve = parseInt(C.dist) * A;
			C.rotWithShape;
			var _e = C.blurRad ? parseInt(C.blurRad) * A + "px" : "";
			C.sx && parseInt(C.sx) / 1e5, C.sy && parseInt(C.sy) / 1e5;
			var Ye = ve * Math.sin(Y * Math.PI / 180), Je = ve * Math.cos(Y * Math.PI / 180);
			!isNaN(Ye) && !isNaN(Je) && (ce = Je + "px " + Ye + "px " + _e + " #" + I, y == "solid" ? P.push(ce) : P.push("drop-shadow(" + Je + "px " + Ye + "px " + _e + " #" + I + ")"));
		}
		var Ve = "", at;
		return y == "solid" ? (P.length > 0 && (Ve = P.join(",")), at = Ve + ";") : (P.length > 0 && (Ve = P.join(" ")), M.effcts = Ve, at = M), [
			v,
			at,
			y,
			_
		];
	}
	function _1(e, d, t, U, f, r) {
		var l = d !== void 0 ? d["a:lstStyle"] : void 0, a = "a:lvl" + U + "pPr", i = void 0, o, v;
		e["a:rPr"] !== void 0 && (i = parseInt(e["a:rPr"].attrs.sz) / 100), (isNaN(i) || i === void 0 && e["a:fld"] !== void 0) && (o = x(e["a:fld"], [
			"a:rPr",
			"attrs",
			"sz"
		]), i = parseInt(o) / 100), (isNaN(i) || i === void 0) && e["a:t"] === void 0 && (o = x(e["a:endParaRPr"], ["attrs", "sz"]), i = parseInt(o) / 100), (isNaN(i) || i === void 0) && l !== void 0 && (o = x(l, [
			a,
			"a:defRPr",
			"attrs",
			"sz"
		]), i = parseInt(o) / 100);
		var y = !1;
		d !== void 0 && x(d, ["a:bodyPr", "a:spAutoFit"]) !== void 0 && (y = !0), (isNaN(i) || i === void 0) && (o = x(r.slideLayoutTables, [
			"typeTable",
			f,
			"p:txBody",
			"a:lstStyle",
			a,
			"a:defRPr",
			"attrs",
			"sz"
		]), i = parseInt(o) / 100, v = x(r.slideLayoutTables, [
			"typeTable",
			f,
			"p:txBody",
			"a:lstStyle",
			a,
			"a:defRPr",
			"attrs",
			"kern"
		]), y && v !== void 0 && !isNaN(i) && i - parseInt(v) / 100 > 0 && (i = i - parseInt(v) / 100)), (isNaN(i) || i === void 0) && (o = x(r.slideMasterTables, [
			"typeTable",
			f,
			"p:txBody",
			"a:lstStyle",
			a,
			"a:defRPr",
			"attrs",
			"sz"
		]), v = x(r.slideMasterTables, [
			"typeTable",
			f,
			"p:txBody",
			"a:lstStyle",
			a,
			"a:defRPr",
			"attrs",
			"kern"
		]), o === void 0 && (f == "title" || f == "subTitle" || f == "ctrTitle" ? (o = x(r.slideMasterTextStyles, [
			"p:titleStyle",
			a,
			"a:defRPr",
			"attrs",
			"sz"
		]), v = x(r.slideMasterTextStyles, [
			"p:titleStyle",
			a,
			"a:defRPr",
			"attrs",
			"kern"
		])) : f == "body" || f == "obj" || f == "dt" || f == "sldNum" || f === "textBox" ? (o = x(r.slideMasterTextStyles, [
			"p:bodyStyle",
			a,
			"a:defRPr",
			"attrs",
			"sz"
		]), v = x(r.slideMasterTextStyles, [
			"p:bodyStyle",
			a,
			"a:defRPr",
			"attrs",
			"kern"
		])) : f == "shape" && (o = x(r.slideMasterTextStyles, [
			"p:otherStyle",
			a,
			"a:defRPr",
			"attrs",
			"sz"
		]), v = x(r.slideMasterTextStyles, [
			"p:otherStyle",
			a,
			"a:defRPr",
			"attrs",
			"kern"
		]), y = !1), o === void 0 && (o = x(r.defaultTextStyle, [
			a,
			"a:defRPr",
			"attrs",
			"sz"
		]), v = v === void 0 ? x(r.defaultTextStyle, [
			a,
			"a:defRPr",
			"attrs",
			"kern"
		]) : void 0, y = !1)), i = parseInt(o) / 100, y && v !== void 0 && !isNaN(i) && i - parseInt(v) / 100 > parseInt(v) / 100 && (i = i - parseInt(v) / 100));
		var _ = x(e, [
			"a:rPr",
			"attrs",
			"baseline"
		]);
		if (_ !== void 0 && !isNaN(i)) {
			var g = parseInt(_) / 1e5;
			i -= g;
		}
		if (!isNaN(i)) {
			var p = x(d, [
				"a:bodyPr",
				"a:normAutofit",
				"attrs",
				"fontScale"
			]);
			p !== void 0 && p != 0 && (i = Math.round(i * (p / 1e5)));
		}
		return isNaN(i) ? f == "br" ? "initial" : "inherit" : i * nc + "px";
	}
	function wp(e, d, t, U, f) {
		var r = x(e, [
			"a:rPr",
			"attrs",
			"b"
		]);
		return r === void 0 && (r = x(U, [
			"a:defRPr",
			"attrs",
			"b"
		])), r === void 0 && (r = x(f, [
			"a:defRPr",
			"attrs",
			"b"
		])), r === "1" || r === !0 ? "bold" : r === "0" || r === !1 ? "normal" : "inherit";
	}
	function kp(e, d, t, U, f) {
		var r = x(e, [
			"a:rPr",
			"attrs",
			"i"
		]);
		return r === void 0 && (r = x(U, [
			"a:defRPr",
			"attrs",
			"i"
		])), r === void 0 && (r = x(f, [
			"a:defRPr",
			"attrs",
			"i"
		])), r === "1" || r === !0 ? "italic" : r === "0" || r === !1 ? "normal" : "inherit";
	}
	function Tp(e, d, t) {
		if (e["a:rPr"] !== void 0) {
			var U = e["a:rPr"].attrs.u !== void 0 ? e["a:rPr"].attrs.u : "none", f = e["a:rPr"].attrs.strike !== void 0 ? e["a:rPr"].attrs.strike : "noStrike";
			return U != "none" && f == "noStrike" ? "underline" : U == "none" && f != "noStrike" ? "line-through" : U != "none" && f != "noStrike" ? "underline line-through" : "inherit";
		} else return "inherit";
	}
	function Lp(e, d, t, U) {
		var f = x(e, [
			"a:pPr",
			"attrs",
			"algn"
		]);
		if (f === void 0 && (f = x(d, [
			"a:pPr",
			"attrs",
			"algn"
		])), f === void 0) if (t == "title" || t == "ctrTitle" || t == "subTitle") {
			var r = 1, l = x(d, [
				"a:pPr",
				"attrs",
				"lvl"
			]);
			l !== void 0 && (r = parseInt(l) + 1);
			var a = "a:lvl" + r + "pPr";
			f = x(U, [
				"slideLayoutTables",
				"typeTable",
				t,
				"p:txBody",
				"a:lstStyle",
				a,
				"attrs",
				"algn"
			]), f === void 0 && (f = x(U, [
				"slideMasterTables",
				"typeTable",
				t,
				"p:txBody",
				"a:lstStyle",
				a,
				"attrs",
				"algn"
			]), f === void 0 && (f = x(U, [
				"slideMasterTextStyles",
				"p:titleStyle",
				a,
				"attrs",
				"algn"
			]), f === void 0 && t === "subTitle" && (f = x(U, [
				"slideMasterTextStyles",
				"p:bodyStyle",
				a,
				"attrs",
				"algn"
			]))));
		} else t == "body" ? f = x(U, [
			"slideMasterTextStyles",
			"p:bodyStyle",
			"a:lvl1pPr",
			"attrs",
			"algn"
		]) : f = x(U, [
			"slideMasterTables",
			"typeTable",
			t,
			"p:txBody",
			"a:lstStyle",
			"a:lvl1pPr",
			"attrs",
			"algn"
		]);
		var i = "inherit";
		if (f !== void 0) switch (f) {
			case "l":
				i = "left";
				break;
			case "r":
				i = "right";
				break;
			case "ctr":
				i = "center";
				break;
			case "just":
				i = "justify";
				break;
			case "dist":
				i = "justify";
				break;
			default: i = "inherit";
		}
		return i;
	}
	function Fp(e, d, t) {
		var U = x(e, [
			"a:rPr",
			"attrs",
			"baseline"
		]);
		return U === void 0 ? "baseline" : parseInt(U) / 1e3 + "%";
	}
	function ho(e, d) {
		var t = "";
		if (e["a:bottom"] !== void 0) {
			var U = { "p:spPr": { "a:ln": e["a:bottom"]["a:ln"] } }, f = Un(U, void 0, !1, "shape", d);
			t += f.replace("border", "border-bottom");
		}
		if (e["a:top"] !== void 0) {
			var U = { "p:spPr": { "a:ln": e["a:top"]["a:ln"] } }, f = Un(U, void 0, !1, "shape", d);
			t += f.replace("border", "border-top");
		}
		if (e["a:right"] !== void 0) {
			var U = { "p:spPr": { "a:ln": e["a:right"]["a:ln"] } }, f = Un(U, void 0, !1, "shape", d);
			t += f.replace("border", "border-right");
		}
		if (e["a:left"] !== void 0) {
			var U = { "p:spPr": { "a:ln": e["a:left"]["a:ln"] } }, f = Un(U, void 0, !1, "shape", d);
			t += f.replace("border", "border-left");
		}
		return t;
	}
	function Un(e, d, t, U, f) {
		var r, l;
		if (U == "shape" ? (r = "border: ", l = e["p:spPr"]["a:ln"]) : U == "text" && (r = "", l = e["a:rPr"]["a:ln"]), x(l, ["a:noFill"]) !== void 0) return "hidden";
		if (l == null) {
			var a = x(e, ["p:style", "a:lnRef"]);
			if (a !== void 0) {
				var i = x(a, ["attrs", "idx"]);
				l = f.themeContent["a:theme"]["a:themeElements"]["a:fmtScheme"]["a:lnStyleLst"]["a:ln"][Number(i) - 1];
			}
		}
		l ?? (r = "", l = e);
		var o;
		if (l !== void 0) {
			var v = parseInt(x(l, ["attrs", "w"])) / 12700;
			isNaN(v) || v < 1 ? r += "1.3333333333333333px " : r += v + "px ";
			var y = x(l, [
				"a:prstDash",
				"attrs",
				"val"
			]);
			y === void 0 && (y = x(l, ["attrs", "cmpd"]));
			var _ = "0";
			switch (y) {
				case "solid":
					r += "solid", _ = "0";
					break;
				case "dash":
					r += "dashed", _ = "5";
					break;
				case "dashDot":
					r += "dashed", _ = "5, 5, 1, 5";
					break;
				case "dot":
					r += "dotted", _ = "1, 5";
					break;
				case "lgDash":
					r += "dashed", _ = "10, 5";
					break;
				case "dbl":
					r += "double", _ = "0";
					break;
				case "lgDashDotDot":
					r += "dashed", _ = "10, 5, 1, 5, 1, 5";
					break;
				case "sysDash":
					r += "dashed", _ = "5, 2";
					break;
				case "sysDashDot":
					r += "dashed", _ = "5, 2, 1, 5";
					break;
				case "sysDashDotDot":
					r += "dashed", _ = "5, 2, 1, 5, 1, 5";
					break;
				case "sysDot":
					r += "dotted", _ = "2, 5";
					break;
				default: r += "solid", _ = "0";
			}
			var g = nn(l);
			g == "NO_FILL" ? o = t ? "none" : "" : g == "SOLID_FILL" ? o = Rt(l["a:solidFill"], void 0, void 0, f) : g == "GRADIENT_FILL" ? o = Bp(pc(l["a:gradFill"], f, e)) : g == "PATTERN_FILL" && (o = lo(l["a:pattFill"], f));
		}
		if (o === void 0) {
			var a = x(e, ["p:style", "a:lnRef"]);
			a !== void 0 && (o = Rt(a, void 0, void 0, f));
		}
		return o === void 0 ? t ? o = "none" : o = "hidden" : o = "#" + o, r += " " + o + " ", t ? {
			color: o,
			width: v,
			type: y,
			strokeDasharray: _
		} : r + ";";
	}
	async function Wp(e, d, t) {
		var U = e.slideContent, f = e.slideLayoutContent, r = e.slideMasterContent, l = x(f, [
			"p:sldLayout",
			"p:cSld",
			"p:spTree"
		]), a = x(r, [
			"p:sldMaster",
			"p:cSld",
			"p:spTree"
		]), i = x(U, [
			"p:sld",
			"attrs",
			"showMasterSp"
		]), o = x(f, [
			"p:sldLayout",
			"attrs",
			"showMasterSp"
		]), v = i !== void 0 ? i : o, y = !(v === "0" || v === "false"), _ = await _l(e, t) || "", g = "<div class='slide-background slide-background-" + t + "' style='position:absolute;top:0;left:0;overflow:hidden;z-index:0;width:" + d.width + "px; height:" + d.height + "px;" + _ + "'>";
		if (a !== void 0 && y) for (var p in a) if (a[p].constructor === Array) for (var m = 0; m < a[p].length; m++) {
			var u = x(a[p][m], [
				"p:nvSpPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]);
			g += await Or(p, a[p][m], a, e, "slideMasterBg");
		}
		else {
			var u = x(a[p], [
				"p:nvSpPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]);
			g += await Or(p, a[p], a, e, "slideMasterBg");
		}
		if (l !== void 0) for (var p in l) if (l[p].constructor === Array) for (var m = 0; m < l[p].length; m++) {
			var u = x(l[p][m], [
				"p:nvSpPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]);
			u != "pic" && (g += await Or(p, l[p][m], l, e, "slideLayoutBg"));
		}
		else {
			var u = x(l[p], [
				"p:nvSpPr",
				"p:nvPr",
				"p:ph",
				"attrs",
				"type"
			]);
			u != "pic" && (g += await Or(p, l[p], l, e, "slideLayoutBg"));
		}
		return g + "</div>";
	}
	function Cp(e) {
		var d = [];
		return e === void 0 ? d : (Object.keys(e).forEach(function(t) {
			var U = e[t];
			if (t != "attrs") if (U.constructor === Array) for (var f = 0; f < U.length; f++) {
				var r = {};
				r[t] = U[f], r.idex = Number(x(U[f], ["attrs", "order"])) || d.length + 1, r.attrs = { order: r.idex }, d.push(r);
			}
			else {
				var r = {};
				r[t] = U, r.idex = Number(x(U, ["attrs", "order"])) || d.length + 1, r.attrs = { order: r.idex }, d.push(r);
			}
		}), d.sort(function(t, U) {
			return t.idex - U.idex;
		}));
	}
	function Sp(e, d) {
		if (!(d == 0 || d == 1e3)) {
			var t = d > 1e3 ? "a:bgFillStyleLst" : "a:fillStyleLst", U = d > 1e3 ? d - 1e3 : d;
			return Cp(x(e.themeContent, [
				"a:theme",
				"a:themeElements",
				"a:fmtScheme",
				t
			]))[U - 1];
		}
	}
	async function gc(e, d, t, U, f, r, l) {
		if (e !== void 0) {
			var a = nn(e);
			if (a == "SOLID_FILL") {
				var i = e["a:solidFill"], o = Rt(i, d, t, f);
				return o !== void 0 ? "background: #" + o + ";" : void 0;
			} else {
				if (a == "GRADIENT_FILL") return as(e, t, U, f);
				if (a == "PIC_FILL") return await br(e, l || "themeBg", f, t, r);
				if (a == "PATTERN_FILL") {
					var v = lo(e["a:pattFill"], f);
					if (v !== void 0) {
						var y = "background: " + v[0] + ";";
						return v[1] !== null && v[1] !== void 0 && v[1] != "" && (y += "background-size:" + v[1] + ";"), v[2] !== null && v[2] !== void 0 && v[2] != "" && (y += "background-position:" + v[2] + ";"), y;
					}
				}
			}
		}
	}
	async function w1(e, d, t, U, f, r) {
		return await gc(Sp(f, e), d, t, U, f, r, "themeBg");
	}
	async function _l(e, d) {
		var t = e.slideContent, U = e.slideLayoutContent, f = e.slideMasterContent, r = x(t, [
			"p:sld",
			"p:cSld",
			"p:bg",
			"p:bgPr"
		]), l = x(t, [
			"p:sld",
			"p:cSld",
			"p:bg",
			"p:bgRef"
		]), a;
		if (r !== void 0) {
			var i = nn(r);
			if (i == "SOLID_FILL") {
				var o = r["a:solidFill"], v, y = x(t, [
					"p:sld",
					"p:clrMapOvr",
					"a:overrideClrMapping",
					"attrs"
				]);
				if (y !== void 0) v = y;
				else {
					var y = x(U, [
						"p:sldLayout",
						"p:clrMapOvr",
						"a:overrideClrMapping",
						"attrs"
					]);
					y !== void 0 ? v = y : v = x(f, [
						"p:sldMaster",
						"p:clrMap",
						"attrs"
					]);
				}
				var _ = Rt(o, v, void 0, e);
				a = "background: #" + _ + ";";
			} else i == "GRADIENT_FILL" ? a = as(r, void 0, f, e) : i == "PIC_FILL" && (a = await br(r, "slideBg", e, void 0, d));
		} else if (l !== void 0) {
			var v, y = x(t, [
				"p:sld",
				"p:clrMapOvr",
				"a:overrideClrMapping",
				"attrs"
			]);
			if (y !== void 0) v = y;
			else {
				var y = x(U, [
					"p:sldLayout",
					"p:clrMapOvr",
					"a:overrideClrMapping",
					"attrs"
				]);
				y !== void 0 ? v = y : v = x(f, [
					"p:sldMaster",
					"p:clrMap",
					"attrs"
				]);
			}
			var g = Rt(l, v, void 0, e), p = Number(l.attrs.idx);
			if (!(p == 0 || p == 1e3)) {
				if (p > 0 && p < 1e3) a = await w1(p, v, g, f, e, d);
				else if (p > 1e3) {
					var m = p - 1e3, u = e.themeContent["a:theme"]["a:themeElements"]["a:fmtScheme"]["a:bgFillStyleLst"], D = [];
					Object.keys(u).forEach(function(P) {
						var M = u[P];
						if (P != "attrs") if (M.constructor === Array) for (var ee = 0; ee < M.length; ee++) {
							var V = {};
							V[P] = M[ee], V.idex = M[ee].attrs.order, V.attrs = { order: M[ee].attrs.order }, D.push(V);
						}
						else {
							var V = {};
							V[P] = M, V.idex = M.attrs.order, V.attrs = { order: M.attrs.order }, D.push(V);
						}
					});
					var h = D.slice(0);
					h.sort(function(P, M) {
						return P.idex - M.idex;
					});
					var c = h[m - 1], i = nn(c);
					if (i == "SOLID_FILL") {
						var o = c["a:solidFill"], _ = Rt(o, v, void 0, e);
						a = "background: #" + _ + ";";
					} else i == "GRADIENT_FILL" ? a = as(c, g, f, e) : i == "PIC_FILL" ? a = await br(c, "themeBg", e, g, d) : i == "PATTERN_FILL" ? a = await gc(c, v, g, f, e, d, "themeBg") : console.log(i);
				}
			}
		} else {
			r = x(U, [
				"p:sldLayout",
				"p:cSld",
				"p:bg",
				"p:bgPr"
			]), l = x(U, [
				"p:sldLayout",
				"p:cSld",
				"p:bg",
				"p:bgRef"
			]);
			var v, y = x(U, [
				"p:sldLayout",
				"p:clrMapOvr",
				"a:overrideClrMapping",
				"attrs"
			]);
			if (y !== void 0 ? v = y : v = x(f, [
				"p:sldMaster",
				"p:clrMap",
				"attrs"
			]), r !== void 0) {
				var i = nn(r);
				if (i == "SOLID_FILL") {
					var o = r["a:solidFill"], _ = Rt(o, v, void 0, e);
					a = "background: #" + _ + ";";
				} else i == "GRADIENT_FILL" ? a = as(r, void 0, f, e) : i == "PIC_FILL" && (a = await br(r, "slideLayoutBg", e, void 0, d));
			} else if (l !== void 0) {
				var g = Rt(l, v, void 0, e), p = Number(l.attrs.idx);
				if (!(p == 0 || p == 1e3)) {
					if (p > 0 && p < 1e3) a = await w1(p, v, g, f, e, d);
					else if (p > 1e3) {
						var m = p - 1e3, u = e.themeContent["a:theme"]["a:themeElements"]["a:fmtScheme"]["a:bgFillStyleLst"], D = [];
						Object.keys(u).forEach(function(Q) {
							var J = u[Q];
							if (Q != "attrs") if (J.constructor === Array) for (var n = 0; n < J.length; n++) {
								var s = {};
								s[Q] = J[n], s.idex = J[n].attrs.order, s.attrs = { order: J[n].attrs.order }, D.push(s);
							}
							else {
								var s = {};
								s[Q] = J, s.idex = J.attrs.order, s.attrs = { order: J.attrs.order }, D.push(s);
							}
						});
						var h = D.slice(0);
						h.sort(function(Q, J) {
							return Q.idex - J.idex;
						});
						var c = h[m - 1], i = nn(c);
						if (i == "SOLID_FILL") {
							var o = c["a:solidFill"], _ = Rt(o, v, g, e);
							a = "background: #" + _ + ";";
						} else i == "GRADIENT_FILL" ? a = as(c, g, f, e) : i == "PIC_FILL" ? a = await br(c, "themeBg", e, g, d) : i == "PATTERN_FILL" ? a = await gc(c, v, g, f, e, d, "themeBg") : console.log(i);
					}
				}
			} else {
				r = x(f, [
					"p:sldMaster",
					"p:cSld",
					"p:bg",
					"p:bgPr"
				]), l = x(f, [
					"p:sldMaster",
					"p:cSld",
					"p:bg",
					"p:bgRef"
				]);
				var b = x(f, [
					"p:sldMaster",
					"p:clrMap",
					"attrs"
				]);
				if (r !== void 0) {
					var i = nn(r);
					if (i == "SOLID_FILL") {
						var o = r["a:solidFill"], _ = Rt(o, b, void 0, e);
						a = "background: #" + _ + ";";
					} else i == "GRADIENT_FILL" ? a = as(r, void 0, f, e) : i == "PIC_FILL" && (a = await br(r, "slideMasterBg", e, void 0, d));
				} else if (l !== void 0) {
					var g = Rt(l, b, void 0, e), p = Number(l.attrs.idx);
					if (!(p == 0 || p == 1e3)) {
						if (p > 0 && p < 1e3) a = await w1(p, b, g, f, e, d);
						else if (p > 1e3) {
							var m = p - 1e3, u = e.themeContent["a:theme"]["a:themeElements"]["a:fmtScheme"]["a:bgFillStyleLst"], D = [];
							Object.keys(u).forEach(function(Q) {
								var J = u[Q];
								if (Q != "attrs") if (J.constructor === Array) for (var n = 0; n < J.length; n++) {
									var s = {};
									s[Q] = J[n], s.idex = J[n].attrs.order, s.attrs = { order: J[n].attrs.order }, D.push(s);
								}
								else {
									var s = {};
									s[Q] = J, s.idex = J.attrs.order, s.attrs = { order: J.attrs.order }, D.push(s);
								}
							});
							var h = D.slice(0);
							h.sort(function(Q, J) {
								return Q.idex - J.idex;
							});
							var c = h[m - 1], i = nn(c);
							if (i == "SOLID_FILL") {
								var o = c["a:solidFill"], _ = Rt(o, b, g, e);
								a = "background: #" + _ + ";";
							} else i == "GRADIENT_FILL" ? a = as(c, g, f, e) : i == "PIC_FILL" ? a = await br(c, "themeBg", e, g, d) : i == "PATTERN_FILL" ? a = await gc(c, b, g, f, e, d, "themeBg") : console.log(i);
						}
					}
				}
			}
		}
		return a;
	}
	function as(e, d, t, U) {
		var f = "";
		if (e !== void 0) {
			var r = e["a:gradFill"], l = r["a:gsLst"]["a:gs"];
			l.constructor !== Array && (l = [l]);
			for (var a = x(t, [
				"p:sldMaster",
				"p:clrMap",
				"attrs"
			]), i = [], o = [], v = 0; v < l.length; v++) {
				var y = "", y = Rt(l[v], a, d, U), _ = x(l[v], ["attrs", "pos"]);
				_ !== void 0 ? o[v] = _ / 1e3 + "%" : o[v] = "", i[v] = "#" + y;
			}
			var g = r["a:lin"], p = 90;
			g !== void 0 && (p = Ms(g.attrs.ang), p = p + 90), f = "background: linear-gradient(" + p + "deg,";
			for (var v = 0; v < l.length; v++) v == l.length - 1 ? f += i[v] + " " + o[v] + ");" : f += i[v] + " " + o[v] + ", ";
		} else d !== void 0 && (f = "background: #" + d + ";");
		return f;
	}
	async function br(e, d, t, U, f) {
		var r, l = await wl(d, e["a:blipFill"], t);
		if (l !== void 0) {
			var a = x(e, ["attrs", "order"]), i = x(e, ["a:blipFill", "a:blip"]), o = x(i, ["a:duotone"]);
			if (o !== void 0) {
				var v = [];
				Object.keys(o).forEach(function(m) {
					if (m != "attrs") {
						var u = {};
						u[m] = o[m], v.push(Rt(u, void 0, U, t));
					}
				});
			}
			var y = x(i, ["a:alphaModFix", "attrs"]), _ = "";
			y !== void 0 && y.amt !== void 0 && y.amt != "" && (_ = "opacity:" + parseInt(y.amt) / 1e5 + ";");
			var g = x(e, [
				"a:blipFill",
				"a:tile",
				"attrs"
			]), p = "";
			return g !== void 0 && g.sx !== void 0 && (parseInt(g.sx) / 1e5, parseInt(g.sy) / 1e5, parseInt(g.tx) / 1e5, parseInt(g.ty) / 1e5, g.algn, g.flip, p += "background-repeat: round;"), x(e, ["a:blipFill", "a:stretch"]) !== void 0 && (p += "background-repeat: no-repeat;", p += "background-position: center;", p += "background-size: 100% 100%;"), r = "background: url(" + l + ");" + (a !== void 0 ? " z-index: " + a + ";" : "") + p + _, r;
		}
	}
	async function fc(e, d, t, U, f) {
		var r = nn(x(e, ["p:spPr"])), l, a;
		if (r == "NO_FILL") return t ? "none" : "";
		if (r == "SOLID_FILL" ? (a = e["p:spPr"]["a:solidFill"], l = Rt(a, void 0, void 0, U)) : r == "GRADIENT_FILL" ? (a = e["p:spPr"]["a:gradFill"], l = pc(a, U, e)) : r == "PATTERN_FILL" ? (a = e["p:spPr"]["a:pattFill"], l = lo(a, U)) : r == "PIC_FILL" && (a = e["p:spPr"]["a:blipFill"], l = await wl(f, a, U)), l === void 0) {
			var i = x(e, ["p:style", "a:fillRef"]), o = parseInt(x(e, [
				"p:style",
				"a:fillRef",
				"attrs",
				"idx"
			]));
			if (o == 0 || o == 1e3) return t ? "none" : "";
			l = Rt(i, void 0, void 0, U);
		}
		if (l === void 0) {
			if (x(e, ["p:spPr", "a:grpFill"]) !== void 0) return await fc({ "p:spPr": d["p:grpSpPr"] }, e, t, U, f);
			if (r == "NO_FILL") return t ? "none" : "";
		}
		if (l !== void 0) if (r == "GRADIENT_FILL") {
			if (t) return l;
			for (var v = l.color, y = "background: linear-gradient(" + l.rot + "deg,", _ = 0; _ < v.length; _++) _ == v.length - 1 ? y += "#" + v[_] + ");" : y += "#" + v[_] + ", ";
			return y;
		} else {
			if (r == "PIC_FILL") return t ? l : "background-image:url(" + l + ");";
			if (r == "PATTERN_FILL") {
				var g = "", p = "", m = "";
				return g = l[0], l[1] !== null && l[1] !== void 0 && l[1] != "" && (p = " background-size:" + l[1] + ";"), l[2] !== null && l[2] !== void 0 && l[2] != "" && (m = " background-position:" + l[2] + ";"), "background: " + g + ";" + p + m;
			} else return t ? (l = dt(l).toRgbString(), l) : "background-color: #" + l + ";";
		}
		else return t ? "none" : "";
	}
	function nn(e = {}) {
		var d = "";
		return e["a:noFill"] !== void 0 && (d = "NO_FILL"), e["a:solidFill"] !== void 0 && (d = "SOLID_FILL"), e["a:gradFill"] !== void 0 && (d = "GRADIENT_FILL"), e["a:pattFill"] !== void 0 && (d = "PATTERN_FILL"), e["a:blipFill"] !== void 0 && (d = "PIC_FILL"), e["a:grpFill"] !== void 0 && (d = "GROUP_FILL"), d;
	}
	function Ap(e) {
		return (e % 360 + 360) % 360;
	}
	function Mp(e, d) {
		var t = x(d, [
			"p:spPr",
			"a:xfrm",
			"attrs"
		]) || {}, U = t.flipH === "1", f = t.flipV === "1", r = e;
		return U && (r = 180 - r), f && (r = -r), Ap(r);
	}
	function Bp(e) {
		var d = e && e.color;
		if (!(!Array.isArray(d) || !d.length)) {
			var t = d[0], U = -1;
			return d.forEach(function(f) {
				var r = dt("#" + f), l = r.getAlpha();
				l > U && (t = r.toHex8(), U = l);
			}), t;
		}
	}
	function pc(e, d, t) {
		for (var U = gn(e["a:gsLst"]["a:gs"]), f = [], r = 0; r < U.length; r++) f[r] = Rt(U[r], void 0, void 0, d);
		var l = e["a:lin"], a = 0;
		return l !== void 0 && (a = Ms(l.attrs.ang) + 90), a = Mp(a, t), {
			color: f,
			rot: a
		};
	}
	async function wl(e, d, t) {
		var U, f = d["a:blip"].attrs["r:embed"], r;
		if (e == "slideBg" || e == "slide" ? r = x(t, [
			"slideResObj",
			f,
			"target"
		]) : e == "slideLayoutBg" ? r = x(t, [
			"layoutResObj",
			f,
			"target"
		]) : e == "slideMasterBg" ? r = x(t, [
			"masterResObj",
			f,
			"target"
		]) : e == "themeBg" ? r = x(t, [
			"themeResObj",
			f,
			"target"
		]) : e == "diagramBg" && (r = x(t, [
			"diagramResObj",
			f,
			"target"
		])), r !== void 0) {
			if (U = x(t, ["loaded-images", r]), U === void 0) {
				r = mc(r);
				var l = r.split(".").pop();
				if (l == "xml") return;
				U = await bl(l, await t.zip.file(r).async("arraybuffer")), zp(t, ["loaded-images", r], U);
			}
			return U;
		}
	}
	function lo(e, d) {
		var t = "", U = "", f = "", r = e["a:bgClr"], l = e["a:fgClr"];
		return f = e.attrs.prst, t = Rt(l, void 0, void 0, d), U = Rt(r, void 0, void 0, d), Ep(f, U, t);
	}
	function Ep(e, d, t) {
		switch (e) {
			case "smGrid": return ["linear-gradient(to right,  #" + t + " -1px, transparent 1px ), linear-gradient(to bottom,  #" + t + " -1px, transparent 1px)  #" + d + ";", "4px 4px"];
			case "dotGrid": return ["linear-gradient(to right,  #" + t + " -1px, transparent 1px ), linear-gradient(to bottom,  #" + t + " -1px, transparent 1px)  #" + d + ";", "8px 8px"];
			case "lgGrid": return ["linear-gradient(to right,  #" + t + " -1px, transparent 1.5px ), linear-gradient(to bottom,  #" + t + " -1px, transparent 1.5px)  #" + d + ";", "8px 8px"];
			case "wdUpDiag": return ["repeating-linear-gradient(-45deg, transparent 1px , transparent 4px, #" + t + " 7px)#" + d + ";"];
			case "dkUpDiag": return ["repeating-linear-gradient(-45deg, transparent 1px , #" + d + " 5px)#" + t + ";"];
			case "ltUpDiag": return ["repeating-linear-gradient(-45deg, transparent 1px , transparent 2px, #" + t + " 4px)#" + d + ";"];
			case "wdDnDiag": return ["repeating-linear-gradient(45deg, transparent 1px , transparent 4px, #" + t + " 7px)#" + d + ";"];
			case "dkDnDiag": return ["repeating-linear-gradient(45deg, transparent 1px , #" + d + " 5px)#" + t + ";"];
			case "ltDnDiag": return ["repeating-linear-gradient(45deg, transparent 1px , transparent 2px, #" + t + " 4px)#" + d + ";"];
			case "dkHorz": return ["repeating-linear-gradient(0deg, transparent 1px , transparent 2px, #" + d + " 7px)#" + t + ";"];
			case "ltHorz": return ["repeating-linear-gradient(0deg, transparent 1px , transparent 5px, #" + t + " 7px)#" + d + ";"];
			case "narHorz": return ["repeating-linear-gradient(0deg, transparent 1px , transparent 2px, #" + t + " 4px)#" + d + ";"];
			case "dkVert": return ["repeating-linear-gradient(90deg, transparent 1px , transparent 2px, #" + d + " 7px)#" + t + ";"];
			case "ltVert": return ["repeating-linear-gradient(90deg, transparent 1px , transparent 5px, #" + t + " 7px)#" + d + ";"];
			case "narVert": return ["repeating-linear-gradient(90deg, transparent 1px , transparent 2px, #" + t + " 4px)#" + d + ";"];
			case "lgCheck":
			case "smCheck":
				var f = "", U = "";
				return e == "lgCheck" ? (f = "8px 8px", U = "0 0, 4px 4px, 4px 4px, 8px 8px") : (f = "4px 4px", U = "0 0, 2px 2px, 2px 2px, 4px 4px"), [
					"linear-gradient(45deg,  #" + t + " 25%, transparent 0, transparent 75%,  #" + t + " 0), linear-gradient(45deg,  #" + t + " 25%, transparent 0, transparent 75%,  #" + t + " 0) #" + d + ";",
					f,
					U
				];
			case "dashUpDiag": return ["repeating-linear-gradient(152deg, #" + t + ", #" + t + " 5% , transparent 0, transparent 70%)#" + d + ";", "4px 4px"];
			case "dashDnDiag": return ["repeating-linear-gradient(45deg, #" + t + ", #" + t + " 5% , transparent 0, transparent 70%)#" + d + ";", "4px 4px"];
			case "diagBrick": return ["linear-gradient(45deg, transparent 15%,  #" + t + " 30%, transparent 30%), linear-gradient(-45deg, transparent 15%,  #" + t + " 30%, transparent 30%), linear-gradient(-45deg, transparent 65%,  #" + t + " 80%, transparent 0) #" + d + ";", "4px 4px"];
			case "horzBrick": return [
				"linear-gradient(335deg, #" + d + " 1.6px, transparent 1.6px), linear-gradient(155deg, #" + d + " 1.6px, transparent 1.6px), linear-gradient(335deg, #" + d + " 1.6px, transparent 1.6px), linear-gradient(155deg, #" + d + " 1.6px, transparent 1.6px) #" + t + ";",
				"4px 4px",
				"0 0.15px, 0.3px 2.5px, 2px 2.15px, 2.35px 0.4px"
			];
			case "dashVert": return ["linear-gradient(0deg,  #" + d + " 30%, transparent 30%),linear-gradient(90deg,transparent, transparent 40%, #" + t + " 40%, #" + t + " 60% , transparent 60%)#" + d + ";", "4px 4px"];
			case "dashHorz": return ["linear-gradient(90deg,  #" + d + " 30%, transparent 30%),linear-gradient(0deg,transparent, transparent 40%, #" + t + " 40%, #" + t + " 60% , transparent 60%)#" + d + ";", "4px 4px"];
			case "solidDmnd": return ["linear-gradient(135deg,  #" + t + " 25%, transparent 25%), linear-gradient(225deg,  #" + t + " 25%, transparent 25%), linear-gradient(315deg,  #" + t + " 25%, transparent 25%), linear-gradient(45deg,  #" + t + " 25%, transparent 25%) #" + d + ";", "8px 8px"];
			case "openDmnd": return ["linear-gradient(45deg, transparent 0%, transparent calc(50% - 0.5px),  #" + t + " 50%, transparent calc(50% + 0.5px),  transparent 100%), linear-gradient(-45deg, transparent 0%, transparent calc(50% - 0.5px) , #" + t + " 50%, transparent calc(50% + 0.5px),  transparent 100%) #" + d + ";", "8px 8px"];
			case "dotDmnd": return [
				"radial-gradient(#" + t + " 15%, transparent 0), radial-gradient(#" + t + " 15%, transparent 0) #" + d + ";",
				"4px 4px",
				"0 0, 2px 2px"
			];
			case "zigZag":
			case "wave":
				var f = "";
				return e == "zigZag" ? f = "0" : f = "1px", ["linear-gradient(135deg,  #" + t + " 25%, transparent 25%) 50px " + f + ", linear-gradient(225deg,  #" + t + " 25%, transparent 25%) 50px " + f + ", linear-gradient(315deg,  #" + t + " 25%, transparent 25%), linear-gradient(45deg,  #" + t + " 25%, transparent 25%) #" + d + ";", "4px 4px"];
			case "lgConfetti":
			case "smConfetti":
				var f = "";
				return e == "lgConfetti" ? f = "4px 4px" : f = "2px 2px", ["linear-gradient(135deg,  #" + t + " 25%, transparent 25%) 50px 1px, linear-gradient(225deg,  #" + t + " 25%, transparent 25%), linear-gradient(315deg,  #" + t + " 25%, transparent 25%) 50px 1px , linear-gradient(45deg,  #" + t + " 25%, transparent 25%) #" + d + ";", f];
			case "plaid": return ["linear-gradient(0deg, transparent, transparent 25%, #" + t + "33 25%, #" + t + "33 50%),linear-gradient(90deg, transparent, transparent 25%, #" + t + "66 25%, #" + t + "66 50%) #" + d + ";", "4px 4px"];
			case "sphere": return ["radial-gradient(#" + t + " 50%, transparent 50%),#" + d + ";", "4px 4px"];
			case "weave":
			case "shingle": return ["linear-gradient(45deg, #" + d + " 1.31px , #" + t + " 1.4px, #" + t + " 1.5px, transparent 1.5px, transparent 4.2px, #" + t + " 4.2px, #" + t + " 4.3px, transparent 4.31px), linear-gradient(-45deg,  #" + d + " 1.31px , #" + t + " 1.4px, #" + t + " 1.5px, transparent 1.5px, transparent 4.2px, #" + t + " 4.2px, #" + t + " 4.3px, transparent 4.31px) 0 4px, #" + d + ";", "4px 8px"];
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
				return ["radial-gradient(#" + t + " " + r[0] + ", transparent " + r[1] + "),#" + d + ";", r[2]];
			default: return [0, 0];
		}
	}
	function Rt(e, d, t, U) {
		if (e !== void 0) {
			var f = "", r;
			if (e["a:srgbClr"] !== void 0) r = e["a:srgbClr"], f = x(r, ["attrs", "val"]);
			else if (e["a:schemeClr"] !== void 0) r = e["a:schemeClr"], f = kl("a:" + x(r, ["attrs", "val"]), d, t, U);
			else if (e["a:scrgbClr"] !== void 0) {
				r = e["a:scrgbClr"];
				var l = r.attrs, a = l.r.indexOf("%") != -1 ? l.r.split("%").shift() : l.r, i = l.g.indexOf("%") != -1 ? l.g.split("%").shift() : l.g, o = l.b.indexOf("%") != -1 ? l.b.split("%").shift() : l.b;
				f = Cs(255 * (Number(a) / 100)) + Cs(255 * (Number(i) / 100)) + Cs(255 * (Number(o) / 100));
			} else if (e["a:prstClr"] !== void 0) r = e["a:prstClr"], f = Pp(x(r, ["attrs", "val"]));
			else if (e["a:hslClr"] !== void 0) {
				r = e["a:hslClr"];
				var l = r.attrs, v = Ip(Number(l.hue) / 1e5, Number(l.sat.indexOf("%") != -1 ? l.sat.split("%").shift() : l.sat) / 100, Number(l.lum.indexOf("%") != -1 ? l.lum.split("%").shift() : l.lum) / 100);
				f = Cs(v.r) + Cs(v.g) + Cs(v.b);
			} else if (e["a:sysClr"] !== void 0) {
				r = e["a:sysClr"];
				var y = x(r, ["attrs", "lastClr"]);
				y !== void 0 && (f = y);
			}
			var _ = !1, g = parseInt(x(r, [
				"a:alpha",
				"attrs",
				"val"
			])) / 1e5;
			if (!isNaN(g)) {
				var p = dt(f);
				p.setAlpha(g), f = p.toHex8(), _ = !0;
			}
			var m = parseInt(x(r, [
				"a:hueMod",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(m) || (f = Np(f, m, _));
			var u = parseInt(x(r, [
				"a:lumMod",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(u) || (f = Gp(f, u, _));
			var D = parseInt(x(r, [
				"a:lumOff",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(D) || (f = jp(f, D, _));
			var h = parseInt(x(r, [
				"a:satMod",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(h) || (f = Hp(f, h, _));
			var c = parseInt(x(r, [
				"a:shade",
				"attrs",
				"val"
			])) / 1e5;
			isNaN(c) || (f = Rp(f, c, _));
			var b = parseInt(x(r, [
				"a:tint",
				"attrs",
				"val"
			])) / 1e5;
			return isNaN(b) || (f = Op(f, b, _)), f;
		}
	}
	function Cs(e) {
		for (var d = e.toString(16); d.length < 2;) d = "0" + d;
		return d;
	}
	function Ip(e, d, t) {
		var U, f, r, l, a;
		return e = e / 60, t <= .5 ? f = t * (d + 1) : f = t + d - t * d, U = t * 2 - f, r = k1(U, f, e + 2) * 255, l = k1(U, f, e) * 255, a = k1(U, f, e - 2) * 255, {
			r,
			g: l,
			b: a
		};
	}
	function k1(e, d, t) {
		return t < 0 && (t += 6), t >= 6 && (t -= 6), t < 1 ? (d - e) * t + e : t < 3 ? d : t < 4 ? (d - e) * (4 - t) + e : e;
	}
	function Pp(e) {
		var d, t = [
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
		], U = [
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
		], f = t.indexOf(e);
		return f != -1 && (d = U[f]), d;
	}
	function kl(e, d, t, U) {
		var f;
		if (d !== void 0) f = d;
		else {
			var r = x(U.slideContent, [
				"p:sld",
				"p:clrMapOvr",
				"a:overrideClrMapping",
				"attrs"
			]);
			if (r !== void 0) f = r;
			else {
				var r = x(U.slideLayoutContent, [
					"p:sldLayout",
					"p:clrMapOvr",
					"a:overrideClrMapping",
					"attrs"
				]);
				r !== void 0 ? f = r : f = x(U.slideMasterContent, [
					"p:sldMaster",
					"p:clrMap",
					"attrs"
				]);
			}
		}
		var l = e.substr(2);
		if (l == "phClr" && t !== void 0) i = t;
		else {
			if (f !== void 0) switch (l) {
				case "tx1":
				case "tx2":
				case "bg1":
				case "bg2":
					e = "a:" + f[l];
					break;
			}
			else switch (l) {
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
			var a = x(U.themeContent, [
				"a:theme",
				"a:themeElements",
				"a:clrScheme",
				e
			]), i = x(a, [
				"a:srgbClr",
				"attrs",
				"val"
			]);
			i === void 0 && a !== void 0 && (i = x(a, [
				"a:sysClr",
				"attrs",
				"lastClr"
			]));
		}
		return i;
	}
	function Ss(e) {
		var d = new Array();
		if (e === void 0) return d;
		if (e["c:xVal"] !== void 0) {
			var t = new Array();
			As(e["c:xVal"]["c:numRef"]["c:numCache"]["c:pt"], function(U, f) {
				return t.push(parseFloat(U["c:v"])), "";
			}), d.push(t), t = new Array(), As(e["c:yVal"]["c:numRef"]["c:numCache"]["c:pt"], function(U, f) {
				return t.push(parseFloat(U["c:v"])), "";
			}), d.push(t);
		} else As(e, function(U, f) {
			var r = new Array(), l = x(U, [
				"c:tx",
				"c:strRef",
				"c:strCache",
				"c:pt",
				"c:v"
			]) || f, a = {};
			return x(U, [
				"c:cat",
				"c:strRef",
				"c:strCache",
				"c:pt"
			]) !== void 0 ? As(U["c:cat"]["c:strRef"]["c:strCache"]["c:pt"], function(i, o) {
				return a[i.attrs.idx] = i["c:v"], "";
			}) : x(U, [
				"c:cat",
				"c:numRef",
				"c:numCache",
				"c:pt"
			]) !== void 0 && As(U["c:cat"]["c:numRef"]["c:numCache"]["c:pt"], function(i, o) {
				return a[i.attrs.idx] = i["c:v"], "";
			}), x(U, [
				"c:val",
				"c:numRef",
				"c:numCache",
				"c:pt"
			]) !== void 0 && As(U["c:val"]["c:numRef"]["c:numCache"]["c:pt"], function(i, o) {
				return r.push({
					x: i.attrs.idx,
					y: parseFloat(i["c:v"])
				}), "";
			}), d.push({
				key: l,
				values: r,
				xlabels: a
			}), "";
		});
		return d;
	}
	function x(e, d) {
		if (d.constructor !== Array) throw Error("Error of path type! path is not array.");
		if (e == null) return;
		let t = d.length;
		for (let U = 0; U < t; U++) if (e = e[d[U]], e == null) return;
		return e;
	}
	function zp(e, d, t) {
		if (d.constructor !== Array) throw Error("Error of path type! path is not array.");
		e !== void 0 && (Object.prototype.set = function(U, f) {
			for (var r = this, l = U.length, a = 0; a < l; a++) {
				var i = U[a];
				r[i] === void 0 && (a == l - 1 ? r[i] = f : r[i] = {}), r = r[i];
			}
			return r;
		}, e.set(d, t));
	}
	function As(e, d) {
		if (e !== void 0) {
			var t = "";
			if (e.constructor === Array) for (var U = e.length, f = 0; f < U; f++) t += d(e[f], f);
			else t += d(e, 0);
			return t;
		}
	}
	function Rp(e, d, t) {
		var U = dt(e).toHsl();
		d >= 1 && (d = 1);
		var f = Math.min(U.l * d, 1);
		return t ? dt({
			h: U.h,
			s: U.s,
			l: f,
			a: U.a
		}).toHex8() : dt({
			h: U.h,
			s: U.s,
			l: f,
			a: U.a
		}).toHex();
	}
	function Op(e, d, t) {
		var U = dt(e).toHsl();
		d >= 1 && (d = 1);
		var f = U.l * d + (1 - d);
		return t ? dt({
			h: U.h,
			s: U.s,
			l: f,
			a: U.a
		}).toHex8() : dt({
			h: U.h,
			s: U.s,
			l: f,
			a: U.a
		}).toHex();
	}
	function jp(e, d, t) {
		var U = dt(e).toHsl(), f = d + U.l;
		return f >= 1 ? t ? dt({
			h: U.h,
			s: U.s,
			l: 1,
			a: U.a
		}).toHex8() : dt({
			h: U.h,
			s: U.s,
			l: 1,
			a: U.a
		}).toHex() : t ? dt({
			h: U.h,
			s: U.s,
			l: f,
			a: U.a
		}).toHex8() : dt({
			h: U.h,
			s: U.s,
			l: f,
			a: U.a
		}).toHex();
	}
	function Gp(e, d, t) {
		var U = dt(e).toHsl(), f = U.l * d;
		return f >= 1 && (f = 1), t ? dt({
			h: U.h,
			s: U.s,
			l: f,
			a: U.a
		}).toHex8() : dt({
			h: U.h,
			s: U.s,
			l: f,
			a: U.a
		}).toHex();
	}
	function Np(e, d, t) {
		var U = dt(e).toHsl(), f = U.h * d;
		return f >= 360 && (f = f - 360), t ? dt({
			h: cocacl_h,
			s: U.s,
			l: U.l,
			a: U.a
		}).toHex8() : dt({
			h: f,
			s: U.s,
			l: U.l,
			a: U.a
		}).toHex();
	}
	function Hp(e, d, t) {
		var U = dt(e).toHsl(), f = U.s * d;
		return f >= 1 && (f = 1), t ? dt({
			h: U.h,
			s: f,
			l: U.l,
			a: U.a
		}).toHex8() : dt({
			h: U.h,
			s: f,
			l: U.l,
			a: U.a
		}).toHex();
	}
	function Ms(e) {
		return e == "" || e == null ? 0 : Math.round(e / 6e4);
	}
	function uc(e) {
		var d = "";
		switch (e.toLowerCase()) {
			case "jpg":
			case "jpeg":
				d = "image/jpeg";
				break;
			case "png":
				d = "image/png";
				break;
			case "gif":
				d = "image/gif";
				break;
			case "emf":
				d = "image/x-emf";
				break;
			case "wmf":
				d = "image/x-wmf";
				break;
			case "svg":
				d = "image/svg+xml";
				break;
			case "mp4":
				d = "video/mp4";
				break;
			case "webm":
				d = "video/webm";
				break;
			case "ogg":
				d = "video/ogg";
				break;
			case "avi":
				d = "video/avi";
				break;
			case "mpg":
				d = "video/mpg";
				break;
			case "wmv":
				d = "video/wmv";
				break;
			case "mp3":
				d = "audio/mpeg";
				break;
			case "wav":
				d = "audio/wav";
				break;
			case "tif":
			case "tiff":
				d = "image/tiff";
				break;
		}
		return d;
	}
	function Zp(e, d, t, U, f) {
		var r = Xp(U.length - 2), l = "", a = d, i = e, o = "", v = Jp(t, a, i), y = v[0], _ = v[1], g = v[2], p = v[3], m = r.length, u = m < 20 ? 100 : 1e3;
		l = " gradientUnits=\"userSpaceOnUse\" x1=\"" + y + "%\" y1=\"" + _ + "%\" x2=\"" + g + "%\" y2=\"" + p + "%\"", l = "<linearGradient id=\"linGrd_" + f + "\"" + l + `>
`, o += l;
		for (var D = 0; D < m; D++) {
			var h = dt("#" + U[D]), c = h.getAlpha();
			o += "<stop offset=\"" + Math.round(parseFloat(r[D]) / 100 * u) / u + "\" style=\"stop-color:" + h.toHexString() + "; stop-opacity:" + c + ";\"", o += `/>
`;
		}
		return o += `</linearGradient>
`, o;
	}
	function Xp(e) {
		var d = ["0%", "100%"];
		if (e == 0) return d;
		for (var t = e; t--;) {
			var U = 100 - 100 / (e + 1) * (t + 1) + "%";
			d.splice(-1, 0, U);
		}
		return d;
	}
	function Jp(e, d, t) {
		var U = parseFloat(t), f = parseFloat(d), r = parseFloat(e), l = 2, a = 2, i = U / 2, o = f / 2, m = 2, u = 2, D = 2, h = 2, v = (r % 360 + 360) % 360, y = (360 - v) * Math.PI / 180, _ = Math.tan(y), g = o - _ * i;
		v == 0 ? (m = U, u = o, D = 0, h = o) : v < 90 ? (a = U, l = 0) : v == 90 ? (m = i, u = 0, D = i, h = f) : v < 180 ? (a = 0, l = 0) : v == 180 ? (m = 0, u = o, D = U, h = o) : v < 270 ? (a = 0, l = f) : v == 270 ? (m = i, u = f, D = i, h = 0) : (a = U, l = f);
		var p = l + a / _, m = m == 2 ? _ * (p - g) / (Math.pow(_, 2) + 1) : m, u = u == 2 ? _ * m + g : u, D = D == 2 ? U - m : D, h = h == 2 ? f - u : h;
		return [
			Math.round(D / U * 100 * 100) / 100,
			Math.round(h / f * 100 * 100) / 100,
			Math.round(m / U * 100 * 100) / 100,
			Math.round(u / f * 100 * 100) / 100
		];
	}
	async function Yp(e, d, t, U) {
		let [f, r] = await $p(d);
		var l = e["p:spPr"]["a:blipFill"], a = x(l, ["a:tile", "attrs"]);
		if (a !== void 0 && a.sx !== void 0) var i = parseInt(a.sx) / 1e5 * f, o = parseInt(a.sy) / 1e5 * r;
		let v = e["p:spPr"]["a:blipFill"]["a:blip"];
		var y = x(v, ["a:alphaModFix", "attrs"]), _ = "";
		if (y !== void 0 && y.amt !== void 0 && y.amt != "" && (_ = "opacity='" + parseInt(y.amt) / 1e5 + "'"), i !== void 0 && i != 0) var g = "<pattern id=\"imgPtrn_" + t + "\" x=\"0\" y=\"0\"  width=\"" + i + "\" height=\"" + o + "\" patternUnits=\"userSpaceOnUse\">";
		else var g = "<pattern id=\"imgPtrn_" + t + "\"  patternContentUnits=\"objectBoundingBox\"  width=\"1\" height=\"1\">";
		var p = x(v, ["a:duotone"]), m = "", u = "";
		if (p !== void 0) {
			var D = [];
			Object.keys(p).forEach(function(h) {
				if (h != "attrs") {
					var c = {};
					c[h] = p[h];
					var b = dt("#" + Rt(c, void 0, void 0, U));
					D.push(b.toRgb());
				}
			}), D.length == 2 && (m = "<filter id=\"svg_image_duotone\"> <feColorMatrix type=\"matrix\" values=\".33 .33 .33 0 0.33 .33 .33 0 0.33 .33 .33 0 00 0 0 1 0\"></feColorMatrix><feComponentTransfer color-interpolation-filters=\"sRGB\"><feFuncR type=\"table\" tableValues=\"" + D[0].r / 255 + " " + D[1].r / 255 + "\"></feFuncR><feFuncG type=\"table\" tableValues=\"" + D[0].g / 255 + " " + D[1].g / 255 + "\"></feFuncG><feFuncB type=\"table\" tableValues=\"" + D[0].b / 255 + " " + D[1].b / 255 + "\"></feFuncB></feComponentTransfer> </filter>"), u = "filter=\"url(#svg_image_duotone)\"", g += m;
		}
		return d = mc(d), i !== void 0 && i != 0 ? g += "<image  xlink:href=\"" + d + "\" x=\"0\" y=\"0\" width=\"" + i + "\" height=\"" + o + "\" " + _ + " " + u + "></image>" : g += "<image  xlink:href=\"" + d + "\" preserveAspectRatio=\"none\" width=\"1\" height=\"1\" " + _ + " " + u + "></image>", g += "</pattern>", g;
	}
	async function $p(e) {
		try {
			let d = await self.createImageBitmap(qp(e));
			return [d.width, d.height];
		} catch {
			return [1, 1];
		}
	}
	function qp(e) {
		let d = e.split(","), t = d[0].match(/:(.*?);/)[1], U = atob(d[1]), f = U.length, r = new Uint8Array(f);
		for (; f--;) r[f] = U.charCodeAt(f);
		return new Blob([r], { type: t });
	}
	function bc(e) {
		for (var d = "", t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", U = new Uint8Array(e), f = U.byteLength, r = f % 3, l = f - r, a, i, o, v, y, _ = 0; _ < l; _ = _ + 3) y = U[_] << 16 | U[_ + 1] << 8 | U[_ + 2], a = (y & 16515072) >> 18, i = (y & 258048) >> 12, o = (y & 4032) >> 6, v = y & 63, d += t[a] + t[i] + t[o] + t[v];
		return r == 1 ? (y = U[l], a = (y & 252) >> 2, i = (y & 3) << 4, d += t[a] + t[i] + "==") : r == 2 && (y = U[l] << 8 | U[l + 1], a = (y & 64512) >> 10, i = (y & 1008) >> 4, o = (y & 15) << 2, d += t[a] + t[i] + t[o] + "="), d;
	}
	function Vp(e) {
		return /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/.test(e);
	}
	function T1(e) {
		return e.substr((~-e.lastIndexOf(".") >>> 0) + 2);
	}
	function mc(e) {
		var d = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;",
			"'": "&#039;"
		};
		return e.replace(/[&<>"']/g, function(t) {
			return d[t];
		});
	}
	function Kp(e, d) {
		e(async ({ type: f, data: r, options: l, IE11: a }) => {
			if (f === "processPPTX") try {
				dc.settings = l, dc.processFullTheme = l.themeProcess, dc.IE11 = a, await U(r);
			} catch (i) {
				console.error("AN ERROR HAPPENED DURING processPPTX", i), d({
					type: "ERROR",
					data: i.toString()
				});
			}
		}, (f) => {
			d(f);
		});
		async function t(f) {
			return f.byteLength < 10 ? console.error("读取pptx文件失败！") : t2.default.loadAsync(f);
		}
		async function U(f) {
			let r = await t(f), l = /* @__PURE__ */ new Date(), a = (p) => {
				i[p] && o === p && (d(i[o++]), delete i[p], a(o));
			}, i = {}, o = -1;
			r.file("docProps/thumbnail.jpeg") ? d({
				type: "pptx-thumb",
				data: await r.file("docProps/thumbnail.jpeg").async("base64"),
				slide_num: o++
			}) : o = 0;
			let v = await I2(r), y = await P2(r);
			dc.tableStyles = await ni(r, "ppt/tableStyles.xml"), console.log("slideSize: ", y), d({
				type: "slideSize",
				data: y,
				slide_num: o++
			});
			let _ = v.slides, g = _.length;
			for (let p = 0; p < g; p++) {
				let m = _[p], u = m.includes("/") ? m.lastIndexOf("/") + 1 : 0, D = m.includes(".") ? m.lastIndexOf(".") : m.length, h = m.substring(u, D), c = h && h.includes("slide") ? Number(h.substr(5)) : 1, b = {
					type: "slide",
					data: await z2(r, m, p, y),
					slide_num: c,
					file_name: h
				};
				o === c ? (d(b), a(++o)) : i[c] = b, d({
					type: "progress-update",
					slide_num: g + p + 1,
					data: (p + 1) * 100 / g
				});
			}
			return d({
				type: "globalCSS",
				data: lp()
			}), d({
				type: "ExecutionTime",
				data: /* @__PURE__ */ new Date() - l,
				charts: al
			}), i;
		}
	}
	Kp((e, d) => {
		self.onmessage = (t) => e(t.data), self.onerror = (t) => d(t);
	}, (e) => self.postMessage(e));
})();
