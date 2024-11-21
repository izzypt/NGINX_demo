# NGINX

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


NGINX ingress controller is used inside the cluster, so unlike the proxy for web servers it is not publicly acessible
