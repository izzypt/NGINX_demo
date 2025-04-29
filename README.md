# NGINX

# commands

- [nginx -T](#nginx-t) - tests your Nginx configuration for errors and then shows you the complete, merged configuration it would actually use - a "configuration check and preview" command .


<a id="nginx-t"></a>
### nginx -T

`nginx -T` performs two key actions:

1.  **Configuration Syntax and Logic Validation:** It parses your main `nginx.conf` and all included configuration files, checking for syntactical correctness (e.g., proper use of directives, semicolons, block structures) and basic logical consistency. This includes verifying file paths in directives like `include`, `root`, `access_log`, and `error_log`. If any errors are detected during this parsing phase, Nginx will output specific error messages indicating the file and line number of the issue, and the command will exit with a non-zero status code.

2.  **Full Configuration Tree Output:** If the initial validation passes, `nginx -T` proceeds to process the entire configuration. This involves resolving `include` directives, applying default values to unspecified parameters, and effectively merging all the configuration snippets into a single, coherent configuration structure that Nginx would load into memory. The command then outputs this complete, flattened configuration to the standard output. This output reflects the final state of all directives and their values as they would be applied by the Nginx worker processes.

Essentially, `nginx -T` simulates the initial stages of Nginx startup, specifically the configuration loading and parsing phase. It allows administrators to inspect the final, consolidated configuration without actually starting or reloading the Nginx service, thus preventing potential service disruptions due to configuration errors. The output is a direct representation of Nginx's internal configuration tree.

**Scenario 1: Valid Configuration**

Let's say you have a basic `nginx.conf` and a site configuration in `sites-enabled/mysite.conf`. If both files have correct syntax, running `nginx -T` might produce output like this (the actual configuration will be much longer):

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
# configuration file /etc/nginx/nginx.conf:
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*; # Here's where mysite.conf gets included
}

# configuration file /etc/nginx/sites-enabled/mysite.conf:
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

The key here is the initial "syntax is ok" and "test is successful" messages, followed by the complete, merged configuration. Notice how the contents of `/etc/nginx/sites-enabled/mysite.conf` are included within the `http` block in the final output.

**Scenario 2: Syntax Error**

Imagine you accidentally forget a semicolon in your `sites-enabled/mysite.conf`:

