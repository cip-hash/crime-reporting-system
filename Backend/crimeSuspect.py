import pandas as pd
import streamlit as st

# Custom CSS for enhanced styling
st.markdown("""
    <style>
    .main {
        background-color: #f0f2f6;
    }
    .stTitle {
        color: #2c3e50;
        text-align: center;
        font-weight: bold;
    }
    .stDataFrame {
        border: 2px solid #3498db;
        border-radius: 10px;
    }
    .stTextInput > div > div > input {
        background-color: #ecf0f1;
        border: 2px solid #3498db;
        border-radius: 8px;
    }
    .stWarning, .stInfo {
        border-radius: 8px;
        font-weight: 500;
    }
    </style>
    """, unsafe_allow_html=True)

# Load the dataset
# df = pd.read_csv("C:/Users/admin/Documents/Suspect dataset - Sheet1.csv")

df = pd.read_csv("./data/Suspect_dataset.csv")

def find_suspect(crime_type=None, identifying_mark=None, complexion=None, last_known_address=None):
    """Filter suspects based on optional criteria."""
    suspects = df.copy()  # Start with the full dataset
    # Apply filters only if provided
    if crime_type:
        suspects = suspects[suspects["Types of Crimes"].str.contains(crime_type, case=False, na=False)]
    if identifying_mark:
        suspects = suspects[suspects["Identifying Mark"].str.contains(identifying_mark, case=False, na=False)]
    if complexion:
        suspects = suspects[suspects["Complexion"].str.contains(complexion, case=False, na=False)]
    if last_known_address:
        suspects = suspects[suspects["Last Known Address"].str.contains(last_known_address, case=False, na=False)]
    if suspects.empty:
        return None  # Return None if no matches are found
    # Select specific columns for display
    suspect_info = suspects[["Name", "Age", "Height", "Weight", "Eye Color",
                             "Hair Color", "Identifying Mark", "Last Known Address"]]
    return suspect_info  # Return the filtered DataFrame

# Streamlit chatbot interface
st.title("👮‍♂️ Crime Suspect Finder")

# Create two columns for input fields
col1, col2 = st.columns(2)

with col1:
    crime_type = st.text_input("Crime Type:")
    identifying_mark = st.text_input("Identifying Marks:")

with col2:
    complexion = st.text_input("Complexion:")
    last_known_address = st.text_input("Last Known Address:")

# Search button
search_button = st.button("🔍 Search Suspects")

# Display results when search button is clicked
if search_button:
    if any([crime_type, identifying_mark, complexion, last_known_address]):
        results = find_suspect(crime_type, identifying_mark, complexion, last_known_address)
        if results is not None:
            st.write("### 🕵️ Matching Suspects:")
            st.dataframe(results, use_container_width=True)
        else:
            st.warning("❌ No matching suspects found.")
    else:
        st.info("Please enter at least one search criteria.")