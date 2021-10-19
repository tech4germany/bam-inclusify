## Installing with Anaconda/Miniconda

1. Create and activate a new virtual environment: 
    - With Anaconda/Miniconda: 
      ```
      conda create --name inclusify --channel conda-forge python=3.9 pip && conda activate inclusify
      ```
    - With Python 3.9: 
      ```
      python3.9 -m venv .venv && source .venv
      ```
2. Inside the environment, use pip for installing the dependencies: 
  ```
  pip install -r requirements.in
  ```
  (This is also for Anaconda/Miniconda environments, because not all of our dependencies are published in Anaconda channels.)
3. Start the server with gunicorn: 
  ```
  gunicorn server.wsgi:app --bind localhost:8081 --timeout 90
  ``` 
  (Any desired port can be specified here.)
