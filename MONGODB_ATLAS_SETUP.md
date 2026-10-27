# MongoDB Atlas setup for Smart Campus Clinic

## 1. Create or use an Atlas cluster
- Sign in to MongoDB Atlas.
- Create or open a cluster.
- In the cluster dashboard, click Database Access.
- Create a database user with a username and strong password.

## 2. Allow network access
- Go to Network Access.
- Add your current IP address.
- For local development, also add 0.0.0.0/0 if you want to allow all IPs temporarily.
- For production, add only the real server IPs.

## 3. Use this connection format
Use a URI like this in your environment:

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.tb1iw3i.mongodb.net/campus-clinic?retryWrites=true&w=majority

## 4. Required Atlas values
- Cluster name: cluster0
- Database name: campus-clinic
- Username: your Atlas database user
- Password: your Atlas database password

## 5. Important notes
- The username and password must not contain reserved characters without URL encoding.
- If your password contains @, /, :, or ?, encode it.
- If the app still fails, verify that the database user has readWrite access to campus-clinic.
- If the cluster is in a different region, the hostname may differ from cluster0.tb1iw3i.mongodb.net.
