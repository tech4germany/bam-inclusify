## Installation

For reproducibility, best use a virtual environment. For this, execute the following steps on the command line, from the folder where this file is also located.

1. Create an empty virtual environment in the `.venv` directory:

```
python3.9 -m venv .venv
```

2. Open the environment in your command line instance:

```
source .venv/bin/activate
```

3. Install tools to make installing libraries more efficient:

```
pip install -U pip wheel setuptools
```

4. Install the project dependencies at the correct versions into the virtual environment:

```
pip install -r requirements.txt
```

5. Finished! Now you can run, for example, `python main.py`. When you come back after closing your command line window, you will need to repeat step 3 to load the virtual environment again.