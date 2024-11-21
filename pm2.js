module.exports = {
    apps : [{
        name   : "remote server",
        script : "./index.js",
        merge_logs : true,
        cwd : "/tmp",
        out_file : "/tmp/remote-server.log",
        error_file : "/tmp/remote-server.log"
    }]
}