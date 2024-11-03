from dotenv import load_dotenv
import os

load_dotenv()
class FileServerOperations:
    root_directory = os.getenv("FILE_SERVER_ROOT_STORE")
    def __init__(self):
        if not os.path.exists(self.root_directory):
            os.makedirs(self.root_directory)
    
    def get_directory_size(self, directory):
        """Returns the `directory` size in bytes."""
        total = 0
        try:
            # print("[+] Getting the size of", directory) 
            for entry in os.scandir(directory):
                if entry.is_file(): 
                    # if it's a file, use stat() function
                    total += entry.stat().st_size
                elif entry.is_dir(): 
                    # if it's a directory, recursively call this function
                    try:
                        total += self.get_directory_size(entry.path)
                    except FileNotFoundError:
                        pass
        except NotADirectoryError:
            # if `directory` isn't a directory, get the file size then
            return os.path.getsize(directory)
        except PermissionError:
            # if for whatever reason we can't open the folder, return 0
            return 0
        return total
