from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in body_fitness/__init__.py
from body_fitness import __version__ as version

setup(
	name="body_fitness",
	version=version,
	description="Body Fitness",
	author="Eagle Softwares Company",
	author_email="info@eagle.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
