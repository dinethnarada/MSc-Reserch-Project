# MSc_Research

# Backend

How to run on VM

- create a new VM with GPU
    - install cuda driver - `curl -O https://raw.githubusercontent.com/GoogleCloudPlatform/compute-gpu-installation/main/linux/install_gpu_driver.py`
    - Run the Installation Script - `sudo python3 install_gpu_driver.py`
    - Check GPU State - `nvidia-smi`

- SSH to the VM
    - Install python
    `sudo apt-get update`
    `sudo apt-get install -y python3 python3-pip python3-venv git`
    - Upload this main.py and requirment.txt
    - Set up the environment
    `python3 -m venv venv`
    `source venv/bin/activate`
    `pip install -r requirements.txt`
    - Install Gunicorn - `pip install gunicorn`
    - Run the Server
    `gunicorn -w 1 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8080 main:app --daemon`



