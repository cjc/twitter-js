module.exports = {};
module.exports.createPost = function(filebuf, name, filename, type) {
  var boundary = '----WebKitFormBoundaryVKiDTIiEWXTPeyII';
  var contenttype ="multipart/form-data;boundary=" + boundary;

  var body = "--" + boundary + "\r\n";
  body += 'Content-Disposition: form-data; name="' + name + '"; filename="' + filename + '"\r\n';
  body += 'Content-Type: ' + type + '\r\n\r\n';
  var footer = '\r\n';
  footer += '--' + boundary + '--\r\n';

  var pb = new Buffer(Buffer.byteLength(body,"ascii") + filebuf.length + Buffer.byteLength(footer,"ascii"));
  var counter = pb.write(body, 0, 'ascii');
  counter += filebuf.copy(pb, counter, 0, filebuf.length);
  counter += pb.write(footer, counter, "ascii");

  return {contenttype: contenttype, body: pb};
}
