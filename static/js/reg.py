import SocketServer
import SimpleHTTPServer
# DELETE THIS
import json

class Reply(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def do_GET(self):
    # query arrives in self.path; return anything, e.g.,
    self.wfile.write("query was %s\n" % self.path)

def main():
  # read and parse reg.json
  SocketServer.ForkingTCPServer(('', 8080), Reply).serve_forever()

main()