```nginx
server {
    listen 80
    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Running `nginx -T` would now output an error message:

```
nginx: [emerg] directive "listen" has no arguments in /etc/nginx/sites-enabled/mysite.conf:2
nginx: configuration file /etc/nginx/nginx.conf test failed
```

This clearly points out the error: the `listen` directive on line 2 of `/etc/nginx/sites-enabled/mysite.conf` is missing its port number argument and the required semicolon. The "test failed" message indicates that Nginx would refuse to load this configuration.

**Scenario 3: Invalid File Path**

Suppose you have a typo in the `access_log` directive in your main `nginx.conf`:

```nginx
http {
    # ... other directives ...
    access_log /var/log/nginx/accsss.log combined; # Typo here
    # ...
}
```

Running `nginx -T` might still show "syntax is ok" because the directive itself is syntactically correct. However, when Nginx tries to apply this configuration, it might encounter issues. While `-T` primarily focuses on syntax and basic logic, it might not always catch all runtime errors related to invalid paths. However, it's still valuable for catching the more obvious configuration mistakes.

**Key Takeaway from Examples:**

* `nginx -T` helps you see the final, combined configuration.
* It's excellent for catching syntax errors that would prevent Nginx from starting or reloading.
* The error messages are usually quite informative, pointing to the specific file and line number with the problem.

By using `nginx -T` regularly, especially after making configuration changes, you can significantly reduce the risk of unexpected downtime and make debugging much easier.

---

Other cool articles:

- https://medium.com/@ksaquib/nginx-zero-to-hero-your-ultimate-guide-from-beginner-to-advanced-mastery-57e2dad6a77a

### NGINX as a webserver.

Back in the day, when the internet was still simple, with less users, the basic use case was:

- a browser requestes a web page from a web server (web server refers to both the physical machine and software running on the machine)

- The web server assembled the page and send it back to the browser, which then displays it to the user.

NGINX would be this server software that responds to client HTTP requests.

![NGINX web server](images/image.png)

### NGINX as a a proxy server.

![nginx_proxy_functionalities](images/image-8.png)

When web became popular, we have thousands or millions of requests per website. Imagine one single server handling millions of requests...

![millions-of-requests](images/image-1.png)

We need a few more servers to handle the load, so we add 10 NGINX webservers..

But now we need something that determines where requests from the browser end. Which one of those 10 servers will handle them.

This is where load balancing comes in.. We can use another NGINX as a load balances that proxies the requests to those 10 servers.

(proxy = "acting on behalf of another")
(proxy server = "intermediary server that forwards client requests to other servers")


![NGINX_load_balancing](images/image-2.png)

The load is distributed based on whichever algorithm was defined on it. Some examples are:

- lest connections (routes traffic to the server with the fewest active connections)
- round robin (distributes client requests in a sequential, cyclical manner to each server in the group)

### Loadbalancing is just one functionality of a proxy server. Let's look at caching now

Imagine that a New York Times article comes out and million of people open it. The normal flow would be:

- Every time a request landed with one of the web servers, it would assemble the response (put images together, get them from database, add all links, etc..) and it would happen millions of times for each request. 

![caching NGINX](images/image-3.png)

That seems pretty inneficient. Caching allow us to do the heavy lifting only once (get all the data from db, put the text together, images, etc..) and store the response.

![proxy_cache](images/image-4.png)

![caching](images/image-5.png)

### A single entrypoint

Imagine we have 100's of servers of an online banking app or a social network like facebook. 

That makes those servers a pretty juicy target for hackers, like personal data, banking data, etc...


Imagine you exposed all 100's servers to public access... all those requests would be able to directly hit each of the web servers...

![one_entrypoint](images/image-6.png)

We want to reduce the risk by providing only one server that is publicly acessible. We can put all our security efforts into one server instead of 100's.

Having only one entrypoint (the proxy) as publicly acessible reduces the secuirty attack surface tremendously and acts like a shield or security layer.

![proxy_entrypoin](images/image-7.png)

### Encrypted communications

![encrypted_ssl](images/image-9.png)

One very important security measure is encrypted communication.

- NGINX can handle SSL/TLS encryption and decryption

The browser will send encrypted message to the proxy - which means, even if attacker intercepts message, they can't read it - only the proxy server can decrypt it or for added security (when proxy acts as shield) it will pass that encrypted message into the web servers.

We can configure the proxy to deny any requests that is not encrypted and only accept encrypted requests.

![encrypted_communication](images/image-10.png)

### Compression

Now, imagine NetFlix - which , by the way , uses NGINX on it's backend - has millions of users and millions of requests for videos on it's webservers.

![Netflix_nginx](images/image-11.png)

Millions of requests are sent for a high quality video to NetFlix. Imagine if NGINX proxy server would have to send back the entire high bquality video to millions of users at once (that's a lot of bandwidth - imagine how long it would take) and that's where compressions helps.

![nginx_compression](images/image-12.png)

NGINX proxy can also BE CONFIGURED TO COMPRESS LARGE IMAGES OR VIDEO FILES TO SAVE BANDWIDTH , BOTH ON THE receiving end and on the server side.

It also support chuncking (segmentation - sending response in chuncks)

![chuncking_nginx](images/image-13.png)


# How to setup NGINX

Using NGINX configuration

![nginx.conf](images/image-14.png)

Here you define wether you want your NGINX to act as a web server or a proxy server by configuring where it should forward the traffic to or if it should handle it itself. 

![nginx_configuration_file](images/image-15.png)

![location_directive_nginx](images/image-16.png)


Here, we redirect all traffic received in port 80 (http) to 443 (https) and we serve content over SSL/TLS (configured):

<img width="896" alt="image" src="https://github.com/user-attachments/assets/19e9fac0-7695-4b0d-9d7e-263910f804bf">


On the next image, we configure load balancing to multiple backend servers and within that configuration you can define which load balancing algo to use..

<img width="1117" alt="image" src="https://github.com/user-attachments/assets/87c48ff1-b185-4e0c-80c3-0c0a3784f902">

On the next one, you can see the caching configuration example:

<img width="1675" alt="image" src="https://github.com/user-attachments/assets/b271aa3a-90e7-414e-8792-222dcbb8ccf9">

You can see the full list of all configuration blocks and directives here:

https://nginx.org/en/docs/

### NGINX in Kubernetes - NGINX as k8'S ingress controller

<img width="1660" alt="image" src="https://github.com/user-attachments/assets/4ae1444b-0a0f-448c-82fb-aa6cd81c8968">

<img width="1615" alt="image" src="https://github.com/user-attachments/assets/90b072d2-80c1-48fd-ab54-a766d6e14f6f">


NGINX ingress controller is used inside the cluster, so unlike the proxy for web servers it is not publicly acessible, so you can't acess the NGINX ingress controller from the browser, it lives inside the cluster.

<img width="1592" alt="image" src="https://github.com/user-attachments/assets/643a5c91-431d-4276-acca-8d1a4fb0aee3">


Who gets the request from public ? It's the cloud load balancer. 

This is important because it adds a security layer to those requests. so, the cluster component is never directly exposed to public access.

The ELB (aws load balancer), forwards to the ingress controller within the cluster, which then routes the traffic based on intelligent logic to different applications within the cluster.

<img width="1213" alt="image" src="https://github.com/user-attachments/assets/99f284eb-c89c-4915-96e5-b25dba96111d">

# NGINX configuration file (nginx.conf)

The `nginx.conf` file is the main configuration file for **NGINX**, controlling how it handles requests, serves content, and communicates with clients. Here's a brief overview:

---

### **Structure of `nginx.conf`**
The file is organized into **directives** and **blocks**, structured hierarchically:

1. **Main Context**: 
   - Global settings that affect the entire NGINX instance.
   - Example: Worker processes, logging paths, and file locations.
   - Example:
     ```nginx
     worker_processes 4;
     error_log /var/log/nginx/error.log;
     ```

2. **Events Context**:
   - Handles connection-related settings.
   - Example:
     ```nginx
     events {
         worker_connections 1024;
     }
     ```

3. **HTTP Context**:
   - Configures web server behavior, including serving HTTP content and reverse proxying.
   - Contains nested blocks:
     - **Server Block**: Defines server-specific settings like domains and ports.
     - **Location Block**: Defines URL-specific settings.
   - Example:
     ```nginx
     http {
         include /etc/nginx/mime.types;
         server {
             listen 80;
             server_name example.com;

             location / {
                 root /var/www/html;
                 index index.html;
             }
         }
     }
     ```

4. **Stream Context** (optional):
   - Handles TCP/UDP proxying (for non-HTTP traffic).
   - Example:
     ```nginx
     stream {
         server {
             listen 12345;
             proxy_pass backend:12345;
         }
     }
     ```

---

### **Key Directives**
1. **Worker Processes**:
   - `worker_processes`: Number of worker processes for handling requests.

2. **Server and Port**:
   - `server_name`: Defines the domain(s) the server responds to.
   - `listen`: Specifies the port (e.g., `80` for HTTP, `443` for HTTPS).

3. **Root and Index**:
   - `root`: Specifies the document root.
   - `index`: Defines the default file (e.g., `index.html`) for requests.

4. **Reverse Proxy**:
   - `proxy_pass`: Forwards client requests to another server (backend).
   - Example:
     ```nginx
     location /api/ {
         proxy_pass http://backend_server;
     }
     ```

5. **Logging**:
   - `access_log`: Logs access requests.
   - `error_log`: Logs errors.

---

### **What’s Most Important About `nginx.conf`**
1. **Modularity**:
   - It can include other configuration files, typically stored in `/etc/nginx/conf.d/` or `/etc/nginx/sites-enabled/`.

2. **Flexibility**:
   - Can handle multiple domains (virtual hosts) and URL-specific rules.

3. **Optimization**:
   - Configure caching, gzip compression, and worker connections for performance.

4. **Security**:
   - Supports HTTPS, rate limiting, and access control.

5. **Error Handling**:
   - Custom error pages can be defined for specific status codes.

By understanding and correctly configuring `nginx.conf`, you can tailor NGINX to meet the needs of your application efficiently and securely.

![image](https://github.com/user-attachments/assets/f7b292a6-b699-4304-8ac8-05c5242c63ee)

![image](https://github.com/user-attachments/assets/6b8ac71b-a0b3-46df-b28d-05892b7caf9c)

![image](https://github.com/user-attachments/assets/6d97ad53-2b33-4b9a-a861-63b9a4a6b6cf)

![image](https://github.com/user-attachments/assets/47550d00-13f7-4dfb-a283-6abd7d627603)

![image](https://github.com/user-attachments/assets/82b91341-16b0-4e5b-9997-35c3aa8fe112)

![image](https://github.com/user-attachments/assets/8ae9c98e-f3ec-406b-8e09-23919b2c2937)

![image](https://github.com/user-attachments/assets/93a74c95-d33e-485f-9921-8026e8611c15)

![image](https://github.com/user-attachments/assets/ee46bae1-9f99-4593-93a9-d623be3ca94d)



# Enabling SSL/TLS encryption

1- Obtain an SSL/TLS certificate

![image](https://github.com/user-attachments/assets/b3222492-b512-44ff-a935-98bf80e96fc5)

The certificate validates the server and contains a punlic key that client can use to talk to the server.

Ways of generating certificate:

1 - A self-signed certificate
  - Generated and signed by the server itself.
  - Useful for testing or internal sites, but not recommended for production.

2 - CA signed certificate
  - Issued and authenticated by a trsuted certificate authority.
  - CA verifies the identity of the organization requesting the certificate.

![image](https://github.com/user-attachments/assets/98537ab8-68b5-4298-929c-85f0e312c575)


![image](https://github.com/user-attachments/assets/2536810a-55dc-4542-b3b6-9ceac47ebcad)

![image](https://github.com/user-attachments/assets/ae088b2f-2655-4201-a949-6c7e7b708eb5)
