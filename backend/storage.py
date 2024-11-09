from dotenv import load_dotenv
import os
from pathlib import Path
from typing import List, Dict, Union

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
    
    def count_files_and_folders(self, directory):
        total_files = 0
        total_folders = 0
        
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            
            if os.path.isfile(item_path):
                total_files += 1
            elif os.path.isdir(item_path):
                total_folders += 1
                
                # Recursively count files and folders in subdirectories
                sub_files, sub_folders = self.count_files_and_folders(item_path)
                total_files += sub_files
                total_folders += sub_folders
        
        return total_files, total_folders
    
    def scan_directory(self, directory_path: str, include_hidden: bool = False) -> List[Dict[str, Union[str, str]]]:
        
        results = []
        
        try:
            directory = Path(f"{self.root_directory}/{directory_path}") 
            # Check if directory exists
            if not directory.exists():
                raise FileNotFoundError(f"Directory not found: {directory_path}")
        
            for item in directory.iterdir():
                # Skip hidden files/folders if not included
                if not include_hidden and item.name.startswith('.'):
                    continue
                
                item_info = {
                    'name': item.name,
                    'path': str(item.relative_to(self.root_directory)),
                    'type': 'directory' if item.is_dir() else 'file'
                }
                
                if item.is_file():
                    item_info.update({
                        'size': item.stat().st_size,
                        'extension': item.suffix[1:] if item.suffix else ''
                    })
                
                results.append(item_info)
            
            
        except PermissionError:
            raise PermissionError(f"Permission denied: Cannot access {directory_path}")
        except Exception as e:
            raise Exception(f"Error scanning directory: {str(e)}")
        
        return results
    
    
    def delete_directory(self, directory_path: str):
        try:
            directory = Path(f"{self.root_directory}/{directory_path}")
            if not directory.exists():
                raise FileNotFoundError(f"Directory not found: {directory_path}")
            
            # Delete directory
            directory.rmdir()
            return directory_path
            
        except PermissionError:
            raise PermissionError(f"Permission denied: Cannot delete {directory_path}")
        except Exception as e:
            raise Exception(f"Error deleting directory: {str(e)}")