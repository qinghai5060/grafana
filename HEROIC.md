# Getting start with Heroic

Check out, build Heroic, and fire up the Shell:

```bash
$ git clone https://github.com/spotify/heroic ./heroic
$ cd ./heroic
$ mvn clean package -D findbugs.skip=true -D checkstyle.skip=true -D maven.test.skip=true
$ tools/heroic-shell -P memory --server
...
heroic>
```

In the shell, run the `load-generated` command. This will generate a bunch of
random data in the in-memory database:

```bash
heroic> load-generated
...
```

Checkout, and build my (udoprog's) branch of Grafana:

```bash
$ git clone -b heroic-support https://github.com/udoprog/grafana ./grafana
$ cd ./grafana
... build grafana using their instructions
$ ./bin/grafana-server
```

Now you should have a `Heroic` datasource available for configuration, point it
to `http://localhost:8080`.

You can set the title to something containing tags, like:
`$what on $host (role: $role)`

The following is an example query you can paste into the query textarea:

```
max by host
where
  role = database
  and what = teleported-goats
```

Or average by what, and then sum by role:

```
(average by what | sum) by role
```

![Example Heroi](heroic.png)
